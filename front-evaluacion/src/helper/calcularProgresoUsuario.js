
export const calcularProgresoUsuario = (objetivos, usuario) => {
  // Si no hay objetivos, retornar 0%
  if (!objetivos || objetivos.length === 0) {
    return 0;
  }

  // Filtrar objetivos para obtener solo los completados
  const objetivosCompletados = objetivos.filter(obj => obj.estado_actual === "completado");
  
  // Calcular el porcentaje
  const totalObjetivos = objetivos.length;
  const porcentajeCompletado = totalObjetivos > 0 
    ? parseFloat(((objetivosCompletados.length / totalObjetivos) * 100).toFixed(0)) 
    : 0;
  
  return porcentajeCompletado;
};


export const actualizarProgresoUsuarios = (objetivos, usuarios, setUsuariosUnicos) => {
  // Crear un mapa para almacenar usuarios únicos por ID
  const usuariosMap = new Map();
  
  // Si no hay objetivos o usuarios disponibles, salir temprano
  if (!objetivos || !usuarios || !Array.isArray(objetivos) || !Array.isArray(usuarios)) {
    // Actualizar el estado con array vacío
    if (setUsuariosUnicos) {
      setUsuariosUnicos([]);
    }
    return;
  }
  
  // Agrupar objetivos por usuario
  usuarios.forEach(usuario => {

    if(usuario.id_rol === 2){
        // Filtrar objetivos del usuario actual
        const objetivosUsuario = objetivos.filter(obj => obj.id_usuario === usuario.id);

        //si la persona no tiene objetivos, no se agrega
        if(objetivosUsuario.length === 0) return
        // Calcular progreso para este usuario
        const progresoPromedio = calcularProgresoUsuario(objetivosUsuario, usuario);
        
        // Crear objeto con la información del usuario y su progreso
        usuariosMap.set(usuario.id, {
          id: usuario.id,
          nombre: `${usuario.nombre} ${usuario.apellido}`,
          progresoPromedio: progresoPromedio
        });
    }
  });
  
  // Convertir el mapa a array para el estado
  const usuariosArray = Array.from(usuariosMap.values());
  
  // Actualizar el estado
  if (setUsuariosUnicos) {
    setUsuariosUnicos(usuariosArray);
  }
};
