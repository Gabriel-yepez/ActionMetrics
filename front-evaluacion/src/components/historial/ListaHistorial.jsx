import { useUserStore } from '@/store/userStore';
import { useSesionStore } from '@/store/sesionStore';
import { useEffect, useState } from 'react';
import { useEvaluaciones } from '@/hooks/useQueries';
import { useGuardarRetroalimentacion, useGetAllRetroalimentacion } from '@/hooks/useQueries';
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { filtrarUsuariosEmpleados } from '@/helper/filtroUsers'
import { ordenarPorFechaMasReciente } from '@/helper/FiltrarFecha';

export default function ListaHistorial() {

    const { users } = useUserStore()
    const { usuario } = useSesionStore()
    const { data, isLoading , isError } = useEvaluaciones()
    const  guardadoRetroalimentacion = useGuardarRetroalimentacion()
    const { data: retroalimentaciones , isLoading: isLoadingRetroalimentaciones , isError: isErrorRetroalimentaciones } = useGetAllRetroalimentacion()
    const [evaluaciones, setEvaluaciones] = useState({ data: [] })
    
    // Establecer los datos de evaluaciones cuando estén disponibles
    useEffect(() => {
        if (data) {
          console.log('Data from API:', data)
          // Si data es un array, envuélvelo en un objeto con propiedad data
          // Si data ya tiene una propiedad data que es un array, úsala directamente
          if (Array.isArray(data)) {
            setEvaluaciones({ data })
          } else if (data && Array.isArray(data.data)) {
            setEvaluaciones(data)
          } else {
            // Si no es ninguno de los formatos esperados, usa un array vacío
            setEvaluaciones({ data: [] })
          }
        }
    }, [data])
    
    // Estado para guardar los valores de los filtros
    const [filtros, setFiltros] = useState({
        usuario: "",
        fecha: "",
        estado: ""
    });

    const [dialog, setDialog] = useState(false)
    const [dialogVisible, setDialogVisible] = useState(false)
    const [selectedUrl, setSelectedUrl] = useState(null)
    const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null)

