const RetroalimentacionServices = require("../services/retroalimentacionServices")
const services = new RetroalimentacionServices()
const { Op } = require("sequelize");

const getAllRetroalimentaciones = async (req, res) => {
    try {
        const retroalimentaciones = await services.getAllRetroalimentaciones()
        if (retroalimentaciones.length === 0) return res.status(404).json({ message: "No se encontraron retroalimentaciones." });
        res.status(200).json(retroalimentaciones)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

const getRetroalimentacionById = async (req, res) => {
    try {
        const retroalimentacion = await services.getById(req.params.id)
        if (!retroalimentacion) return res.status(404).json({ message: "Retroalimentación no encontrada." });
        res.status(200).json(retroalimentacion)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

const createRetroalimentacion = async (req, res) => {
    try {
        const newRetroalimentacion = req.body
        // Agregar la fecha actual si no se proporciona
        if (!newRetroalimentacion.fecha) {
            newRetroalimentacion.fecha = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
        }
        const result = await services.createRetroalimentacion(newRetroalimentacion)
        res.status(201).json(result)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}

const updateRetroalimentacion = async (req, res) => {
    try {
        const retroalimentacion = await services.updateRetroalimentacion(req.params.id, req.body)
        if (!retroalimentacion) return res.status(404).json({ message: "Retroalimentación no encontrada para actualizar." });
        res.status(200).json(retroalimentacion)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

const deleteRetroalimentacion = async (req, res) => {
    try {
        const retroalimentacion = await services.deleteRetroalimentacion(req.params.id)
        if (!retroalimentacion) return res.status(404).json({ message: "Retroalimentación no encontrada para eliminar." });
        res.status(200).json({message: "Retroalimentación eliminada exitosamente."})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

const getRetroalimentacionesByUsuario = async (req, res) => {
    try {
        const retroalimentaciones = await services.getRetroalimentacionesByUsuario(req.params.id_usuario)
        if (retroalimentaciones.length === 0) return res.status(404).json({ 
            message: "No se encontraron retroalimentaciones para este usuario." 
        });
        res.status(200).json(retroalimentaciones)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

const getRetroalimentacionesByEvaluacion = async (req, res) => {
    try {
        const retroalimentaciones = await services.getRetroalimentacionesByEvaluacion(req.params.id_evaluacion)
        if (retroalimentaciones.length === 0) return res.status(404).json({ 
            message: "No se encontraron retroalimentaciones para esta evaluación." 
        });
        res.status(200).json(retroalimentaciones)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
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
