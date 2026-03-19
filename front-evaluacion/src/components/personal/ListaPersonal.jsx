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
import AddIcon from "@mui/icons-material/Add"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"

import { useTranslations } from 'next-intl'
import { useDebounce } from "@uidotdev/usehooks"
import { useUserStore } from "@/store/userStore"
import { useSesionStore } from "@/store/sesionStore"
import { useUsers, useDeleteUser, useCreateUser, useDepartamentos } from "@/hooks/useQueries"
import { useState } from "react"
import { validateWithSchema, hasErrors } from "@/helper/formValidation"
import { createUserSchema } from "@/validations/schemas"

const DEBOUNCE_TIME = 300

const initialFormState = {
    nombre: '',
    apellido: '',
    nombre_usuario: '',
    password: '',
    email: '',
    ci: '',
    id_rol: '',
    id_departamento: '',
}

export default function ListaPersonal() {
    const t = useTranslations('staff');
    const tCommon = useTranslations('common');
    const tDept = useTranslations('department');
    const tVal = useTranslations('validation');
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
    const createUser = useCreateUser()
    const { data: departamentos = [] } = useDepartamentos()

    // Estado para el modal de confirmación de eliminación
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
    const [userToDelete, setUserToDelete] = useState(null)

    // Estado para el modal de creación de usuario
    const [openCreateDialog, setOpenCreateDialog] = useState(false)
    const [formData, setFormData] = useState(initialFormState)
    const [formError, setFormError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})

    // Constantes derivadas del resultado de la consulta
    const users = data?.users || []
    const notFound = data?.notFound || false

    const isAdmin = usuario && (usuario.id_rol === 1 || usuario.id_rol === 3)
    const isSuperAdmin = usuario && usuario.id_rol === 3

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

    // Handlers para creación de usuario
    const handleOpenCreate = () => {
        setFormData(initialFormState)
        setFormError('')
        setFieldErrors({})
        setOpenCreateDialog(true)
    }

    const handleCloseCreate = () => {
        setOpenCreateDialog(false)
        setFormData(initialFormState)
        setFormError('')
        setFieldErrors({})
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCreateUser = () => {
        // Validar con Zod
        const errors = validateWithSchema(createUserSchema, formData)

        // Para superadmin, validar departamento
        if (isSuperAdmin && !formData.id_departamento) {
            errors.id_departamento = 'required'
        }

        setFieldErrors(errors)

        if (hasErrors(errors)) {
            setFormError('')
            return
        }

        const userData = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            nombre_usuario: formData.nombre_usuario,
            password: formData.password,
            email: formData.email,
            ci: parseInt(formData.ci, 10),
            id_rol: parseInt(formData.id_rol, 10),
        }

        // SuperAdmin asigna departamento desde el form; Gerente lo asigna el backend
        if (isSuperAdmin) {
            userData.id_departamento = parseInt(formData.id_departamento, 10)
        }

        createUser.mutate(userData, {
            onSuccess: () => {
                handleCloseCreate()
            },
            onError: () => {
                setFormError(t('createError'))
            }
        })
    }

  return (
    <div className="p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h1 className="text-2xl md:text-4xl font-bold">{t('title')}</h1>
            {isAdmin && (
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ textTransform: 'none' }}
                >
                    {t('addUser')}
                </Button>
            )}
        </div>
        <TextField
          label={t('searchPlaceholder')}
          value={search}
          variant="outlined"
          onChange={handleSearch}
          fullWidth
          margin="normal"
        />

        {isError && (
          <Alert severity="error" className="mb-4">
            {t('loadError')} {error?.message || tCommon('connectionError')}
          </Alert>
        )}

        {deleteUser.isError && (
          <Alert severity="error" className="mb-4">
            {t('deleteError')} {deleteUser.error?.message || t('deleteErrorDetail')}
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
                  <TableCell sx={{ fontSize: '1.05rem', px: '8px' }} align="center"><strong>{tCommon('lastName')}</strong></TableCell>
                  <TableCell sx={{ fontSize: '1.05rem', px: '8px' }} align="center"><strong>{tCommon('email')}</strong></TableCell>
                  <TableCell sx={{ fontSize: '1.05rem', px: '8px' }} align="center"><strong>{t('cedula')}</strong></TableCell>
                  <TableCell sx={{ fontSize: '1.05rem', px: '8px' }} align="center"><strong>{tDept('department')}</strong></TableCell>
                  {isAdmin && <TableCell align="center" sx={{ fontSize: '1.05rem', px: '8px' }}><strong>{tCommon('actions')}</strong></TableCell>}
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
                      <TableCell sx={{ fontSize: '1rem', px: '8px' }} align="center">{t('vPrefix')}{user.ci}</TableCell>
                      <TableCell sx={{ fontSize: '1rem', px: '8px' }} align="center">{user.departamento?.nombre || tDept('noDepartment')}</TableCell>
                      {isAdmin &&

                      <TableCell align="center" sx={{ px: '8px' }}>
                        <IconButton
                          color="error"
                          aria-label={tCommon('delete')}
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
                    <TableCell colSpan={6} align="center">
                      {notFound && t('noUsersFound')}
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
            {tCommon('confirmDelete')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {t('confirmDeleteMessage')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="error">
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleConfirmDelete} color="primary" autoFocus>
              {tCommon('accept')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de creación de usuario */}
        <Dialog
          open={openCreateDialog}
          onClose={handleCloseCreate}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('createUser')}</DialogTitle>
          <DialogContent>
            <div className="flex flex-col gap-4 mt-2">
              {formError && (
                <Alert severity="error">{formError}</Alert>
              )}
              <TextField
                name="nombre"
                label={tCommon('name')}
                value={formData.nombre}
                onChange={handleFormChange}
                fullWidth
                required
                error={!!fieldErrors.nombre}
                helperText={fieldErrors.nombre && tVal(fieldErrors.nombre)}
              />
              <TextField
                name="apellido"
                label={tCommon('lastName')}
                value={formData.apellido}
                onChange={handleFormChange}
                fullWidth
                required
                error={!!fieldErrors.apellido}
                helperText={fieldErrors.apellido && tVal(fieldErrors.apellido)}
              />
              <TextField
                name="nombre_usuario"
                label={t('username')}
                value={formData.nombre_usuario}
                onChange={handleFormChange}
                fullWidth
                required
                error={!!fieldErrors.nombre_usuario}
                helperText={fieldErrors.nombre_usuario && tVal(fieldErrors.nombre_usuario)}
              />
              <TextField
                name="email"
                label={tCommon('email')}
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                fullWidth
                required
                error={!!fieldErrors.email}
                helperText={fieldErrors.email && tVal(fieldErrors.email)}
              />
              <TextField
                name="password"
                label={t('password')}
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                fullWidth
                required
                error={!!fieldErrors.password}
                helperText={fieldErrors.password && tVal(fieldErrors.password)}
              />
              <TextField
                name="ci"
                label={t('cedula')}
                value={formData.ci}
                onChange={(e) => {
                  const val = e.target.value
                  if (/^\d*$/.test(val)) {
                    handleFormChange(e)
                  }
                }}
                inputMode="numeric"
                fullWidth
                required
                error={!!fieldErrors.ci}
                helperText={fieldErrors.ci && tVal(fieldErrors.ci)}
              />
              <TextField
                name="id_rol"
                label={t('role')}
                value={formData.id_rol}
                onChange={handleFormChange}
                select
                fullWidth
                required
                error={!!fieldErrors.id_rol}
                helperText={fieldErrors.id_rol && tVal(fieldErrors.id_rol)}
              >
                <MenuItem value="">{t('selectRole')}</MenuItem>
                <MenuItem value="1">{t('manager')}</MenuItem>
                <MenuItem value="2">{t('employee')}</MenuItem>
              </TextField>
              {isSuperAdmin && (
                <TextField
                  name="id_departamento"
                  label={tDept('department')}
                  value={formData.id_departamento}
                  onChange={handleFormChange}
                  select
                  fullWidth
                  required
                  error={!!fieldErrors.id_departamento}
                  helperText={fieldErrors.id_departamento && tVal(fieldErrors.id_departamento)}
                >
                  <MenuItem value="">{t('selectDepartment')}</MenuItem>
                  {departamentos.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreate} color="error">
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleCreateUser}
              color="primary"
              variant="contained"
              disabled={createUser.isPending}
            >
              {createUser.isPending ? <CircularProgress size={24} /> : tCommon('create')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
  )
}
