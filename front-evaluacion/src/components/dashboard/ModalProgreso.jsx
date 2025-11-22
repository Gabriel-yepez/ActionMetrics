import { useUserStore } from '@/store/userStore';
import { useState, useEffect } from 'react';
import { actualizarProgresoUsuarios } from '../../helper/calcularProgresoUsuario';
import { useObjetivos } from '@/hooks/useQueries';
import { useRouter } from 'next/router'

const ModalProgreso = ({ titulo, porcentaje, onClose }) => {
  const { data: objetivosData } = useObjetivos()
  const users = useUserStore(state => state.users)
  const conseguirUsers = useUserStore(state => state.conseguirUsers)
  const router = useRouter();
  // Estado para almacenar los usuarios únicos con su progreso agregado
  const [usuariosUnicos, setUsuariosUnicos] = useState([]);
  
  // Función para manejar la redirección a la página de rendimiento
  const handleVerRendimiento = (userId) => {
    // Cerrar el modal
    onClose();
    // Redireccionar a la página de rendimiento con el ID del usuario como query param
    router.push({
      pathname: '/rendimiento',
      query: { userId: userId }
    });
  };
  
  // Forzar la actualización de usuarios al abrir el modal
  useEffect(() => {
    // Forzar la recarga de usuarios usando forceRefresh=true
    conseguirUsers(true);
  }, [conseguirUsers]);
  
  // Procesar objetivos para agruparlos por usuario y calcular el progreso promedio
  useEffect(() => {
    // Usar la función helper para calcular el progreso por usuario
    actualizarProgresoUsuarios(objetivosData, users, setUsuariosUnicos);
  }, [objetivosData, users]);
  
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70%] h-[90%] bg-white shadow-xl p-6 rounded-xl overflow-y-auto scrollbar-hide">
      {/* Agregamos estilos CSS personalizados para ocultar la barra de desplazamiento */}
      <style jsx>{`
        /* Ocultar scrollbar para Chrome, Safari y Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Ocultar scrollbar para IE, Edge y Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE y Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      <h2 id="modal-progreso" className="text-xl font-medium mb-2">
        Progreso del {titulo} {porcentaje}%
      </h2>
      
      {/* Lista de personas con objetivos */}
      <div className="mt-7">
        {usuariosUnicos.length > 0 ? (
          <div className="w-full overflow-hidden">
            <table className="w-full border-separate border-spacing-y-2 text-center rounded-xl overflow-hidden">
              <thead>
                <tr>
                  <th className="text-center p-2">Persona</th>
                  <th className="text-center p-2 w-32">Participación</th>
                </tr>
              </thead>
              <tbody>
                {usuariosUnicos.map((usuario, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-2">{usuario.nombre || 'No asignado'}</td>
                    <td className={`p-2 ${usuario.progresoPromedio < 34 ? 'text-red-600 bg-red-50 rounded-full' : usuario.progresoPromedio >= 65 ? 'text-green-600 bg-green-50 rounded-full' : 'text-yellow-600 bg-yellow-50 rounded-full'}`}>{`${usuario.progresoPromedio}%`}</td>
                    <td><button onClick={() => handleVerRendimiento(usuario.id)} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full">Ver rendimiento</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-600 text-center w-full h-80 mt-60">
            No hay personas con objetivos asignados.
          </div>
        )}
      </div>
      
      <div className="relative bottom-5 right-5 flex justify-end overflow-hidden mt-12">
        <button 
          onClick={onClose} 
          className="rounded-xl text-blue-500 py-2 px-4 hover:bg-blue-50"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ModalProgreso;
