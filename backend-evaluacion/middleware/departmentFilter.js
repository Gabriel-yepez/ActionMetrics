const { Usuario } = require('../db/sequelize')

/**
 * Resuelve el filtro de departamento según el rol del usuario.
 *
 * Super Admin (id_rol=3): Puede filtrar por cualquier departamento via query param, o ver todos.
 * Admin de departamento (id_rol=1): Siempre ve solo su departamento.
 * Empleado (id_rol=2): Siempre ve solo su departamento.
 */
function getDepartmentFilter(req) {
    // Super Admin puede ver todo o filtrar por query param
    if (req.user.id_rol === 3) {
        const deptId = req.query.departamento;
        return deptId ? parseInt(deptId) : null;
    }
    // Admin de departamento y empleados ven solo su departamento
    return req.user.id_departamento || null;
}

/**
 * Obtiene los IDs de usuarios que pertenecen a un departamento específico.
 */
async function getUserIdsByDepartment(departamentoId) {
    if (!departamentoId) return null;
    const users = await Usuario.findAll({
        where: { id_departamento: departamentoId },
        attributes: ['id'],
        raw: true
    });
    return users.map(u => u.id);
}

module.exports = { getDepartmentFilter, getUserIdsByDepartment }
