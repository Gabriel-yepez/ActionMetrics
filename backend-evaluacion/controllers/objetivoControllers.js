const ObjetivoServices = require("../services/ObjetivoServices");
const services = new ObjetivoServices();

const getAllObjetivos = async (req, res) => {
    try {
        const objetivos = await services.getAllObjetivos();
        if (objetivos.length === 0) 
            return res.status(404).json({ message: "No objectives found." });
        res.status(200).json(objetivos);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

const getObjetivoById = async (req, res) => {
    try {
        const objetivo = await services.getObjetivoById(req.params.id);
        if (!objetivo) 
            return res.status(404).json({ message: "Objective not found." });
        res.status(200).json(objetivo);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

const createObjetivo = async (req, res) => {
    try {
        const newObjetivo = req.body;
        const result = await services.createObjetivo(newObjetivo);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(400).json(error);
    }
};

const updateObjetivoEstado = async (req, res) => {
    try {
        const objetivo = await services.updateObjetivoEstado(req.params.id, req.body);
        if (!objetivo) 
            return res.status(404).json({ message: "Objective not found for update." });
        res.status(200).json(objetivo);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

const deleteObjetivo = async (req, res) => {
    try {
        const objetivo = await services.deleteObjetivo(req.params.id);
        if (!objetivo) 
            return res.status(404).json({ message: "Objective not found for delete." });
        res.status(200).json({ message: "Objective deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

module.exports = {
    getAllObjetivos,
    getObjetivoById,
    createObjetivo,
    updateObjetivoEstado,
    deleteObjetivo
};