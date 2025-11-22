import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Typography, Box } from '@mui/material';
import { useUserStore } from '@/store/userStore';
import { useSesionStore } from '@/store/sesionStore';
import { useGraficaGeneral, useGraficaUsuario } from '@/hooks/useQueries';
import { filtrarUsuariosEmpleados } from '@/helper/filtroUsers'
export default function Chart() {

  const { usuario } = useSesionStore()
  const [data, setData] = useState([]);
  
  const { users, conseguirUsers } = useUserStore();
  const [selectedUser, setSelectedUser] = useState("");
  
  // Determinar si es un administrador (rol 1) o usuario regular (rol 2)
  const isAdmin = usuario && usuario.id_rol === 1;
  const userId = usuario ? usuario.id : null;
  
  // Para usuarios regulares, usamos su ID directamente para la consulta
  const userIdToQuery = isAdmin ? selectedUser : userId;
  
  // Obtenemos los datos de la API usando los hooks de React Query
  const { data: datosGenerales, isLoading: loadingGeneral } = useGraficaGeneral();
  const { data: datosUsuario, isLoading: loadingUsuario } = useGraficaUsuario(userIdToQuery);

  // Fetch users when component mounts (solo para administradores)
  useEffect(() => {
    // Solo cargar usuarios si es administrador y la lista está vacía
    if (isAdmin && (!users || users.length === 0)) {
      conseguirUsers();
    }
  }, []);
  
  // Verificar si hay datos estadísticos disponibles
  const hayDatosDisponibles = (datos) => {
    if (!datos || !Array.isArray(datos) || datos.length === 0) return false;
    // Verificar si al menos un mes tiene evaluaciones > 0
    return datos.some(mes => mes.evaluaciones > 0);
  };
  
  // Actualizar los datos cuando cambian las respuestas de la API
  useEffect(() => {
    if (isAdmin) {
      // Para administradores, usar la lógica original
      if (selectedUser && datosUsuario) {
        setData(datosUsuario);
      } else if (datosGenerales) {
        setData(datosGenerales);
      }
    } else {
      // Para usuarios regulares, solo mostrar sus propios datos
      if (datosUsuario) {
        setData(datosUsuario);
      } else {
        // Si no hay datos específicos del usuario, mostrar array vacío
        setData([]);
      }
    }
  }, [isAdmin, selectedUser, datosGenerales, datosUsuario]);

  const handleUserChange = (event) => {
    // Al cambiar el usuario, se activa la consulta correspondiente gracias a la dependencia en useGraficaUsuario
    setSelectedUser(event.target.value);
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 1 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', ml:1 }}>
          {isAdmin ? "Cantidad de evaluaciones" : "Mis evaluaciones"}
        </Typography>

        {/* Selector de usuario solo visible para administradores */}
        {isAdmin &&
          <div className="mr-4 relative">
            <select
              className="shadow border border-gray-300 rounded px-2 py-2 text-black text-center bg-white hover:bg-slate-100"
              onChange={handleUserChange}
              value={selectedUser}
              disabled={loadingGeneral || loadingUsuario}
            >
              <option value="">Año completo</option>
              {users && filtrarUsuariosEmpleados(users).map(user => (
                <option key={user.id} value={user.id}>
                  {user.nombre} {user.apellido}
                </option>
              ))}
            </select>  
          </div>
        }
      </Box>
      {loadingGeneral || loadingUsuario ? (
        <div className="flex justify-center items-center w-[95%] h-[70%]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-2 text-gray-600">Cargando datos...</p>
        </div>
      ) : !hayDatosDisponibles(data) ? (
        <div className="flex flex-col justify-center items-center px-4 text-center w-[95%] h-[70%]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700">
            No hay información disponible
          </h3>
        </div>
      ) : (
        <ResponsiveContainer width="95%" height="70%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 30,
              bottom:20,
            }}
          >
            <XAxis dataKey="name" label={{ value: 'Meses', position: 'insideBottom', offset: -5, dy: 15, style: { fill: '#000000' } }} />
            <YAxis label={{ value: 'Cantidad de evaluación', angle: -90, position: 'insideLeft', dx: 0, dy: 12, style: { textAnchor: 'middle', fill: '#000000', } }} />
            <Tooltip 
              formatter={(value) => [`${value} evaluaciones`, 'Cantidad']}
            />
            <Bar dataKey="evaluaciones" fill="#2196F3" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}
