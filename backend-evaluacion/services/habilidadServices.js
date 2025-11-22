const { ResultadoHabilidad } = require('../db/sequelize')

class habilidadServices{
 
    async createHabilidad(habilidad){
        const newhabilidad = await ResultadoHabilidad.create(habilidad)
        return newhabilidad
    }

    async getHabilidad(){
        const habilidad = await ResultadoHabilidad.findAll();
        return habilidad
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