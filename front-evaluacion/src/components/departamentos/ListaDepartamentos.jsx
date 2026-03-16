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
import EditIcon from "@mui/icons-material/Edit"
import AddIcon from "@mui/icons-material/Add"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Button from "@mui/material/Button"
import Fab from "@mui/material/Fab"

import { useDepartamentos, useCreateDepartamento, useUpdateDepartamento, useDeleteDepartamento } from "@/hooks/useQueries"
import { useSesionStore } from "@/store/sesionStore"
import { useState } from "react"

export default function ListaDepartamentos() {
    const { usuario } = useSesionStore()
    const isSuperAdmin = usuario && usuario.id_rol === 3

    const { data: departamentos = [], isLoading, isError, error } = useDepartamentos()
    const createDepartamento = useCreateDepartamento()
    const updateDepartamento = useUpdateDepartamento()
    const deleteDepartamento = useDeleteDepartamento()

    const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
    const [deptToDelete, setDeptToDelete] = useState(null)

    const [openFormDialog, setOpenFormDialog] = useState(false)
    const [editingDept, setEditingDept] = useState(null)
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' })

    const handleDeleteClick = (deptId) => {
        setDeptToDelete(deptId)
        setOpenConfirmDialog(true)
    }

    const handleConfirmDelete = () => {
        if (deptToDelete) {
            deleteDepartamento.mutate(deptToDelete)
            setOpenConfirmDialog(false)
            setDeptToDelete(null)
        }
    }

    const handleCancelDelete = () => {
        setOpenConfirmDialog(false)
        setDeptToDelete(null)
    }

    const handleOpenCreate = () => {
        setEditingDept(null)
        setFormData({ nombre: '', descripcion: '' })
        setOpenFormDialog(true)
    }

    const handleOpenEdit = (dept) => {
        setEditingDept(dept)
        setFormData({ nombre: dept.nombre, descripcion: dept.descripcion || '' })
        setOpenFormDialog(true)
    }

    const handleCloseForm = () => {
        setOpenFormDialog(false)
        setEditingDept(null)
        setFormData({ nombre: '', descripcion: '' })
    }

    const handleSubmitForm = () => {
        if (!formData.nombre.trim()) return

        if (editingDept) {
            updateDepartamento.mutate({ id: editingDept.id, data: formData }, {
                onSuccess: () => handleCloseForm()
            })
        } else {
            createDepartamento.mutate(formData, {
                onSuccess: () => handleCloseForm()
            })
        }
    }

    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl md:text-4xl font-bold">Departamentos</h1>
                {isSuperAdmin && (
                    <Fab color="primary" size="medium" aria-label="Crear departamento" onClick={handleOpenCreate}>
                        <AddIcon />
                    </Fab>
                )}
            </div>

            {isError && (
                <Alert severity="error" className="mb-4">
                    No se pudo cargar la lista de departamentos. {error?.message || "Verifique su conexión e intente de nuevo."}
                </Alert>
            )}

            {deleteDepartamento.isError && (
                <Alert severity="error" className="mb-4">
                    No se pudo eliminar el departamento. {deleteDepartamento.error?.message || "Es posible que tenga usuarios asignados. Reasigne los usuarios antes de eliminar."}
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
                                <TableCell sx={{ fontSize: '1.05rem', px: '8px' }} align="center"><strong>Descripción</strong></TableCell>
                                {isSuperAdmin && <TableCell align="center" sx={{ fontSize: '1.05rem', px: '8px' }}><strong>Acciones</strong></TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{
                            '& :hover': {
                                backgroundColor: "#f5f5f5"
                            }
                        }}>
                            {departamentos.length > 0 ? (
                                departamentos.map((dept) => (
                                    <TableRow key={dept.id}>
                                        <TableCell sx={{ fontSize: '1rem', px: '8px' }} align="center">{dept.nombre}</TableCell>
                                        <TableCell sx={{ fontSize: '1rem', px: '8px' }} align="center">{dept.descripcion || '-'}</TableCell>
                                        {isSuperAdmin && (
                                            <TableCell align="center" sx={{ px: '8px' }}>
                                                <IconButton
                                                    color="primary"
                                                    aria-label="Editar"
                                                    onClick={() => handleOpenEdit(dept)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    aria-label="Eliminar"
                                                    onClick={() => handleDeleteClick(dept.id)}
                                                    disabled={deleteDepartamento.isPending}
                                                >
                                                    {deleteDepartamento.isPending && deleteDepartamento.variables === dept.id ? (
                                                        <CircularProgress size={24} />
                                                    ) : (
                                                        <DeleteIcon />
                                                    )}
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        Aún no hay departamentos registrados. Cree uno nuevo con el botón "+".
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Modal de confirmación para eliminar */}
            <Dialog open={openConfirmDialog} onClose={handleCancelDelete}>
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Al eliminar este departamento, los usuarios asignados quedarán sin departamento y deberán ser reasignados manualmente. ¿Desea continuar?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="error">Cancelar</Button>
                    <Button onClick={handleConfirmDelete} color="primary" autoFocus>Aceptar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal para crear/editar departamento */}
            <Dialog open={openFormDialog} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                <DialogTitle>{editingDept ? 'Editar departamento' : 'Crear departamento'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre"
                        fullWidth
                        variant="outlined"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Descripción"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseForm} color="error">Cancelar</Button>
                    <Button
                        onClick={handleSubmitForm}
                        color="primary"
                        disabled={!formData.nombre.trim() || createDepartamento.isPending || updateDepartamento.isPending}
                    >
                        {(createDepartamento.isPending || updateDepartamento.isPending) ? (
                            <CircularProgress size={24} />
                        ) : (
                            editingDept ? 'Guardar' : 'Crear'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
