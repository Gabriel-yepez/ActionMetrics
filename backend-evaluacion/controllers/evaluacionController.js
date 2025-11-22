const EvaluacionServices = require("../services/evaluacionServices");
const HabilidadServices = require("../services/habilidadServices");
const PrinterServices = require("../services/printerServices");
const { getReportDefinitionById } = require('../controllers/reportControllers');
const { generarConteoGeneral, generarConteoUsuario } = require('../services/datosChart');

const evaluacionServices = new EvaluacionServices();
const habilidadServices = new HabilidadServices();
const printerServices = new PrinterServices();

const getEvaluacionCount = async (req, res)=>{

    try {
        const count = await evaluacionServices.getEvaluacionCount()
        if (!count) return res.status(404).json(count );
        res.status(200).json(count)
      } catch (error) {
        console.log(error)
        res.status(500).json(error)
      }
}

const getAllEvaluacion = async (req, res)=>{
    try {
        const evaluacion = await evaluacionServices.getAllEvaluacion()

        if(evaluacion.length === 0) return res.status(404).json({ message: "no evaluaciones Found."});
        res.status(200).json(evaluacion)
      } catch (error) {
        console.log(error)
        res.status(500).json(error)
      }
}

const createEvaluacion = async (req, res) => {
    try {
        const { reportId } = req.body;
        
        // Validar que se haya enviado un reportId
        if (!reportId) {
            return res.status(400).json({
                success: false,
                message: "Se requiere el ID del reporte previamente generado"
            });
        }
        
        // Obtener el reporte en caché
        const cachedReport = getReportDefinitionById(reportId);
        
        if (!cachedReport) {
            return res.status(404).json({
                success: false,
                message: "El reporte solicitado no existe o ha expirado. Genere un nuevo reporte."
            });
        }
        
        // Extraer los datos y la definición del documento
        const { docDefinition, reportData } = cachedReport;
        
        // Guardar el PDF y obtener la URL
        const pdfResult = await printerServices.savePdf(docDefinition, reportData.id_usuario, reportData.fecha);
        
        // 2. Luego crear la evaluación con la URL del PDF
        const evaluacionData = {
            fecha: reportData.fecha,
            comentario: reportData.comentarioEvaluacion || 'Sin comentarios',
            estado: false,
            url: pdfResult.fileUrl,
            id_usuario: reportData.id_usuario
        };
        
        const evaluacion = await evaluacionServices.createEvaluacion(evaluacionData);
        
        // 3. Finalmente crear la habilidad asociada
        
        const habilidadData = {
            puntuacion: reportData.puntuacion,
            comentario: reportData.comentarioHabilidad,
            id_evaluacion: evaluacion.id
        };
            
        const habilidad = await habilidadServices.createHabilidad(habilidadData);
              
        // Retornar respuesta 
        return res.status(201).json({
            success: true,
            message: "Evaluación creada exitosamente",
            evaluacion,
            reportUrl: pdfResult.fileUrl
        });
        
    } catch (error) {
        console.error('Error al crear evaluación:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error.message
        });
    }
}

const getEstadisticasGenerales = async (req, res) => {
  try {
    const estadisticasMensuales = await generarConteoGeneral();
    
    res.status(200).json({
      success: true,
      data: estadisticasMensuales
    });
  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

const getEstadisticasUsuario = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    
    if (!idUsuario) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID del usuario"
      });
    }
    
    const estadisticasUsuario = await generarConteoUsuario(idUsuario);
    
    res.status(200).json({
      success: true,
      data: estadisticasUsuario
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// Nuevo endpoint para que un empleado vea su total de evaluaciones
const getUserEvaluationCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID del usuario"
      });
    }

    // Obtener el conteo de evaluaciones para este usuario específico
    const evaluacionCount = await evaluacionServices.getEvaluacionCountByUser(userId);
    
    res.status(200).json(evaluacionCount);
  } catch (error) {
    console.error('Error al obtener conteo de evaluaciones del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

const deleteEvaluacion = async (req, res) => {
    try {
        const evaluacion = await evaluacionServices.deleteEvaluacion(req.params.id)
        if (!evaluacion) return res.status(404).json({ message: "Evaluación no encontrada para eliminar." });
        res.status(200).json({message: "Evaluación eliminada exitosamente."})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

module.exports = {
  getEvaluacionCount,
  getAllEvaluacion,
  createEvaluacion,
  getEstadisticasGenerales,
  getEstadisticasUsuario,
  getUserEvaluationCount,
  deleteEvaluacion
}