import { useUserStore } from '@/store/userStore';
import { useSesionStore } from '@/store/sesionStore';
import { useState, useMemo, useCallback } from 'react';
import { useEvaluaciones } from '@/hooks/useQueries';
import { useGuardarRetroalimentacion, useGetAllRetroalimentacion } from '@/hooks/useQueries';
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { filtrarUsuariosEmpleados } from '@/helper/filtroUsers'
import { ordenarPorFechaMasReciente } from '@/helper/FiltrarFecha';

export default function ListaHistorial() {

    const users = useUserStore(state => state.users)
    const usuario = useSesionStore(state => state.usuario)
    const { data, isLoading, isError } = useEvaluaciones()
    const guardadoRetroalimentacion = useGuardarRetroalimentacion()
    const { data: retroalimentaciones } = useGetAllRetroalimentacion()

    // Normalizar datos de evaluaciones con useMemo
    const evaluacionesData = useMemo(() => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    }, [data])

    const [filtros, setFiltros] = useState({
        usuario: "",
        fecha: "",
        estado: ""
    });

    const [dialog, setDialog] = useState(false)
    const [dialogVisible, setDialogVisible] = useState(false)
    const [selectedUrl, setSelectedUrl] = useState(null)
    const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null)

    // Filtrado derivado con useMemo en lugar de useEffect + setState
    const evaluacionesFiltradas = useMemo(() => {
      if (!usuario || !evaluacionesData.length) return [];

      let datosFiltrados = [...evaluacionesData];

      // Filtrar por rol: usuarios regulares solo ven sus evaluaciones
      if (usuario.id_rol === 2) {
        datosFiltrados = datosFiltrados.filter(
          evaluacion => evaluacion.id_usuario === usuario.id
        );
      }

      // Filtrar por usuario seleccionado (solo admin)
      if (usuario.id_rol === 1 && filtros.usuario) {
        datosFiltrados = datosFiltrados.filter(
          evaluacion => evaluacion.id_usuario.toString() === filtros.usuario
        );
      }

      // Filtrar por fecha
      if (filtros.fecha) {
        datosFiltrados = datosFiltrados.filter(
          evaluacion => evaluacion.fecha === filtros.fecha
        );
      }

      // Filtrar por estado
      if (filtros.estado) {
        const estadoBoolean = filtros.estado === "1";
        datosFiltrados = datosFiltrados.filter(
          evaluacion => evaluacion.estado === estadoBoolean
        );
      }

      return ordenarPorFechaMasReciente(datosFiltrados, 'fecha');
    }, [evaluacionesData, usuario, filtros]);


    const guardarRetroalimentacion = useCallback((e) => {
      e.preventDefault();
      const comentario = e.target.comentario.value;

      if (!comentario.trim()) {
        toast.error('Por favor ingrese un comentario');
        return;
      }

      if (!evaluacionSeleccionada || !evaluacionSeleccionada.id) {
        return;
      }

      if (!usuario || !usuario.id) {
        return;
      }

      guardadoRetroalimentacion.mutate({
        evaluacionId: evaluacionSeleccionada.id,
        usuarioId: usuario.id,
        comentario,
        fecha: new Date().toISOString().split('T')[0]
      });

      cerrarDialog();
      toast.success('Retroalimentación guardada correctamente');
    }, [evaluacionSeleccionada, usuario, guardadoRetroalimentacion])

    const abrirDialog = useCallback((url, evaluacion) => {
      setSelectedUrl(url)
      setEvaluacionSeleccionada(evaluacion)
      setDialog(true)
      setTimeout(() => {
        setDialogVisible(true)
      }, 10)
    }, [])

    const cerrarDialog = useCallback(() => {
      setDialogVisible(false)
      setTimeout(() => {
        setDialog(false)
        setSelectedUrl('')
      }, 300)
    }, [])

    const ManejoFiltro = useCallback((e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    }, [])

    // Retroalimentación como array seguro
    const retroArray = useMemo(() =>
      Array.isArray(retroalimentaciones) ? retroalimentaciones : []
    , [retroalimentaciones]);

    const retroalimentacionExistente = useMemo(() => {
      if (!evaluacionSeleccionada?.id) return null;
      return retroArray.find(retro => retro.id_evaluacion === evaluacionSeleccionada.id);
    }, [retroArray, evaluacionSeleccionada]);

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

              {/* Feedback basado en rol */}
              {usuario && usuario.id_rol === 1 && (
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
              )}

              {usuario && usuario.id_rol === 2 && retroalimentacionExistente && (
                <div className="p-2 border rounded bg-slate-50">
                  <h2 className="text-lg font-semibold mb-2">Su comentario sobre esta evaluación</h2>
                  <p className="mb-2">Fecha: {retroalimentacionExistente.fecha}</p>
                  <div className="whitespace-normal break-words">
                    {retroalimentacionExistente.comentario}
                  </div>
                </div>
              )}

              {usuario && usuario.id_rol === 2 && !retroalimentacionExistente && (
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
              )}

              <div className="flex space-x-3 justify-end my-4">
                <button
                  onClick={cerrarDialog}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 font-medium"
                >
                  Cerrar
                </button>

                {usuario && usuario.id_rol === 2 && !retroalimentacionExistente && (
                  <button
                    type="submit"
                    form="retroalimentacionForm"
                    className="px-6 py-2 border bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                  >
                    Guardar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
