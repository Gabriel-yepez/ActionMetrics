const userServices = require("../services/userServices")
const services = new userServices()
const { Op } = require("sequelize");
const { getDepartmentFilter } = require("../middleware/departmentFilter");

const getAllUsers = async (req, res)=>{

    try {
        const {search} = req.query
        const departamentoId = getDepartmentFilter(req);
        let filter = {};

        if (search) {
          filter = {
              [Op.or]: [
                  { nombre_usuario: { [Op.iLike]: `%${search}%` } },
                  { nombre: { [Op.iLike]: `%${search}%` } },
                  { apellido: { [Op.iLike]: `%${search}%` } },
                  { email: { [Op.iLike]: `%${search}%` } }
              ]
          };
      }

        if (departamentoId) {
            filter.id_departamento = departamentoId;
        }

        const users = await services.getAllUsers(Object.keys(filter).length > 0 ? filter : null)
        if (users.length === 0) return res.status(404).json({ ok: false, data: [], message: "No se encontraron usuarios." });
        res.status(200).json({ ok: true, data: users, message: "Usuarios obtenidos exitosamente." })
      } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
      }
}

const getByid = async (req, res)=>{

    try {
        const user = await services.getByid(req.params.id)
        if (!user) return res.status(404).json({ ok: false, data: null, message: "Usuario no encontrado." });
        res.status(200).json({ ok: true, data: user, message: "Usuario obtenido exitosamente." })
      } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
      }
}

const createUser = async (req, res)=>{

    try {
        const newUser = { ...req.body }

        // Si es gerente (id_rol=1), forzar el departamento del creador
        if (req.user.id_rol === 1) {
            newUser.id_departamento = req.user.id_departamento;
        }

        const result = await services.createUser(newUser)
        res.status(201).json({ ok: true, data: result, message: "Usuario creado exitosamente." })
      } catch (error) {
        console.log(error)
        res.status(400).json({ ok: false, data: null, message: "Error al crear usuario." })
      }
}

const updateUser = async (req, res)=>{

    try {
        const user = await services.updateUser(req.params.id, req.body)
        if (!user) return res.status(404).json({ ok: false, data: null, message: "Usuario no encontrado para actualizar." });
        res.status(200).json({ ok: true, data: user, message: "Usuario actualizado exitosamente." })
      } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
      }
}

const deleteUser = async (req, res)=>{

    try {
        const user = await services.deleteUser(req.params.id)
        if (!user) return res.status(404).json({ ok: false, data: null, message: "Usuario no encontrado para eliminar." });
        res.status(200).json({ ok: true, data: null, message: "Usuario eliminado exitosamente." })
      } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
      }
}

const getUserCount = async (req, res)=>{
    try {
        const departamentoId = getDepartmentFilter(req);
        const count = await services.getUserCount(departamentoId)
        res.status(200).json({ ok: true, data: count, message: "Conteo de usuarios obtenido." })
    } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
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
