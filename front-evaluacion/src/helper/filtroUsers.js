
export function filtrarUsuariosEmpleados(usuarios) {
  return usuarios ? usuarios.filter(usuario => usuario.id_rol === 2) : [];
}