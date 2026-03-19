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

import { useTranslations } from 'next-intl'
import { useDepartamentos, useCreateDepartamento, useUpdateDepartamento, useDeleteDepartamento } from "@/hooks/useQueries"
import { useSesionStore } from "@/store/sesionStore"
import { useState } from "react"
import { validateWithSchema, hasErrors } from "@/helper/formValidation"
import { departamentoSchema } from "@/validations/schemas"

export default function ListaDepartamentos() {
    const t = useTranslations('department');
    const tCommon = useTranslations('common');
    const tVal = useTranslations('validation');
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
    const [fieldErrors, setFieldErrors] = useState({})

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
        setFieldErrors({})
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
        setFieldErrors({})
    }

    const handleSubmitForm = () => {
        const errors = validateWithSchema(departamentoSchema, formData)
        setFieldErrors(errors)
        if (hasErrors(errors)) return

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
                <h1 className="text-2xl md:text-4xl font-bold">{t('title')}</h1>
                {isSuperAdmin && (
                    <Fab color="primary" size="medium" aria-label={t('createDepartment')} onClick={handleOpenCreate}>
                        <AddIcon />
                    </Fab>
                )}
            </div>

            {isError && (
                <Alert severity="error" className="mb-4">
                    {t('loadError')} {error?.message || tCommon('connectionError')}
                </Alert>
            )}

            {deleteDepartamento.isError && (
                <Alert severity="error" className="mb-4">
                    {t('deleteError')} {deleteDepartamento.error?.message || t('deleteErrorDetail')}
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
                                <TableCell sx={{ fontSize: '1.05rem', px: '8px' }} align="center"><strong>{tCommon('name')}</strong></TableCell>
                                <TableCell sx={{ fontSize: '1.05rem', px: '8px' }} align="center"><strong>{tCommon('description')}</strong></TableCell>
                                {isSuperAdmin && <TableCell align="center" sx={{ fontSize: '1.05rem', px: '8px' }}><strong>{tCommon('actions')}</strong></TableCell>}
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
                                        {t('noDepartments')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Modal de confirmación para eliminar */}
            <Dialog open={openConfirmDialog} onClose={handleCancelDelete}>
                <DialogTitle>{tCommon('confirmDelete')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('confirmDeleteMessage')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="error">{tCommon('cancel')}</Button>
                    <Button onClick={handleConfirmDelete} color="primary" autoFocus>{tCommon('accept')}</Button>
                </DialogActions>
            </Dialog>

            {/* Modal para crear/editar departamento */}
            <Dialog open={openFormDialog} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                <DialogTitle>{editingDept ? t('editDepartment') : t('createDepartment')}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={tCommon('name')}
                        fullWidth
                        variant="outlined"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        error={!!fieldErrors.nombre}
                        helperText={fieldErrors.nombre && tVal(fieldErrors.nombre)}
                    />
                    <TextField
                        margin="dense"
                        label={tCommon('description')}
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseForm} color="error">{tCommon('cancel')}</Button>
                    <Button
                        onClick={handleSubmitForm}
                        color="primary"
                        disabled={!formData.nombre.trim() || createDepartamento.isPending || updateDepartamento.isPending}
                    >
                        {(createDepartamento.isPending || updateDepartamento.isPending) ? (
                            <CircularProgress size={24} />
                        ) : (
                            editingDept ? tCommon('save') : tCommon('create')
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
