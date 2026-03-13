import Head from "next/head"
import Layout from "@/components/dashboard/layout"
import NotificacionesObjetivos from "@/components/notificaciones/NotificacionesObjetivos"
import Cargando from "@/components/Cargando"
import { useSesionStore } from "@/store/sesionStore"
import { useDashboardStore } from "@/store/dashboardStore"
import { useObjetivos } from "@/hooks/useQueries"
import { useEffect, useMemo } from "react"
import Alert from "@mui/material/Alert"
import { ToastContainer } from "react-toastify"
import { ordenarObjetivosPorFecha } from "@/helper/FiltrarFecha"

export default function Notificaciones() {
  const objetivos = useDashboardStore(state => state.objetivos);
  const setObjetivos = useDashboardStore(state => state.setObjetivos);
  const usuario = useSesionStore(state => state.usuario);

  const objetivosQuery = useObjetivos();

  // Sincronización batch
  useEffect(() => {
    if (objetivosQuery.data && objetivosQuery.data.length > 0) {
      setObjetivos(objetivosQuery.data);
    }
  }, [objetivosQuery.data, setObjetivos]);

  const isLoading = objetivosQuery.isLoading;
  const hasErrors = objetivosQuery.isError;

  // Filtrado y ordenamiento derivado con useMemo
  const objetivosNoCompletados = useMemo(() => {
    const filtrados = objetivos.filter(obj => {
      const estaNoCompletado = obj.estado_actual === 'no completado' && obj.id_tipo_objetivo === 2;
      if (usuario && usuario.id_rol === 2) {
        return estaNoCompletado && obj.id_usuario === usuario.id;
      }
      return estaNoCompletado;
    });
    return ordenarObjetivosPorFecha(filtrados, 'fin').reverse();
  }, [objetivos, usuario]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-grow h-full flex items-center justify-center">
          <Cargando/>
        </div>
      </Layout>
    );
  }

  if (hasErrors) {
    return (
      <Layout>
        <div className="flex-grow h-full flex flex-col items-center justify-center p-4">
          <Alert severity="error" className="mb-4 w-full max-w-md">
            {objetivosQuery.error?.message || "Error al cargar datos"}
          </Alert>
          <button
            onClick={() => objetivosQuery.refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Notificaciones | ActionMetrics</title>
        <meta name="description" content="Revisa las notificaciones de objetivos pendientes y vencidos en ActionMetrics." />
        <meta property="og:title" content="Notificaciones | ActionMetrics" />
      </Head>
      <ToastContainer />
      <div className="flex-grow h-full p-4">
        <h1 className="text-2xl font-bold mb-4">Notificaciones de Objetivos Pendientes</h1>

        {objetivosNoCompletados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-lg text-gray-500">No hay objetivos pendientes</p>
          </div>
        ) : (
          <NotificacionesObjetivos
            objetivos={objetivosNoCompletados}
          />
        )}
      </div>
    </Layout>
  )
}
