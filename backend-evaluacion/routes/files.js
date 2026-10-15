const { Router } = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { Evaluacion } = require("../db/sequelize");
const { canAccessUser } = require("../middleware/access");
const { canAccessDocument } = require("../controllers/documentController");
const { DOCUMENTS_DIR, resolveSafePath } = require("../services/documentService");
const { REPORTS_DIR } = require("../services/printerServices");

/**
 * Archivos subidos y reportes PDF: antes eran públicos (express.static) y cualquiera
 * podía descargarlos adivinando el nombre. Ahora requieren sesión y permiso sobre el
 * objetivo/evaluación al que pertenecen. Las URLs no cambian (/document/..., /reports/...).
 *
 * @param {string[]} allowedOrigins orígenes del frontend autorizados a mostrarlos en un iframe
 */
module.exports = (allowedOrigins) => {
    const router = Router();
    const frameAncestors = ["'self'", ...allowedOrigins].join(" ");

    const sendProtectedFile = (res, filePath) => {
        // El frontend muestra estos archivos en iframes: permitir solo sus orígenes
        res.removeHeader("X-Frame-Options");
        res.setHeader("Content-Security-Policy", `frame-ancestors ${frameAncestors}`);
        res.setHeader("Cache-Control", "private, no-store");
        res.sendFile(filePath, (err) => {
            if (err && !res.headersSent) {
                res.status(err.status === 404 || err.code === "ENOENT" ? 404 : 500)
                    .json({ ok: false, data: null, message: "Archivo no encontrado" });
            }
        });
    };

    const notFound = (res) => res.status(404).json({ ok: false, data: null, message: "Archivo no encontrado" });

    router.get("/document/:fileName", verifyToken, async (req, res, next) => {
        try {
            const filePath = resolveSafePath(DOCUMENTS_DIR, req.params.fileName);
            if (!filePath || !(await canAccessDocument(req.user, req.params.fileName))) return notFound(res);
            sendProtectedFile(res, filePath);
        } catch (error) {
            next(error);
        }
    });

    router.get("/reports/:fileName", verifyToken, async (req, res, next) => {
        try {
            const { fileName } = req.params;
            const filePath = resolveSafePath(REPORTS_DIR, fileName);
            if (!filePath) return notFound(res);
            // El reporte pertenece a la evaluación que lo referencia
            const evaluacion = await Evaluacion.findOne({ where: { url: `/reports/${fileName}` }, attributes: ["id_usuario"] });
            if (!evaluacion || !(await canAccessUser(req.user, evaluacion.id_usuario))) return notFound(res);
            sendProtectedFile(res, filePath);
        } catch (error) {
            next(error);
        }
    });

    return router;
};
