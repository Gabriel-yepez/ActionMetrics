const RetroalimentacionServices = require("../services/retroalimentacionServices")
const services = new RetroalimentacionServices()

const getAllRetroalimentaciones = async (req, res) => {
    try {
        const retroalimentaciones = await services.getAllRetroalimentaciones()
        if (retroalimentaciones.length === 0) return res.status(404).json({ ok: false, data: [], message: "No se encontraron retroalimentaciones." });
        res.status(200).json({ ok: true, data: retroalimentaciones, message: "Retroalimentaciones obtenidas exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
    }
}

const getRetroalimentacionById = async (req, res) => {
    try {
        const retroalimentacion = await services.getById(req.params.id)
        if (!retroalimentacion) return res.status(404).json({ ok: false, data: null, message: "Retroalimentación no encontrada." });
        res.status(200).json({ ok: true, data: retroalimentacion, message: "Retroalimentación obtenida exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
    }
}

const createRetroalimentacion = async (req, res) => {
    try {
        const newRetroalimentacion = req.body
        if (!newRetroalimentacion.fecha) {
            newRetroalimentacion.fecha = new Date().toISOString().split('T')[0];
        }
        const result = await services.createRetroalimentacion(newRetroalimentacion)
        res.status(201).json({ ok: true, data: result, message: "Retroalimentación creada exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(400).json({ ok: false, data: null, message: "Error al crear retroalimentación." })
    }
}

const updateRetroalimentacion = async (req, res) => {
    try {
        const retroalimentacion = await services.updateRetroalimentacion(req.params.id, req.body)
        if (!retroalimentacion) return res.status(404).json({ ok: false, data: null, message: "Retroalimentación no encontrada para actualizar." });
        res.status(200).json({ ok: true, data: retroalimentacion, message: "Retroalimentación actualizada exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
    }
}

const deleteRetroalimentacion = async (req, res) => {
    try {
        const retroalimentacion = await services.deleteRetroalimentacion(req.params.id)
        if (!retroalimentacion) return res.status(404).json({ ok: false, data: null, message: "Retroalimentación no encontrada para eliminar." });
        res.status(200).json({ ok: true, data: null, message: "Retroalimentación eliminada exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
    }
}

const getRetroalimentacionesByUsuario = async (req, res) => {
    try {
        const retroalimentaciones = await services.getRetroalimentacionesByUsuario(req.params.idUsuario)
        if (retroalimentaciones.length === 0) return res.status(404).json({
            ok: false, data: [], message: "No se encontraron retroalimentaciones para este usuario."
        });
        res.status(200).json({ ok: true, data: retroalimentaciones, message: "Retroalimentaciones del usuario obtenidas exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
    }
}

const getRetroalimentacionesByEvaluacion = async (req, res) => {
    try {
        const retroalimentaciones = await services.getRetroalimentacionesByEvaluacion(req.params.idEvaluacion)
        if (retroalimentaciones.length === 0) return res.status(404).json({
            ok: false, data: [], message: "No se encontraron retroalimentaciones para esta evaluación."
        });
        res.status(200).json({ ok: true, data: retroalimentaciones, message: "Retroalimentaciones de la evaluación obtenidas exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
    }
}

module.exports = {
    getAllRetroalimentaciones,
    getRetroalimentacionById,
    createRetroalimentacion,
    updateRetroalimentacion,
    deleteRetroalimentacion,
    getRetroalimentacionesByUsuario,
    getRetroalimentacionesByEvaluacion
};
