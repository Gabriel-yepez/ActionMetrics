const { Usuario } = require('../db/sequelize')

// Departamento inexistente: hace que los filtros no devuelvan resultados
const SIN_DEPARTAMENTO = -1

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
        const deptId = parseInt(req.query.departamento, 10);
        return deptId > 0 ? deptId : null;
    }
    // Admin de departamento y empleados ven solo su departamento.
    // Sin departamento asignado no ven datos (antes null = sin filtro = todo).
    return req.user.id_departamento || SIN_DEPARTAMENTO;
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
