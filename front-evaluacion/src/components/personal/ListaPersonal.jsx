import TextField from "@mui/material/TextField"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import IconButton from "@mui/material/IconButton"
import DeleteIcon from "@mui/icons-material/Delete"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Button from "@mui/material/Button"

import { useDebounce } from "@uidotdev/usehooks"
import { useUserStore } from "@/store/userStore"
import { useSesionStore } from "@/store/sesionStore"
import { useUsers, useDeleteUser } from "@/hooks/useQueries"
import { useState } from "react"

const DEBOUNCE_TIME = 300

export default function ListaPersonal() {
    // Estado de la interfaz con Zustand
    const { search, setSearch } = useUserStore()
    const { usuario } = useSesionStore()
    // Mantener useDebounce para no hacer muchas peticiones
    const debouncedSearch = useDebounce(search, DEBOUNCE_TIME)
    
    // Obtener datos con TanStack Query
    const { 
      data, 
      isLoading, 
      isError, 
      error 
    } = useUsers(debouncedSearch)
    
    // Manejo de eliminación con TanStack Query mutation
    const deleteUser = useDeleteUser()
    
    // Estado para el modal de confirmación
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
    const [userToDelete, setUserToDelete] = useState(null)
    
    // Constantes derivadas del resultado de la consulta
    const users = data?.users || []
    const notFound = data?.notFound || false
    
    const handleSearch = (e) => {
        setSearch(e.target.value)
    }
    
    const handleDeleteClick = (userId) => {
        setUserToDelete(userId)
        setOpenConfirmDialog(true)
    }
    
    const handleConfirmDelete = () => {
        if (userToDelete) {
            deleteUser.mutate(userToDelete)
            setOpenConfirmDialog(false)
        }
    }
    
    const handleCancelDelete = () => {
        setOpenConfirmDialog(false)
        setUserToDelete(null)
    }

  return (
    <div className="p-8">
        <h1 className="text-4xl font-bold mb-4">Personal del departamento</h1>
        <TextField
          label="Buscar usuario..."
          value={search}
          variant="outlined"
          onChange={handleSearch}
          fullWidth
          margin="normal"
        />
        
        {isError && (
          <Alert severity="error" className="mb-4">
            Error: {error?.message || "Ocurrió un error al cargar los usuarios"}
          </Alert>
        )}
        
        {deleteUser.isError && (
          <Alert severity="error" className="mb-4">
            Error al eliminar: {deleteUser.error?.message || "No se pudo eliminar el usuario"}
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <CircularProgress />
          </div>
        ) : (
          <TableContainer component={Paper} style={{ marginTop: 16 }}>
            <Table>
              <TableHead style={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontSize: '1.05rem', px: '8px' }} align="center"><strong>Nombre</strong></TableCell>
                  <TableCell sx={{ fontSize: '1.05rem', px: '8px' }} align="center"><strong>Apellido</strong></TableCell>
                  <TableCell sx={{ fontSize: '1.05rem', px: '8px' }} align="center"><strong>Email</strong></TableCell>
                  <TableCell sx={{ fontSize: '1.05rem', px: '8px' }} align="center"><strong>Cédula</strong></TableCell>
                  {usuario && usuario.id_rol===1 && <TableCell align="center" sx={{ fontSize: '1.05rem', px: '8px' }}><strong>Acciones</strong></TableCell>}
                </TableRow>
              </TableHead>
              <TableBody sx={{ 
                '& :hover': {
                  backgroundColor: "#f5f5f5"
                }
              }}>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell sx={{ fontSize: '1rem', px: '8px' }} align="center">{user.nombre}</TableCell>
                      <TableCell sx={{ fontSize: '1rem', px: '8px' }} align="center">{user.apellido}</TableCell>
                      <TableCell sx={{ fontSize: '1rem', px: '8px' }} align="center">{user.email}</TableCell>
                      <TableCell sx={{ fontSize: '1rem', px: '8px' }} align="center">V-{user.ci}</TableCell>
                      {usuario && usuario.id_rol===1 &&
                      
                      <TableCell align="center" sx={{ px: '8px' }}>
                        <IconButton 
                          color="error" 
                          aria-label="Eliminar"
                          onClick={() => handleDeleteClick(user.id)}
                          disabled={deleteUser.isPending}
                          >
                          {deleteUser.isPending && 
                           deleteUser.variables === user.id ? (
                            <CircularProgress size={24} />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      }
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {notFound && "No se encontraron usuarios"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Modal de confirmación para eliminar usuario */}
        <Dialog
          open={openConfirmDialog}
          onClose={handleCancelDelete}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Confirmar eliminación
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              ¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="error">
              Cancelar
            </Button>
            <Button onClick={handleConfirmDelete} color="primary" autoFocus>
              Aceptar
            </Button>
          </DialogActions>
        </Dialog>
      </div>
  )
}
