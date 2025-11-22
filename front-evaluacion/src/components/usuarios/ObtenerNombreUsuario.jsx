import React from 'react';
import Typography from '@mui/material/Typography';
import { useUsers } from '@/hooks/useQueries';

/**
 * Componente que muestra el nombre de un usuario basado en su ID u objeto
 * Busca el usuario en la lista de usuarios disponibles si es necesario
 */
const ObtenerNombreUsuario = ({ objetivo, typographyProps = {} }) => {
  // Usamos el hook de usuarios para tener acceso a la lista
  const usuariosQuery = useUsers();
  const usuarios = usuariosQuery.data?.users || [];
  
  // Función que realmente busca el nombre
  const buscarNombreUsuario = () => {
    
    // Buscar el usuario por ID en la lista de usuarios
    const idUsuario = objetivo.id_usuario || objetivo.userId;
    if (idUsuario && usuarios.length > 0) {
      const usuarioEncontrado = usuarios.find(u => u.id === idUsuario);
      if (usuarioEncontrado) {
        return `Responsable: ${usuarioEncontrado.nombre} ${usuarioEncontrado.apellido || ''}`;
      }
    }
    
    return idUsuario ? `Usuario ID: ${idUsuario}` : 'No asignado';
  };
  
  // Combinamos los estilos por defecto con los props pasados al componente
  const defaultStyles = { fontSize: '0.85rem', color: 'text.secondary' };
  const combinedStyles = { ...defaultStyles, ...typographyProps.sx };

  return (
    <Typography 
      component="span" 
      variant="subtitle1" 
      {...typographyProps}
      sx={combinedStyles}
    >
      {usuariosQuery.isLoading ? 'Cargando usuario...' : buscarNombreUsuario()}
    </Typography>
  );
};

export default ObtenerNombreUsuario;
