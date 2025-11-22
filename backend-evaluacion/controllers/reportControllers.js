const ReportServices = require('../services/reportServices');
const services = new ReportServices();

// Almacenamiento temporal de definiciones de documentos (en producción usaría Redis)
const reportCache = new Map();

const getReport = async (req, res) => {
    try {
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
        res.status(500).json(error);
    }
}

const getReportWithAI = async (req, res) => {
    try {
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
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
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