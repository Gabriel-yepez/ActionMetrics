const { Objetivo } = require('../db/sequelize');
const { Op } = require('sequelize');

class ObjetivoServices {

    async createObjetivo(objetivo) {
        const newObjetivo = await Objetivo.create(objetivo);
        return newObjetivo;
    }

    async getAllObjetivos(userIds = null) {
        const where = {};
        if (userIds) {
            where.id_usuario = { [Op.in]: userIds };
        }
        const objetivos = await Objetivo.findAll({ where });
        return objetivos;
    }

    async getObjetivoById(id) {
        const objetivo = await Objetivo.findByPk(id);
        return objetivo;
    }

    async updateObjetivoEstado(id, estado) {
        const objetivo = await Objetivo.findByPk(id);
        const {estado_actual} = estado;

        if (objetivo) {
            // Asegúrate de pasar un objeto con los campos a actualizar
            const updatedObjetivo = await objetivo.update({ estado_actual });
            return updatedObjetivo;
        }
    }

    async deleteObjetivo(id) {
        const objetivo = await Objetivo.findByPk(id);

        if (objetivo) {
            const borrar = await objetivo.destroy();
            return borrar !== null;
        }

        return objetivo;
    }
}

module.exports = ObjetivoServices;