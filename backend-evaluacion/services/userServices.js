const {Usuario, Departamento}= require('../db/sequelize')

class UserServices{

    async createUser(user){
        const newUser = await Usuario.create(user)
        return newUser
    }

    async getAllUsers(filter = null){
        const options = {
            include: [{ model: Departamento, attributes: ['id', 'nombre'] }]
        }
        if(filter){
            options.where = filter
        }
        const users = await Usuario.findAll(options)
        return users
    }

    async getByid(id){
        const user = await Usuario.findByPk(id, {
            include: [{ model: Departamento, attributes: ['id', 'nombre'] }]
        })
        return user
    }

    async getUserByfield(field){
        const user = await Usuario.findOne({
            where: field,
            include: [{ model: Departamento, attributes: ['id', 'nombre'] }]
        })
        return user
    }

    async updateUser(id, data){
        const user = await Usuario.findByPk(id)

        if(user){

            const updatedUser = await user.update(data)
            return updatedUser
        }
       return user
    }

    async deleteUser(id){
        const user = await Usuario.findByPk(id)
        if(user){
            const borrar = await user.destroy()
            return borrar !== null
        }
        return user
    }

    async getUserCount(departamentoId = null){
        const where = {}
        if (departamentoId) {
            where.id_departamento = departamentoId
        }
        const count= await Usuario.count({ where })
        return count
    }

}

module.exports = UserServices