const ObjetivoServices = require("../services/ObjetivoServices");
const { getDepartmentFilter, getUserIdsByDepartment } = require("../middleware/departmentFilter");
const services = new ObjetivoServices();

const getAllObjetivos = async (req, res) => {
    try {
        const departamentoId = getDepartmentFilter(req);
        const userIds = await getUserIdsByDepartment(departamentoId);
        const objetivos = await services.getAllObjetivos(userIds);
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
        res.status(200).json({ ok: true, data: objetivo, message: "Objetivo obtenido exitosamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" });
    }
};

const createObjetivo = async (req, res) => {
    try {
        const newObjetivo = req.body;
        const result = await services.createObjetivo(newObjetivo);
        res.status(201).json({ ok: true, data: result, message: "Objetivo creado exitosamente." });
    } catch (error) {
        console.error(error);
        res.status(400).json({ ok: false, data: null, message: "Error al crear objetivo." });
    }
};

const updateObjetivoEstado = async (req, res) => {
    try {
        const objetivo = await services.updateObjetivoEstado(req.params.id, req.body);
        if (!objetivo)
            return res.status(404).json({ ok: false, data: null, message: "Objetivo no encontrado para actualizar." });
        res.status(200).json({ ok: true, data: objetivo, message: "Objetivo actualizado exitosamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" });
    }
};

const deleteObjetivo = async (req, res) => {
    try {
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
