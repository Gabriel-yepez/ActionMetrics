const {Departamento}= require('../db/sequelize')

class DepartamentoServices{

    async createDepartamento(departamento){
        const newDepartamento = await Departamento.create(departamento)
        return newDepartamento
    }

    async getAllDepartamentos(){
        const departamentos = await Departamento.findAll()
        return departamentos
    }

    async getDepartamentoById(id){
        const departamento = await Departamento.findByPk(id)
        return departamento
    }

    async updateDepartamento(id, data){
        const departamento = await Departamento.findByPk(id)

        if(departamento){
            const updatedDepartamento = await departamento.update(data)
            return updatedDepartamento
        }
        return departamento
    }

    async deleteDepartamento(id){
        const departamento = await Departamento.findByPk(id)
        if(departamento){
            const borrar = await departamento.destroy()
            return borrar !== null
        }
        return departamento
    }

    async getDepartamentoCount(){
        const count = await Departamento.count()
        return count
    }
}

module.exports = DepartamentoServices
