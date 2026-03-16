const EvaluacionServices = require("../services/evaluacionServices");
const HabilidadServices = require("../services/habilidadServices");
const PrinterServices = require("../services/printerServices");
const { getReportDefinitionById } = require('../controllers/reportControllers');
const { generarConteoGeneral, generarConteoUsuario } = require('../services/datosChart');
const { getDepartmentFilter, getUserIdsByDepartment } = require('../middleware/departmentFilter');

const evaluacionServices = new EvaluacionServices();
const habilidadServices = new HabilidadServices();
const printerServices = new PrinterServices();

const getEvaluacionCount = async (req, res)=>{

    try {
        const departamentoId = getDepartmentFilter(req);
        const userIds = await getUserIdsByDepartment(departamentoId);
        const count = await evaluacionServices.getEvaluacionCount(userIds)
        res.status(200).json({ ok: true, data: count, message: "Conteo de evaluaciones obtenido." })
      } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
      }
}

const getAllEvaluacion = async (req, res)=>{
    try {
        const departamentoId = getDepartmentFilter(req);
        const userIds = await getUserIdsByDepartment(departamentoId);
        const evaluacion = await evaluacionServices.getAllEvaluacion(userIds)
        if(evaluacion.length === 0) return res.status(404).json({ ok: false, data: [], message: "No se encontraron evaluaciones." });
        res.status(200).json({ ok: true, data: evaluacion, message: "Evaluaciones obtenidas exitosamente." })
      } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
      }
}

const createEvaluacion = async (req, res) => {
    try {
        const { reportId } = req.body;

        if (!reportId) {
            return res.status(400).json({
                ok: false,
                data: null,
                message: "Se requiere el ID del reporte previamente generado"
            });
        }

        const cachedReport = getReportDefinitionById(reportId);

        if (!cachedReport) {
            return res.status(404).json({
                ok: false,
                data: null,
                message: "El reporte solicitado no existe o ha expirado. Genere un nuevo reporte."
            });
        }

        const { docDefinition, reportData } = cachedReport;

        const pdfResult = await printerServices.savePdf(docDefinition, reportData.id_usuario, reportData.fecha);

        const evaluacionData = {
            fecha: reportData.fecha,
            comentario: reportData.comentarioEvaluacion || 'Sin comentarios',
            estado: false,
            url: pdfResult.fileUrl,
            id_usuario: reportData.id_usuario
        };

        const evaluacion = await evaluacionServices.createEvaluacion(evaluacionData);

        const habilidadData = {
            puntuacion: reportData.puntuacion,
            comentario: reportData.comentarioHabilidad,
            id_evaluacion: evaluacion.id
        };

        const habilidad = await habilidadServices.createHabilidad(habilidadData);

        return res.status(201).json({
            ok: true,
            data: { evaluacion, reportUrl: pdfResult.fileUrl },
            message: "Evaluación creada exitosamente"
        });

    } catch (error) {
        console.error('Error al crear evaluación:', error);
        res.status(500).json({
            ok: false,
            data: null,
            message: "Error interno del servidor"
        });
    }
}

const getEstadisticasGenerales = async (req, res) => {
  try {
    const departamentoId = getDepartmentFilter(req);
    const userIds = await getUserIdsByDepartment(departamentoId);
    const estadisticasMensuales = await generarConteoGeneral(userIds);

    res.status(200).json({
      ok: true,
      data: estadisticasMensuales,
      message: "Estadísticas generales obtenidas exitosamente."
    });
  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    res.status(500).json({
      ok: false,
      data: null,
      message: "Error interno del servidor"
    });
  }
};

const getEstadisticasUsuario = async (req, res) => {
  try {
    const { idUsuario } = req.params;

    if (!idUsuario) {
      return res.status(400).json({
        ok: false,
        data: null,
        message: "Se requiere el ID del usuario"
      });
    }

    const estadisticasUsuario = await generarConteoUsuario(idUsuario);

    res.status(200).json({
      ok: true,
      data: estadisticasUsuario,
      message: "Estadísticas del usuario obtenidas exitosamente."
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del usuario:', error);
    res.status(500).json({
      ok: false,
      data: null,
      message: "Error interno del servidor"
    });
  }
};

const getUserEvaluationCount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        ok: false,
        data: null,
        message: "Se requiere el ID del usuario"
      });
    }

    const evaluacionCount = await evaluacionServices.getEvaluacionCountByUser(userId);

    res.status(200).json({ ok: true, data: evaluacionCount, message: "Conteo de evaluaciones del usuario obtenido." });
  } catch (error) {
    console.error('Error al obtener conteo de evaluaciones del usuario:', error);
    res.status(500).json({
      ok: false,
      data: null,
      message: "Error interno del servidor"
    });
  }
};

const deleteEvaluacion = async (req, res) => {
    try {
        const evaluacion = await evaluacionServices.deleteEvaluacion(req.params.id)
        if (!evaluacion) return res.status(404).json({ ok: false, data: null, message: "Evaluación no encontrada para eliminar." });
        res.status(200).json({ ok: true, data: null, message: "Evaluación eliminada exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
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