// Estado para almacenar los datos filtrados
    const [evaluacionesFiltradas, setEvaluacionesFiltradas] = useState([]);
    
    useEffect(() => {
        // Cargar datos iniciales o aplicar filtros cuando cambien
        const cargarDatos = () => {
            // Verificar si el usuario existe y si los datos de evaluaciones existen
            if (!usuario || !evaluaciones.data || !Array.isArray(evaluaciones.data)) {
                setEvaluacionesFiltradas([]);
                return;
            }

            // Función para filtrar los datos según los criterios seleccionados
            if (usuario.id_rol===1) {
              
              let datosFiltrados = [...evaluaciones.data];
              
              // Filtrar por usuario si está seleccionado
              if (filtros.usuario) {
                  datosFiltrados = datosFiltrados.filter(
                      evaluacion => evaluacion.id_usuario.toString() === filtros.usuario
                  );
              }
              
              // Filtrar por fecha si está seleccionada
              if (filtros.fecha) {
                  datosFiltrados = datosFiltrados.filter(
                      evaluacion => evaluacion.fecha === filtros.fecha
                  );
              }
              
              // Filtrar por estado si está seleccionado
              if (filtros.estado) {
                  const estadoBoolean = filtros.estado === "1";
                  datosFiltrados = datosFiltrados.filter(
                      evaluacion => evaluacion.estado === estadoBoolean
                  );
              }
              
              // Ordenar por fecha más reciente primero
              datosFiltrados = ordenarPorFechaMasReciente(datosFiltrados, 'fecha');
              
              setEvaluacionesFiltradas(datosFiltrados);
            }

            if (usuario && usuario.id_rol===2) {
              // Para usuarios regulares, filtramos solo sus propias evaluaciones
              let datosFiltrados = evaluaciones.data.filter(
                evaluacion => evaluacion.id_usuario === usuario.id
              );
              
              // Aplicar filtros adicionales
              // Filtrar por fecha si está seleccionada
              if (filtros.fecha) {
                datosFiltrados = datosFiltrados.filter(
                  evaluacion => evaluacion.fecha === filtros.fecha
                );
              }
              
              // Filtrar por estado si está seleccionado
              if (filtros.estado) {
                const estadoBoolean = filtros.estado === "1";
                datosFiltrados = datosFiltrados.filter(
                  evaluacion => evaluacion.estado === estadoBoolean
                );
              }
              
              // Ordenar por fecha más reciente primero
              datosFiltrados = ordenarPorFechaMasReciente(datosFiltrados, 'fecha');
              
              setEvaluacionesFiltradas(datosFiltrados);
            }
        };
        
        cargarDatos();
    }, [filtros, evaluaciones.data, usuario]); // Se ejecutará cuando cambien los filtros, los datos o el usuario


    const guardarRetroalimentacion = (e) => {
      e.preventDefault();
      const comentario = e.target.comentario.value;
      
      if (!comentario.trim()) {
        toast.error('Por favor ingrese un comentario');
        return;
      }
      
      // Verificar que tengamos una evaluación seleccionada
      if (!evaluacionSeleccionada || !evaluacionSeleccionada.id) {
        console.error('No hay evaluación seleccionada o no tiene ID');
        alert('Error al identificar la evaluación');
        return;
      }
      
      // Obtener el ID directamente del objeto de evaluación
      const evaluacionId = evaluacionSeleccionada.id;
      
      // Obtener la fecha actual
      const fecha = new Date().toISOString().split('T')[0];
      
      // Verificar que tengamos un usuario con ID
      if (!usuario || !usuario.id) {
        console.error('No hay usuario autenticado o no tiene ID');
        alert('Error: Usuario no identificado');
        return;
      }
      
      // Llamar a la mutación para guardar retroalimentación
      guardadoRetroalimentacion.mutate({
        evaluacionId, 
        usuarioId: usuario.id,
        comentario, 
        fecha
      });
      
      // Cerrar el diálogo y mostrar mensaje
      cerrarDialog();
      toast.success('Retroalimentación guardada correctamente');
    }
    
    const abrirDialog = (url, evaluacion) => {
      setSelectedUrl(url)
      setEvaluacionSeleccionada(evaluacion) // Guardar la evaluación completa seleccionada
      setDialog(true)
      setTimeout(() => {
        setDialogVisible(true)
      }, 10) // Pequeño retraso para asegurar que el DOM se actualice primero
    }

    const cerrarDialog = () => {
      setDialogVisible(false)
      setTimeout(() => {
        setDialog(false)
        setSelectedUrl('')
      }, 300) // Tiempo para que termine la animación de salida
    }
    
    const ManejoFiltro = (e) => {
        const { name, value } = e.target;
        
        // Actualizar el estado de filtros, manteniendo los valores anteriores
        setFiltros(prevFiltros => ({
            ...prevFiltros,
            [name]: value
        }));
    }

  return (
    <div className="p-8">
      <ToastContainer />
        <h1 className="text-4xl font-bold mb-4">Historial de evaluaciones</h1>

        <section className="flex gap-3">

          {usuario && usuario.id_rol === 1 &&
          
            <select
            name="usuario"
            className="shadow border border-gray-300 rounded px-2 py-2 text-black text-center bg-white hover:bg-slate-100"
            onChange={ManejoFiltro}
            value={filtros.usuario}
            >
            <option value="">Selecionar un usuario</option>
            {users && filtrarUsuariosEmpleados(users).map(user => (
              <option key={user.id} value={user.id}>
                {user.nombre} {user.apellido}
              </option>
            ))}
            </select>   
          }
            <label htmlFor="fecha_inicio" className='py-2'>Fecha</label>
                <input type="date" 
                name="fecha"
                className='shadow appearance-none border border-gray-300 rounded px-1'
                onChange={ManejoFiltro}
                value={filtros.fecha}
                />

            <select 
            name="estado"
            className="shadow border border-gray-300 rounded py-2 text-black text-center bg-white hover:bg-slate-100"
            onChange={ManejoFiltro}
            value={filtros.estado}
            >
                <option value="">Todos</option>
                <option value="1">Respondido</option>
                <option value="0">Pendiente</option>
            </select>
        </section>
        

        <table className="w-full mt-6 border-collapse">
            <thead className="bg-gray-100 text-lg">
              <tr>
                <th className="px-4 py-2 border">Nombre</th>
                <th className="px-4 py-2 border">Fecha</th>
                <th className="px-4 py-2 border">Comentario</th>
                <th className="px-4 py-2 border">Estado</th>
                <th className="px-4 py-2 border">Ver reporte</th>
              </tr>
            </thead>

            <tbody>
              {evaluacionesFiltradas.length > 0 ? (
                evaluacionesFiltradas.map(evaluacion => {
                  // Buscar el usuario correspondiente a esta evaluación
                  const userEvaluado = users?.find(user => user.id === evaluacion.id_usuario);
                  
                  return (
                    <tr key={evaluacion.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">
                        {userEvaluado ? `${userEvaluado.nombre} ${userEvaluado.apellido}` : 'Usuario desconocido'}
                      </td>
                      <td className="px-4 py-2 border text-center">{evaluacion.fecha}</td>
                      <td className="px-4 py-2 border whitespace-normal break-words">{evaluacion.comentario}</td>
                      <td className="px-4 py-2 border text-center">
                        <span className={`inline-block px-3 py-1 rounded text-white ${evaluacion.estado ? 'bg-green-500 rounded-full' : 'bg-yellow-500 rounded-full'} mx-auto`}>
                          {evaluacion.estado ? 'Respondido' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <button 
                          onClick={() => abrirDialog(evaluacion.url, evaluacion)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center border">
                    No hay evaluaciones 
                  </td>
                </tr>
              )}
            </tbody>
        </table>

        {/* Dialog para mostrar la URL */}
        {dialog && (
          <div className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ease-in-out ${dialogVisible ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-0'}`}>
            <div className={`bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-auto h-[95vh] flex flex-col transform transition-all duration-300 ease-in-out ${dialogVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold">Reporte de Evaluación</h3>
                <button 
                  onClick={cerrarDialog}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex-grow mb-4 overflow-hidden">
                <div className="bg-gray-100 rounded overflow-hidden h-full">
                  <iframe 
                    src={`http://localhost:4001${selectedUrl}#zoom=page-fit&toolbar=0`} 
                    className="w-full h-full border-0" 
                    title="Reporte de Evaluación"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              
              {/* Componente para renderizar feedback basado en el rol del usuario */}
              {(() => {
                // Asegurar que retroalimentaciones sea un array antes de usar métodos de array
                const retroArray = Array.isArray(retroalimentaciones) ? retroalimentaciones : [];
                
                // Variable para verificar si hay retroalimentación existente
                let retroalimentacionExistente = null;
                if (evaluacionSeleccionada && evaluacionSeleccionada.id) {
                  retroalimentacionExistente = retroArray.find(
                    retro => retro.id_evaluacion === evaluacionSeleccionada.id
                  );
                }
                
                // CASO 1: Usuario Administrador (rol=1)
                if (usuario && usuario.id_rol === 1) {
                  return (
                    <div className="p-2 border rounded bg-slate-50">
                      <h2 className="text-lg font-semibold mb-2">Opinión del empleado</h2>
                      {retroalimentacionExistente ? (
                        <div>
                          <p className="mb-2">Fecha: {retroalimentacionExistente.fecha}</p>
                          <div className="whitespace-normal break-words">
                            {retroalimentacionExistente.comentario || 'No hay comentario disponible'}
                          </div>
                        </div>
                      ) : (
                        <p>El empleado aún no ha proporcionado ningún comentario a esta evaluación.</p>
                      )}
                    </div>
                  );
                }
                
                // CASO 2: Usuario Empleado (rol=2)
                else if (usuario && usuario.id_rol === 2) {
                  // Si ya ha respondido, mostrar su comentario
                  if (retroalimentacionExistente) {
                    return (
                      <div className="p-2 border rounded bg-slate-50">
                        <h2 className="text-lg font-semibold mb-2">Su comentario sobre esta evaluación</h2>
                        <p className="mb-2">Fecha: {retroalimentacionExistente.fecha}</p>
                        <div className="whitespace-normal break-words">
                          {retroalimentacionExistente.comentario}
                        </div>
                      </div>
                    );
                  } 
                  // Si no ha respondido, mostrar el formulario
                  else {
                    return (
                      <div className="p-2 border rounded bg-slate-50">
                        <form id="retroalimentacionForm" onSubmit={guardarRetroalimentacion}>
                          <h2 className="text-lg font-semibold mb-2">Opine sobre su evaluación aquí</h2>
                          <textarea
                            name="comentario"
                            className="w-full h-24 border border-gray-300 rounded p-2 resize-none"
                            placeholder="Escriba su comentario..."
                          />
                        </form>
                      </div>
                    );
                  }
                }
                
                // CASO 3: Otro tipo de usuario o no autenticado
                return <p className="text-gray-500">No tiene permisos para ver esta sección.</p>;
              })()}
              
              <div className="flex space-x-3 justify-end my-4">
                <button
                  onClick={cerrarDialog}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 font-medium"
                >
                  Cerrar
                </button>

                {/* Mostrar botón Guardar solo si es empleado y no ha respondido aún */}
                {(() => {
                  if (!usuario || usuario.id_rol !== 2 || !evaluacionSeleccionada || !evaluacionSeleccionada.id) {
                    return null;
                  }
                  
                  // Verificar si ya respondió
                  const retroArray = Array.isArray(retroalimentaciones) ? retroalimentaciones : [];
                  const yaRespondio = retroArray.some(
                    retro => retro.id_evaluacion === evaluacionSeleccionada.id
                  );
                  
                  // Solo mostrar botón si no ha respondido
                  if (!yaRespondio) {
                    return (
                      <button
                        type="submit"
                        form="retroalimentacionForm"
                        className="px-6 py-2 border bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                      >
                        Guardar
                      </button>
                    );
                  }
                  
                  return null;
                })()}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
