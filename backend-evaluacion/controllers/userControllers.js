const userServices = require("../services/userServices")
const services = new userServices()
const { getDepartmentFilter } = require("../middleware/departmentFilter");
const { ROL, isSuperAdmin, canAccessUser } = require("../middleware/access");

// Datos de compañeros visibles para un empleado (sin email ni cédula)
const ATRIBUTOS_PUBLICOS = ['id', 'nombre_usuario', 'nombre', 'apellido', 'id_rol', 'id_departamento']

const accesoDenegado = (res) =>
    res.status(403).json({ ok: false, data: null, message: "Acceso denegado." })

/**
 * Un admin de departamento solo gestiona usuarios de su departamento que no sean super admin.
 */
const puedeGestionarUsuario = (reqUser, target) => {
    if (isSuperAdmin(reqUser)) return true
    return reqUser.id_rol === ROL.ADMIN
        && !!reqUser.id_departamento
        && target.id_rol !== ROL.SUPER_ADMIN
        && target.id_departamento === reqUser.id_departamento
}

const getAllUsers = async (req, res)=>{

    try {
        const {search} = req.query
        const departamentoId = getDepartmentFilter(req);
        const filter = departamentoId ? { id_departamento: departamentoId } : null

        const esEmpleado = req.user.id_rol === ROL.EMPLEADO
        let users = await services.getAllUsers(filter, esEmpleado ? ATRIBUTOS_PUBLICOS : null)

        // Nombre, apellido y email están cifrados en la base de datos: la búsqueda se hace
        // sobre los datos ya descifrados. Un empleado no ve emails, así que tampoco busca por ellos.
        if (typeof search === 'string' && search) {
            const texto = search.toLowerCase()
            const campos = esEmpleado ? ['nombre_usuario', 'nombre', 'apellido'] : ['nombre_usuario', 'nombre', 'apellido', 'email']
            users = users.filter(user => campos.some(campo => String(user[campo] ?? '').toLowerCase().includes(texto)))
        }

        if (users.length === 0) return res.status(404).json({ ok: false, data: [], message: "No se encontraron usuarios." });
        res.status(200).json({ ok: true, data: users, message: "Usuarios obtenidos exitosamente." })
      } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
      }
}

const getByid = async (req, res)=>{

    try {
        if (!(await canAccessUser(req.user, req.params.id))) return accesoDenegado(res)
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

        // Si es gerente (id_rol=1), forzar el departamento del creador y no permitir crear super admins
        if (req.user.id_rol === ROL.ADMIN) {
            if (newUser.id_rol === ROL.SUPER_ADMIN) return accesoDenegado(res)
            if (!req.user.id_departamento) return accesoDenegado(res)
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
        const target = await services.getByid(req.params.id)
        if (!target) return res.status(404).json({ ok: false, data: null, message: "Usuario no encontrado para actualizar." });
        if (!puedeGestionarUsuario(req.user, target)) return accesoDenegado(res)

        const data = { ...req.body }
        if (!isSuperAdmin(req.user)) {
            // Un gerente no puede ascender a super admin ni mover usuarios de departamento
            if (data.id_rol === ROL.SUPER_ADMIN) return accesoDenegado(res)
            delete data.id_departamento
        }

        const user = await services.updateUser(req.params.id, data)
        res.status(200).json({ ok: true, data: user, message: "Usuario actualizado exitosamente." })
      } catch (error) {
        console.log(error)
        res.status(500).json({ ok: false, data: null, message: "Error interno del servidor" })
      }
}

const deleteUser = async (req, res)=>{

    try {
        const target = await services.getByid(req.params.id)
        if (!target) return res.status(404).json({ ok: false, data: null, message: "Usuario no encontrado para eliminar." });
        if (!puedeGestionarUsuario(req.user, target)) return accesoDenegado(res)

        await services.deleteUser(req.params.id)
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
