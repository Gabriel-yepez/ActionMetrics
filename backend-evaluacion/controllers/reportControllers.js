const ReportServices = require('../services/reportServices');
const { canAccessUser } = require('../middleware/access');
const services = new ReportServices();

const accesoDenegado = (res) =>
    res.status(403).json({ ok: false, data: null, message: "Acceso denegado." });

// Almacenamiento temporal de definiciones de documentos (en producción usaría Redis)
const reportCache = new Map();

// Limpieza periódica del caché cada 15 minutos para evitar memory leaks
const CACHE_EXPIRATION_MS = 30 * 60 * 1000; // 30 minutos
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of reportCache) {
        if (now - value.timestamp > CACHE_EXPIRATION_MS) {
            reportCache.delete(key);
        }
    }
}, 15 * 60 * 1000);

const getReport = async (req, res) => {
    try {
        // Solo reportes de usuarios a los que el evaluador tiene acceso
        if (!(await canAccessUser(req.user, req.body.id_usuario))) return accesoDenegado(res);

        // Generar un ID basado solo en usuario y fecha (igual para ambos tipos de reporte)
        const reportId = `reporte_${req.body.id_usuario}_${req.body.fecha}`;
        
        // Obtener la definición del documento y guardar una copia en caché
        const { docDefinition, pdfStream } = await services.getReportWithDefinition(req.body);
        
        // Guardar la definición del documento en caché para uso posterior
        reportCache.set(reportId, {
            docDefinition,
            reportData: req.body,
            timestamp: Date.now(),
            withAI: false
        });
        
        // Configurar cabeceras con el ID del reporte para que el frontend lo capture
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('X-Report-ID', reportId); // ID para recuperar esta definición exacta
        res.setHeader('Access-Control-Expose-Headers', 'X-Report-ID');

        // Enviar el PDF como antes
        pdfStream.pipe(res);
        pdfStream.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, data: null, message: "Error al generar el reporte" });
    }
}

const getReportWithAI = async (req, res) => {
    try {
        // Solo reportes de usuarios a los que el evaluador tiene acceso
        if (!(await canAccessUser(req.user, req.body.id_usuario))) return accesoDenegado(res);

        // Usar el mismo formato de ID que el reporte normal para sobreescribirlo
        const reportId = `reporte_${req.body.id_usuario}_${req.body.fecha}`;
        
        // Obtener la definición del documento y el stream PDF
        const { docDefinition, pdfStream } = await services.getReportWithAIAndDefinition(req.body);
        
        // Guardar la definición del documento en caché para uso posterior
        reportCache.set(reportId, {
            docDefinition,
            reportData: req.body,
            timestamp: Date.now(),
            withAI: true
        });
        
        // Configurar cabeceras con el ID del reporte para que el frontend lo capture
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('X-Report-ID', reportId); // ID para recuperar esta definición exacta
        res.setHeader('Access-Control-Expose-Headers', 'X-Report-ID');
        // Enviar el PDF como antes
        pdfStream.pipe(res);
        pdfStream.end();

    } catch (error) {
        console.error('Error al generar reporte con IA:', error);
        res.status(500).json({ ok: false, data: null, message: "Error al generar reporte con IA" });
    }
}

// Método para obtener un reporte de la caché por ID
const getReportDefinitionById = (reportId) => {
    if (!reportCache.has(reportId)) {
        return null;
    }
    
    const cachedReport = reportCache.get(reportId);
    
    // Verificar si el reporte ha expirado (30 minutos)
    const expirationTime = 30 * 60 * 1000; // 30 minutos en milisegundos
    if (Date.now() - cachedReport.timestamp > expirationTime) {
        reportCache.delete(reportId);
        return null;
    }
    
    return cachedReport;
};

module.exports = {
    getReport,
    getReportWithAI,
    getReportDefinitionById
};