import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import { useDepartamentoStore } from "@/store/departamentoStore"
import { useDepartamentos } from "@/hooks/useQueries"
import { useSesionStore } from "@/store/sesionStore"

export default function DepartmentSelector() {
  const { usuario } = useSesionStore()
  const { selectedDepartamento, setSelectedDepartamento, clearDepartamento } = useDepartamentoStore()
  const { data: departamentos = [] } = useDepartamentos()

  // Solo el super admin (id_rol=3) puede cambiar entre departamentos
  if (!usuario || usuario.id_rol !== 3) return null

  const handleChange = (e) => {
    const value = e.target.value
    if (value === '') {
      clearDepartamento()
    } else {
      setSelectedDepartamento(value)
    }
  }

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel id="dept-selector-label" sx={{ color: 'white', '&.Mui-focused': { color: 'white' } }}>
        Departamento
      </InputLabel>
      <Select
        labelId="dept-selector-label"
        value={selectedDepartamento || ''}
        label="Departamento"
        onChange={handleChange}
        sx={{
          color: 'white',
          '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
          '.MuiSvgIcon-root': { color: 'white' }
        }}
      >
        <MenuItem value="">Todos los departamentos</MenuItem>
        {departamentos.map((dept) => (
          <MenuItem key={dept.id} value={dept.id}>
            {dept.nombre}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
