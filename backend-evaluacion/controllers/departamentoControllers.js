const DepartamentoServices = require("../services/departamentoServices")
const services = new DepartamentoServices()

const getAllDepartamentos = async (req, res) => {
    try {
        const departamentos = await services.getAllDepartamentos()
        if (departamentos.length === 0) return res.status(404).json({ ok: false, data: [], message: "No se encontraron departamentos." });
        res.status(200).json({ ok: true, data: departamentos, message: "Departamentos obtenidos exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
    }
}

const getDepartamentoById = async (req, res) => {
    try {
        const departamento = await services.getDepartamentoById(req.params.id)
        if (!departamento) return res.status(404).json({ ok: false, data: null, message: "Departamento no encontrado." });
        res.status(200).json({ ok: true, data: departamento, message: "Departamento obtenido exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
    }
}

const createDepartamento = async (req, res) => {
    try {
        const { nombre } = req.body
        if (!nombre) {
            return res.status(400).json({ ok: false, data: null, message: "El nombre del departamento es requerido." })
        }
        const result = await services.createDepartamento(req.body)
        res.status(201).json({ ok: true, data: result, message: "Departamento creado exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(400).json({ ok: false, data: null, message: "Error al crear departamento." })
    }
}

const updateDepartamento = async (req, res) => {
    try {
        const departamento = await services.updateDepartamento(req.params.id, req.body)
        if (!departamento) return res.status(404).json({ ok: false, data: null, message: "Departamento no encontrado para actualizar." });
        res.status(200).json({ ok: true, data: departamento, message: "Departamento actualizado exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
    }
}

const deleteDepartamento = async (req, res) => {
    try {
        const departamento = await services.deleteDepartamento(req.params.id)
        if (!departamento) return res.status(404).json({ ok: false, data: null, message: "Departamento no encontrado para eliminar." });
        res.status(200).json({ ok: true, data: null, message: "Departamento eliminado exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
    }
}

const getDepartamentoCount = async (req, res) => {
    try {
        const count = await services.getDepartamentoCount()
        res.status(200).json({ ok: true, data: count, message: "Conteo de departamentos obtenido." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
    }
}

module.exports = {
    getAllDepartamentos,
    getDepartamentoById,
    createDepartamento,
    updateDepartamento,
    deleteDepartamento,
    getDepartamentoCount
}
