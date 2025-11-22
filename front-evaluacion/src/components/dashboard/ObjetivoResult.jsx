import { Card, CardContent, Typography, Box, CircularProgress, Tooltip, Modal, Button } from '@mui/material'
import ModalProgreso from './ModalProgreso'
import InfoIcon from '@mui/icons-material/Info'
import { useState } from 'react'
import { useSesionStore } from "@/store/sesionStore"

const ObjetivoResult = ({ porcentaje, peso, titulo, descripcion }) => {
  // Estado para controlar la apertura/cierre de la modal
  const [modalOpen, setModalOpen] = useState(false);
  const { usuario } = useSesionStore();

  // Manejadores para abrir y cerrar la modal
  const openModal = () => {
    setModalOpen(true);
  };
  
  const closeModal = () => {
    setModalOpen(false);
  };
  
  return (
    <>
      <Card sx={{ 
        width: '100%', 
        height: '100%',
        boxShadow: 'none',
        borderRadius: '0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <CardContent sx={{ 
          padding: '8px !important', 
          paddingBottom: '8px !important',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '4px'
        }}>
          <h1 className='font-bold text-2xl'>{titulo}</h1>
          {usuario && usuario.id_rol === 1 && 
            <Button 
              size="small"
              sx={{ 
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: '8px',
                color: '#2196F3',
              }}
              onClick={openModal}
            >
              Ver progreso
            </Button>
          }
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexGrow: 1
        }}>
          <Box sx={{ width: '70%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Cumplimiento actual
              </Typography>
              <Tooltip title={descripcion}>
                <InfoIcon fontSize="small" sx={{ color: 'text.disabled', fontSize: '0.9rem' }} />
              </Tooltip>
            </Box>
            
            <Box sx={{ 
              position: 'relative', 
              height: '24px', 
              backgroundColor: '#E3F2FD', 
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}>
              <Box 
                sx={{ 
                  height: '100%', 
                  width: `${porcentaje}%`, 
                  background: 'linear-gradient(90deg, #2196F3, #4076ff, #2196F3)',
                  backgroundSize: '200% 100%',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  transition: 'width 1s ease-in-out',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    backgroundSize: '200% 100%',
                  }
                }}
              >
              </Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  textShadow: '0px 0px 2px rgba(0,0,0,0.5)'
                }}
              >
                {porcentaje}%
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
              Peso
            </Typography>
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={38}
                thickness={4}
                sx={{ 
                  color: '#4CAF50',
                  position: 'relative',
                }}
              />
              <Typography 
                variant="caption" 
                component="div" 
                color="text.secondary"
                sx={{ 
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontWeight: 'bold'
                }}
              >
                {peso}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
    
      {/* Modal para mostrar el progreso */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        aria-labelledby="modal-progreso"
        aria-describedby="modal-detalle-progreso"
      >
        <ModalProgreso 
          titulo={titulo} 
          porcentaje={porcentaje}
          onClose={closeModal} 
        />
      </Modal>
    </>
  );
}

export default ObjetivoResult
