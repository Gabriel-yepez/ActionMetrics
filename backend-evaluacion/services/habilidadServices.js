const { ResultadoHabilidad, Evaluacion } = require('../db/sequelize')
const { Op } = require('sequelize')

class habilidadServices{
 
    async createHabilidad(habilidad){
        const newhabilidad = await ResultadoHabilidad.create(habilidad)
        return newhabilidad
    }

    // userIds: limita a resultados de evaluaciones de esos usuarios (null = todos)
    async getHabilidad(userIds = null){
        if (!userIds) return ResultadoHabilidad.findAll();
        const evaluaciones = await Evaluacion.findAll({
            where: { id_usuario: { [Op.in]: userIds } },
            attributes: ['id'],
            raw: true
        });
        return ResultadoHabilidad.findAll({
            where: { id_evaluacion: { [Op.in]: evaluaciones.map(e => e.id) } }
        });
    }

    async getHabilidadById(id){
        return ResultadoHabilidad.findByPk(id);
    }

    async deleteHabilidad(id){
        const habilidad = await ResultadoHabilidad.findByPk(id);
        if(habilidad){
            const borrar = await habilidad.destroy()
            return borrar !== null
        }
        return habilidad
    }
}

module.exports = habilidadServices