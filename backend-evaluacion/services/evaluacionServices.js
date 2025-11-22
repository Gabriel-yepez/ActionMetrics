const {Evaluacion}= require('../db/sequelize')

class EvaluacionServices{

    async getEvaluacionCount(){
        const count= await Evaluacion.count()
        return count
    }
    
    async getEvaluacionCountByUser(userId){
        const count = await Evaluacion.count({
            where: { id_usuario: userId }
        })
        return count
    }

    async getAllEvaluacion(){
        const evaluacion= await Evaluacion.findAll()
        return evaluacion
    }
    
    async createEvaluacion (evaluacionData){
        const evaluacion = await Evaluacion.create(evaluacionData);
        return evaluacion;
    }

    async updateEvaluacion(id){
        const evaluacion = await Evaluacion.findByPk(id);
        const estado=true
        if (evaluacion) {
            // Asegúrate de pasar un objeto con los campos a actualizar
            const updatedEvaluacion = await evaluacion.update({ estado });
            return updatedEvaluacion;
        }
    }

    async deleteEvaluacion(id){
        const evaluacion = await Evaluacion.findByPk(id);
        if(evaluacion){
            const borrar = await evaluacion.destroy()
            return borrar !== null
        }
        return evaluacion
    }
}

module.exports = EvaluacionServices