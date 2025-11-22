const HabilidadServices = require("../services/habilidadServices");
const habilidadServices = new HabilidadServices();

const getHabilidad = async (req, res)=>{
    try {
        const habilidad = await habilidadServices.getHabilidad(req.params.id)
        if (habilidad.length === 0) return res.status(404).json({ message: "Habilidad no encontrada." });
        res.status(200).json(habilidad)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

const deleteHabilidad = async (req, res)=>{
    try {
        const habilidad = await habilidadServices.deleteHabilidad(req.params.id)
        if (!habilidad) return res.status(404).json({ message: "Habilidad no encontrada para eliminar." });
        res.status(200).json({message: "Habilidad eliminada exitosamente."})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

module.exports = {
        deleteHabilidad,
        getHabilidad
}
