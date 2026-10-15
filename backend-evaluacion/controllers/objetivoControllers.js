const ObjetivoServices = require("../services/objetivoServices");
const { canAccessUser, canAccessObjetivo, getObjetivosWhere } = require("../middleware/access");
const services = new ObjetivoServices();

const accesoDenegado = (res) =>
    res.status(403).json({ ok: false, data: null, message: "Acceso denegado." });

const getAllObjetivos = async (req, res) => {
    try {
        const objetivos = await services.getAllObjetivos(null, await getObjetivosWhere(req));
        if (objetivos.length === 0)
            return res.status(404).json({ ok: false, data: [], message: "No se encontraron objetivos." });
        res.status(200).json({ ok: true, data: objetivos, message: "Objetivos obtenidos exitosamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" });
    }
};

const getObjetivoById = async (req, res) => {
    try {
        const objetivo = await services.getObjetivoById(req.params.id);
        if (!objetivo)
            return res.status(404).json({ ok: false, data: null, message: "Objetivo no encontrado." });
        if (!(await canAccessObjetivo(req.user, objetivo))) return accesoDenegado(res);
        res.status(200).json({ ok: true, data: objetivo, message: "Objetivo obtenido exitosamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" });
    }
};

const createObjetivo = async (req, res) => {
    try {
        const newObjetivo = req.body;
        // Solo se asignan objetivos a usuarios del propio departamento
        if (!(await canAccessUser(req.user, newObjetivo.id_usuario))) return accesoDenegado(res);
        const result = await services.createObjetivo(newObjetivo);
        res.status(201).json({ ok: true, data: result, message: "Objetivo creado exitosamente." });
    } catch (error) {
        console.error(error);
        res.status(400).json({ ok: false, data: null, message: "Error al crear objetivo." });
    }
};

const updateObjetivoEstado = async (req, res) => {
    try {
        const existente = await services.getObjetivoById(req.params.id);
        if (!existente)
            return res.status(404).json({ ok: false, data: null, message: "Objetivo no encontrado para actualizar." });
        if (!(await canAccessObjetivo(req.user, existente))) return accesoDenegado(res);
        const objetivo = await services.updateObjetivoEstado(req.params.id, req.body);
        res.status(200).json({ ok: true, data: objetivo, message: "Objetivo actualizado exitosamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" });
    }
};

const deleteObjetivo = async (req, res) => {
    try {
        const existente = await services.getObjetivoById(req.params.id);
        if (existente && !(await canAccessObjetivo(req.user, existente))) return accesoDenegado(res);
        const objetivo = await services.deleteObjetivo(req.params.id);
        if (!objetivo)
            return res.status(404).json({ ok: false, data: null, message: "Objetivo no encontrado para eliminar." });
        res.status(200).json({ ok: true, data: null, message: "Objetivo eliminado exitosamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" });
    }
};

module.exports = {
    getAllObjetivos,
    getObjetivoById,
    createObjetivo,
    updateObjetivoEstado,
    deleteObjetivo
};
