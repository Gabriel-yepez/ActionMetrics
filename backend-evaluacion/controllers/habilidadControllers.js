const HabilidadServices = require("../services/habilidadServices");
const { getScopedUserIds, canAccessEvaluacion } = require("../middleware/access");
const habilidadServices = new HabilidadServices();

const getHabilidad = async (req, res)=>{
    try {
        const userIds = await getScopedUserIds(req)
        const habilidad = await habilidadServices.getHabilidad(userIds)
        if (habilidad.length === 0) return res.status(404).json({ ok: false, data: [], message: "Habilidad no encontrada." });
        res.status(200).json({ ok: true, data: habilidad, message: "Habilidades obtenidas exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
    }
}

const deleteHabilidad = async (req, res)=>{
    try {
        const existente = await habilidadServices.getHabilidadById(req.params.id)
        if (existente && !(await canAccessEvaluacion(req.user, existente.id_evaluacion))) {
            return res.status(403).json({ ok: false, data: null, message: "Acceso denegado." })
        }
        const habilidad = await habilidadServices.deleteHabilidad(req.params.id)
        if (!habilidad) return res.status(404).json({ ok: false, data: null, message: "Habilidad no encontrada para eliminar." });
        res.status(200).json({ ok: true, data: null, message: "Habilidad eliminada exitosamente." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
    }
}

module.exports = {
        deleteHabilidad,
        getHabilidad
}
