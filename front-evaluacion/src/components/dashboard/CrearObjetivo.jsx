import { useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { formatearFecha } from '@/services/formatearFecha'
import { useUsers, useCreateObjetivo } from '@/hooks/useQueries'
import ObtenerNombreUsuario from '@/components/usuarios/ObtenerNombreUsuario'
import { useSesionStore } from '@/store/sesionStore'
import { filtrarUsuariosEmpleados } from '@/helper/filtroUsers'
import { ordenarObjetivosPorFecha } from '@/helper/FiltrarFecha'
import { toast } from 'react-toastify'
import FileUploadButton from './FileUploadButton'
import 'react-toastify/dist/ReactToastify.css'
import BotonListo from './BotonListo'

export default function CrearObjetivo({titulo, descripcion, onAgregar, tipo , objetivos = [], isLoading = false, useExternalMutation = false}) {
  // useExternalMutation indica si se debe usar la mutación del componente padre (true) o la interna (false)
  const usuariosQuery = useUsers();
  const crearObjetivoMutation = useCreateObjetivo();
  const { usuario } = useSesionStore()
  
  // podemos confiar en los objetivos que vienen como prop
  // Ordenar los objetivos por fecha más reciente, considerando ambas fechas (inicio y fin)
  const objetivosToShow = ordenarObjetivosPorFecha(objetivos, 'inicio');
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [nuevoObjetivo, setNuevoObjetivo] = useState({
    descripcion: '',
    id_tipo_objetivo: '',
    fechaInicio: '',
    fechaFin: '',
    userId: '',
    estado_actual: 'no completado',
    estado_deseado: 'completado'
  })

  const handleAddClick = () => {
    setOpenAddDialog(true)
  }

  const handleViewClick = () => {
    setOpenViewDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenAddDialog(false)
    setOpenViewDialog(false)
    // Resetear el formulario
    setNuevoObjetivo({
      descripcion: '',
      id_tipo_objetivo: '',
      fechaInicio: '',
      fechaFin: '',
      userId: '',
      estado_actual: 'no completado',
      estado_deseado: 'completado'
    })
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNuevoObjetivo({
      ...nuevoObjetivo,
      [name]: value
    })
  }

  const handleSubmit = () => {
    // Validar que todos los campos estén llenos
    if (tipo==="individual") {
      if (!nuevoObjetivo.userId || !nuevoObjetivo.descripcion || !nuevoObjetivo.fechaInicio || !nuevoObjetivo.fechaFin) {
        return
      }  
    }else{
      nuevoObjetivo.userId=1
    }

    // Validar que la fecha de fin no sea menor a la fecha de inicio
    const fechaInicio = new Date(nuevoObjetivo.fechaInicio)
    const fechaFin = new Date(nuevoObjetivo.fechaFin)
    
    if (fechaFin < fechaInicio) {
      alert('La fecha de fin no puede ser menor a la fecha de inicio')
      return
    }
    
    // Buscar el nombre del usuario seleccionado
    const usuarioSeleccionado = usuariosQuery.data?.users?.find(
      usuario => usuario.id === nuevoObjetivo.userId
    )
    
    const nombreUsuario = usuarioSeleccionado 
      ? `${usuarioSeleccionado.nombre} ${usuarioSeleccionado.apellido}`
      : 'Usuario'
    
    // Crear objeto con el formato esperado por la API
    const objetivoData = {
      ...nuevoObjetivo,
      tipo: tipo, // Campo de texto 'general' o 'individual'
      id_tipo_objetivo: tipo === 'general' ? 1 : 2, // Valor numérico para la API: 1=general, 2=individual
      titulo: `Objetivo de ${nombreUsuario}`,  // Título descriptivo
      userName: nombreUsuario,                // Para visualización
      id_usuario: tipo === 'general' ? 1 : nuevoObjetivo.userId, // Asegurar que los campos requeridos por la API estén presentes
      fecha_inicio: nuevoObjetivo.fechaInicio,
      fecha_fin: nuevoObjetivo.fechaFin
    }
    
    // Si estamos utilizando la mutación externa (del componente padre)
    if (useExternalMutation && onAgregar) {
      // Solo llamamos a onAgregar, que se encargará de realizar la mutación
      onAgregar(objetivoData)
      handleCloseDialog()
    } else {
      // Usar nuestra propia mutación directamente
      crearObjetivoMutation.mutate(objetivoData, {
        onSuccess: (data) => {
          handleCloseDialog()
          toast.success('Objetivo creado exitosamente');
        },
        onError: (error) => {
          toast.error(`Error al crear objetivo`)
        }
      })
    }
  }

  return (
    <Box sx={{ width: '100%', height: '100%', padding: '8px', display: 'flex', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '12px' }}>
        <Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: '4px' }}>
            {titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {descripcion}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>

          {usuario && usuario.id_rol===1 &&
            <Button 
              variant="contained" 
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              onClick={handleAddClick}
              disabled={isLoading}
              sx={{ 
                backgroundColor: '#818cf8',
                '&:hover': {backgroundColor: '#A5b5fc'}
              }}
            >
              {isLoading ? 'Agregando...' : 'Agregar'}
            </Button>
          }
          
          <Button 
            variant="outlined" 
            startIcon={<VisibilityIcon />}
            onClick={handleViewClick}
            disabled={isLoading}
            sx={{ 
              color: '#818cf8',
              borderColor: '#818cf8',
              '&:hover': {
                borderColor: '#A5b5fc',
                backgroundColor: 'rgba(33, 150, 243, 0.04)'
              }
            }}
          >
            Ver
          </Button>
        </Box>
      </Box>

      {/* Diálogo para agregar objetivos */}
      <Dialog open={openAddDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar nuevo objetivo</DialogTitle>
        <DialogContent>
          {tipo==="individual" &&
            <FormControl 
              fullWidth 
              margin="dense" 
              variant="outlined"
              error={!nuevoObjetivo.userId && nuevoObjetivo.descripcion}
            >

                <InputLabel id="usuario-label">Usuario asignado</InputLabel>
                <Select
                  labelId="usuario-label"
                  name="userId"
                  value={nuevoObjetivo.userId}
                  onChange={handleInputChange}
                  label="Usuario asignado"
                  disabled={usuariosQuery.isLoading}
                >
                  {usuariosQuery.isLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} /> Cargando usuarios...
                    </MenuItem>
                  ) : usuariosQuery.data?.users && usuariosQuery.data.users.length > 0 ? (
                    filtrarUsuariosEmpleados(usuariosQuery.data.users).map((usuario) => (
                      <MenuItem key={usuario.id} value={usuario.id}>
                        {usuario.nombre} {usuario.apellido}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No hay usuarios disponibles</MenuItem>
                  )}
                </Select>
                {(!nuevoObjetivo.userId && nuevoObjetivo.descripcion) && (
                  <FormHelperText error>Tiene que seleccionar un empleado</FormHelperText>
                )}
            </FormControl>
            }
            

          <TextField
            margin="dense"
            name="descripcion"
            label="Escribe el objetivo"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={nuevoObjetivo.descripcion}
            onChange={handleInputChange}
          />

          <TextField
            margin="dense"
            name="fechaInicio"
            label="Fecha de inicio"
            type="date"
            fullWidth
            variant="outlined"
            sx={{ 
              '& .MuiInputLabel-root': {
                transform: 'translate(14px, -9px) scale(0.75)',
                backgroundColor: 'white',
                padding: '0 5px',
              },
            }}
            value={nuevoObjetivo.fechaInicio}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            name="fechaFin"
            label="Fecha de fin"
            type="date"
            fullWidth
            variant="outlined"
            sx={{ 
              '& .MuiInputLabel-root': {
                transform: 'translate(14px, -9px) scale(0.75)',
                backgroundColor: 'white',
                padding: '0 5px',
              },
            }}
            // La validación se maneja en handleInputChange y handleSubmit en lugar de inputProps
            value={nuevoObjetivo.fechaFin}
            onChange={(e) => {
              // Validar que la fecha fin no sea menor a la fecha inicio
              const fechaInicio = nuevoObjetivo.fechaInicio ? new Date(nuevoObjetivo.fechaInicio) : null;
              const fechaFin = e.target.value ? new Date(e.target.value) : null;
              
              handleInputChange(e);
            }}
            helperText={nuevoObjetivo.fechaInicio && nuevoObjetivo.fechaFin && new Date(nuevoObjetivo.fechaFin) < new Date(nuevoObjetivo.fechaInicio) ? 'La fecha de fin no puede ser menor a la fecha de inicio' : ''}
            error={nuevoObjetivo.fechaInicio && nuevoObjetivo.fechaFin && new Date(nuevoObjetivo.fechaFin) < new Date(nuevoObjetivo.fechaInicio)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={isLoading || crearObjetivoMutation.isPending || (tipo === "individual" && !nuevoObjetivo.userId) || !nuevoObjetivo.descripcion || !nuevoObjetivo.fechaInicio || !nuevoObjetivo.fechaFin}
          >
            {isLoading || crearObjetivoMutation.isPending ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para ver objetivos */}
      <Dialog open={openViewDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Objetivos existentes</DialogTitle>
        <DialogContent>
          {objetivosToShow.length > 0 ? (
            <List>
              {objetivosToShow.map((objetivo, index) => (
                <div key={objetivo.id || index}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography component="span" variant="subtitle1" sx={{ wordBreak: 'break-word', whiteSpace: 'normal', maxWidth: '70%' }}>
                            {objetivo.descripcion}
                          </Typography>

                          {tipo === "general" ? (
                            usuario && usuario.id_rol === 1 ? (
                              <BotonListo 
                                objetivo={objetivo} 
                              />
                            ) : null
                          ) : (
                            usuario && usuario.id_rol === 2 ? (
                              <div className="flex items-center gap-2">
                                <FileUploadButton objetivoId={objetivo.id} setDialog={setOpenViewDialog}/>
                              </div>
                            ) : (
                              <ObtenerNombreUsuario objetivo={objetivo} />
                            )
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Estado actual:
                            <span className={`ml-2 ${objetivo.estado_actual === 'completado' ? 'text-green-600 bg-green-100 rounded-full px-2 py-1' : 'text-red-600 bg-red-100 rounded-full px-2 py-1'}`}>{objetivo.estado_actual}</span>
                          </Typography>

                          <br />
                          <Typography component="span" variant="body2">
                            Periodo: {formatearFecha(objetivo.fechaInicio || objetivo.fecha_inicio)} - {formatearFecha(objetivo.fechaFin || objetivo.fecha_fin)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < objetivos.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          ) : (
            <Typography align="center" sx={{ my: 2 }}>
              No hay objetivos {tipo === 'general' ? "generales" : "individuales"} registrados
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
