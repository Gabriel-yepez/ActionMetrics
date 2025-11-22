import { Card, CardContent, Typography, Box, Divider, Button, Chip } from '@mui/material'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'
import FlagIcon from '@mui/icons-material/Flag'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {useUserStore} from '@/store/userStore'

const NotificacionesObjetivos = ({ objetivos }) => {
  const { users } = useUserStore();
  // Función para formatear la fecha de vencimiento
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha límite';
    
    try {
      // Convertir la cadena de fecha a un objeto Date
      const fechaObj = new Date(fecha);
      
      // Sumar un día a la fecha
      fechaObj.setDate(fechaObj.getDate() + 1);
      
      // Formatear la fecha en español
      return format(fechaObj, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return 'Fecha inválida';
    }
  };
  
  // Función para determinar el color de la notificación basado en la urgencia
  // (fecha más cercana = más urgente)
  const getUrgencyColor = (fechaVencimiento) => {
    if (!fechaVencimiento) return 'default';
    
    const hoy = new Date();
    const fechaObj = new Date(fechaVencimiento);
    const diferenciaDias = Math.ceil((fechaObj - hoy) / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias < 0) return 'error'; // Vencido
    if (diferenciaDias <= 3) return 'warning'; // A punto de vencer
    if (diferenciaDias <= 7) return 'info'; // Próximo a vencer
    return 'success'; // Tiempo suficiente
  };
  
  // Obtener el texto de urgencia según el color
  const getUrgencyText = (color) => {
    switch (color) {
      case 'error': return 'Retrasado';
      case 'warning': return 'Falta pocos días para que termine el objetivo';
      case 'info': return 'Tiene 7 dias para terminar el objetivo';
      case 'success': return 'En plazo';
      default: return 'Sin plazo';
    }
  };
  
  return (
    <div className="space-y-4">
      {objetivos.map((objetivo) => {
        const urgencyColor = getUrgencyColor(objetivo.fecha_fin);
        const urgencyText = getUrgencyText(urgencyColor);
        
        return (
          <Card key={objetivo.id} sx={{ 
            width: '100%',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            borderLeft: `5px solid ${
              urgencyColor === 'error' ? '#dc2626' : 
              urgencyColor === 'warning' ? '#ff9800' : 
              urgencyColor === 'info' ? '#3b82f6' : 
              urgencyColor === 'success' ? '#16a34a' : 
              '#9e9e9e'
            }`,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NotificationsActiveIcon 
                    sx={{ 
                      mr: 1,
                      color: urgencyColor === 'error' ? '#dc2626' : 
                      urgencyColor === 'warning' ? '#ff9800' : 
                      urgencyColor === 'info' ? '#3b82f6' : 
                      urgencyColor === 'success' ? '#16a34a' : 
                      '#9e9e9e'
                    }} 
                  />
                  <Typography variant="h6" component="h2" fontWeight="bold">
                    {objetivo.nombre}
                  </Typography>
                </Box>
                
                <Chip 
                  label={urgencyText} 
                  size="small"
                  color={urgencyColor !== 'default' ? urgencyColor : 'default'}
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {objetivo.descripcion}
              </Typography>
              
              <Divider sx={{ my: 1.5 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Fecha de culminación: {formatearFecha(objetivo.fecha_fin)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <FlagIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Tipo: {objetivo.id_tipo_objetivo === 1 ? 'General' : 'Individual'}
                  </Typography>
                </Box>
                
                {objetivo.id_tipo_objetivo === 2 && users && users.find(user => user.id === objetivo.id_usuario) && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Asignado a: {users.find(user => user.id === objetivo.id_usuario).nombre} {users.find(user => user.id === objetivo.id_usuario).apellido}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default NotificacionesObjetivos;
