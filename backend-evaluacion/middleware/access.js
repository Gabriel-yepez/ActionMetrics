const { Op } = require('sequelize')
const { Usuario, Evaluacion } = require('../db/sequelize')
const { getDepartmentFilter, getUserIdsByDepartment } = require('./departmentFilter')

/**
 * Reglas de autorización por recurso.
 *
 * Super Admin (id_rol=3): acceso a todo.
 * Admin de departamento (id_rol=1): datos de los usuarios de su departamento.
 * Empleado (id_rol=2): solo sus propios datos (y objetivos grupales de su departamento).
 */

const ROL = { ADMIN: 1, EMPLEADO: 2, SUPER_ADMIN: 3 }
const TIPO_OBJETIVO_GRUPAL = 1

const isSuperAdmin = (user) => user?.id_rol === ROL.SUPER_ADMIN
const isAdmin = (user) => user?.id_rol === ROL.ADMIN || isSuperAdmin(user)

/** Convierte a entero positivo o devuelve null. */
const toId = (value) => {
    const n = Number(value)
    return Number.isInteger(n) && n > 0 ? n : null
}

/** Departamento de un usuario (o undefined si no existe). */
async function getUserDepartment(userId) {
    const user = await Usuario.findByPk(userId, { attributes: ['id', 'id_departamento'] })
    return user ? user.id_departamento : undefined
}

/** ¿Puede el usuario autenticado acceder a los datos del usuario indicado? */
async function canAccessUser(reqUser, targetUserId) {
    const id = toId(targetUserId)
    if (!id || !reqUser) return false
    if (isSuperAdmin(reqUser) || reqUser.id === id) return true
    if (reqUser.id_rol !== ROL.ADMIN || !reqUser.id_departamento) return false
    return (await getUserDepartment(id)) === reqUser.id_departamento
}

/**
 * ¿Puede el usuario autenticado acceder a un objetivo?
 * Además de los datos propios, los empleados ven los objetivos grupales de su departamento.
 */
async function canAccessObjetivo(reqUser, objetivo) {
    if (!objetivo || !reqUser) return false
    if (isSuperAdmin(reqUser) || objetivo.id_usuario === reqUser.id) return true
    if (!reqUser.id_departamento) return false
    if (reqUser.id_rol !== ROL.ADMIN && objetivo.id_tipo_objetivo !== TIPO_OBJETIVO_GRUPAL) return false
    return (await getUserDepartment(objetivo.id_usuario)) === reqUser.id_departamento
}

/** ¿Puede el usuario autenticado acceder a una evaluación (por su id)? */
async function canAccessEvaluacion(reqUser, evaluacionId) {
    const id = toId(evaluacionId)
    if (!id) return false
    const evaluacion = await Evaluacion.findByPk(id, { attributes: ['id', 'id_usuario'] })
    return !!evaluacion && canAccessUser(reqUser, evaluacion.id_usuario)
}

/**
 * IDs de usuario visibles para el usuario autenticado (para filtrar listados).
 * null = sin filtro (solo super admin sin departamento seleccionado).
 */
async function getScopedUserIds(req) {
    if (req.user.id_rol === ROL.EMPLEADO) return [req.user.id]
    return getUserIdsByDepartment(getDepartmentFilter(req))
}

/**
 * Filtro `where` de objetivos visibles: los del departamento (o todos para super admin);
 * los empleados, solo los suyos y los grupales de su departamento.
 */
async function getObjetivosWhere(req) {
    const userIds = await getUserIdsByDepartment(getDepartmentFilter(req))
    const where = {}
    if (userIds) where.id_usuario = { [Op.in]: userIds }
    if (req.user.id_rol === ROL.EMPLEADO) {
        where[Op.or] = [{ id_usuario: req.user.id }, { id_tipo_objetivo: TIPO_OBJETIVO_GRUPAL }]
    }
    return where
}

module.exports = {
    ROL,
    TIPO_OBJETIVO_GRUPAL,
    isSuperAdmin,
    isAdmin,
    toId,
    canAccessUser,
    canAccessObjetivo,
    canAccessEvaluacion,
    getScopedUserIds,
    getObjetivosWhere,
}
