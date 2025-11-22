const userServices = require("../services/userServices")
const services = new userServices()
const { Op } = require("sequelize");

const getAllUsers = async (req, res)=>{

    try {
        const {search} = req.query
        let filter = null;
        if (search) {
          // Construir un filtro dinámico para buscar en múltiples campos
          filter = {
              [Op.or]: [
                  { nombre_usuario: { [Op.iLike]: `%${search}%` } },
                  { nombre: { [Op.iLike]: `%${search}%` } },
                  { apellido: { [Op.iLike]: `%${search}%` } },
                  { email: { [Op.iLike]: `%${search}%` } }
              ]
          };
      }

        const users = await services.getAllUsers(filter)
        if (users.length === 0) return res.status(404).json({ message: "no users Found." });
        res.status(200).json(users)
      } catch (error) {
        console.log(error)
        res.stattus(500).json(error)
      }
}

const getByid = async (req, res)=>{

    try {
        const user = await services.getByid(req.params.id)
        if (!user) return res.status(404).json({ message: "user not Found." });
        res.status(200).json(user)
      } catch (error) {
        console.log(error)
        res.stattus(500).json(error)
      }
}

const createUser = async (req, res)=>{

    try {
        const newUser = req.body
        const result = await services.createUser(newUser)
        res.status(201).json(result)
      } catch (error) {
        console.log(error)
        res.status(400).json(error)
      }
}

const updateUser = async (req, res)=>{

    try {
        const user = await services.updateUser(req.params.id, req.body)
        if (!user) return res.status(404).json({ message: "user not Found for update." });
        res.status(200).json(user)
      } catch (error) {
        console.log(error)
        res.status(500).json(error)
      }
}

const deleteUser = async (req, res)=>{

    try {
        const user = await services.deleteUser(req.params.id)
        if (!user) return res.status(404).json({ message: "user not Found for delete." });
        res.status(200).json(user)
      } catch (error) {
        console.log(error)
        res.status(500).json(error)
      }
}

const getUserCount = async (req, res)=>{
    try {
        const count = await services.getUserCount()
        if (!count) return res.status(404).json({ message: "no users Found.", count });
        res.status(200).json(count)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

module.exports = {
    getAllUsers,
    getByid,
    createUser,
    updateUser,
    deleteUser,
    getUserCount
};