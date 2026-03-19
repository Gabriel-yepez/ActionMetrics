import Head from "next/head"
import Layout from "@/components/dashboard/layout"
import UsuariosCount from "@/components/dashboard/UsuariosCount"
import EvaluacionCount from "@/components/dashboard/EvaluacionCount"
import ObjetivoResult from "@/components/dashboard/ObjetivoResult"
import CrearObjetivo from "@/components/dashboard/CrearObjetivo"
import Chart from "@/components/dashboard/Chart"
import Cargando from "@/components/Cargando"
import { useEvaluacionesCount, useEvaluacionesCountByUser, useUsuariosCount, useCreateObjetivo, useObjetivos } from "@/hooks/useQueries"
import Alert from "@mui/material/Alert"
import { useEffect, useRef, useMemo } from "react"
import { useSesionStore } from "@/store/sesionStore"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useTranslations } from 'next-intl';
import { getProgresoGlobal } from '@/helper/progresoGlobal';

export default function Dashboard() {
  const tMeta = useTranslations('meta');
  const tDash = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const tNotif = useTranslations('notifications');

  const { usuario } = useSesionStore();

  // Referencia para controlar que las notificaciones solo se muestren una vez
  const notificacionesMostradas = useRef(false);

  // Seleccionar el hook correcto según el rol del usuario
  const isAdmin = usuario && (usuario.id_rol === 1 || usuario.id_rol === 3);
  const evaluacionesCountGeneralQuery = useEvaluacionesCount();
  const evaluacionesCountUserQuery = useEvaluacionesCountByUser(usuario?.id);

  // Usar la consulta adecuada según el rol
  const evaluacionesQuery = isAdmin ? evaluacionesCountGeneralQuery : evaluacionesCountUserQuery;

  const usuariosQuery = useUsuariosCount();
  const objetivosQuery = useObjetivos();
  const createObjetivoMutation = useCreateObjetivo();

  // Datos de objetivos directamente de TanStack Query
  const objetivos = objetivosQuery.data || [];
  const porcentajeGlobal = useMemo(() => getProgresoGlobal(objetivos), [objetivos]);

  // Mostrar notificaciones de objetivos urgentes al cargar la página
  useEffect(() => {
    // Solo mostrar notificaciones si no se han mostrado antes y hay usuario y objetivos
    if (!usuario || objetivos.length === 0 || notificacionesMostradas.current) return;

    // Marcar que las notificaciones ya fueron mostradas
    notificacionesMostradas.current = true;

    // Función para determinar la urgencia de un objetivo
    const getUrgencyLevel = (fechaFin) => {
      if (!fechaFin) return 'normal';

      const hoy = new Date();
      const fechaObj = new Date(fechaFin);
      fechaObj.setDate(fechaObj.getDate() + 1);
      const diferenciaDias = Math.ceil((fechaObj - hoy) / (1000 * 60 * 60 * 24));

      if (diferenciaDias < 0) return 'overdue';
      if (diferenciaDias <= 3) return 'urgent';
      if (diferenciaDias <= 7) return 'upcoming';
      return 'normal';
    };

    // Filtrar objetivos según el usuario
    const objetivosFiltrados = objetivos.filter(obj => {
      // Solo mostrar notificaciones de objetivos no completados
      const estaNoCompletado = obj.estado_actual === 'no completado';

      // Si el usuario es regular, mostrar solo sus objetivos
      if (usuario.id_rol === 2) {
        return estaNoCompletado && obj.id_usuario === usuario.id;
      }

      // Para administradores, mostrar todos los objetivos no completados
      return estaNoCompletado;
    });

    // Agrupar objetivos por nivel de urgencia
    const objetivosVencidos = [];
    const objetivosUrgentes = [];
    const objetivosProximos = [];

    objetivosFiltrados.forEach(obj => {
      const urgencia = getUrgencyLevel(obj.fecha_fin);

      if (urgencia === 'overdue') objetivosVencidos.push(obj);
      else if (urgencia === 'urgent') objetivosUrgentes.push(obj);
      else if (urgencia === 'upcoming') objetivosProximos.push(obj);
    });

    // Mostrar notificaciones toast según urgencia
    if (objetivosVencidos.length > 0) {
      toast.error(
        <div className="flex items-center">
          <NotificationsIcon className="mr-2" />
          <div>
            <strong>{tNotif('attention')}</strong> {usuario.id_rol === 2 ? tNotif('youHave') : tNotif('thereAre')} {objetivosVencidos.length} {objetivosVencidos.length === 1 ? tNotif('overdueObjectiveSingular') : tNotif('overdueObjectivePlural')}.
            <div className="mt-1">
              <a href="/notificaciones" className="text-white underline">{tNotif('viewDetails')}</a>
            </div>
          </div>
        </div>,
        { autoClose: false }
      );
    }

    if (objetivosUrgentes.length > 0) {
      setTimeout(() => {
        toast.warning(
          <div className="flex items-center">
            <NotificationsIcon className="mr-2" />
            <div>
              <strong>{tNotif('urgent')}</strong> {usuario.id_rol === 2 ? tNotif('youHave') : tNotif('thereAre')} {objetivosUrgentes.length} {objetivosUrgentes.length === 1 ? tNotif('urgentSingular') : tNotif('urgentPlural')}.
              <div className="mt-1">
                <a href="/notificaciones" className="text-yellow-900 underline">{tNotif('viewDetails')}</a>
              </div>
            </div>
          </div>,
          { autoClose: 10000 }
        );
      }, 1000);
    }

    if (objetivosProximos.length > 0) {
      setTimeout(() => {
        toast.info(
          <div className="flex items-center">
            <NotificationsIcon className="mr-2" />
            <div>
              <strong>{tNotif('reminder')}</strong> {usuario.id_rol === 2 ? tNotif('youHave') : tNotif('thereAre')} {objetivosProximos.length} {objetivosProximos.length === 1 ? tNotif('reminderSingular') : tNotif('reminderPlural')}.
              <div className="mt-1">
                <a href="/notificaciones" className="text-blue-900 underline">{tNotif('viewDetails')}</a>
              </div>
            </div>
          </div>,
          { autoClose: 8000 }
        );
      }, 2000);
    }
  }, [objetivos, usuario, tNotif]);

  // Verificar si hay errores o está cargando
  const isLoading = evaluacionesQuery.isLoading || usuariosQuery.isLoading;
  const hasErrors = evaluacionesQuery.isError || usuariosQuery.isError;

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
            {tDash('panelError')}
          </Alert>
          <button
            onClick={() => {
              evaluacionesQuery.refetch();
              usuariosQuery.refetch();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {tCommon('retry')}
          </button>
        </div>
      </Layout>
    );
  }

  // Extraer datos de las consultas
  const evaluacionCount = evaluacionesQuery.data || 0;
  const usuariosCount = usuariosQuery.data || 0;

  return (
    <Layout>
      <Head>
        <title>{tDash('title')}</title>
        <meta name="description" content={tMeta('dashboardDescription')} />
        <meta property="og:title" content={tDash('title')} />
      </Head>
      <ToastContainer />
      <div className="flex-grow h-full">
        {createObjetivoMutation.isError && (
          <Alert severity="error" className="m-4">
            {tDash('createObjectiveError')} {createObjetivoMutation.error?.message || tDash('verifyDataError')}
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <div className="border border-gray-300 rounded-lg shadow-md p-2">
            <ObjetivoResult
              porcentaje={porcentajeGlobal}
              peso={100}
              titulo={tDash('globalResult')}
              descripcion={tDash('globalResultDescription')}
            />
          </div>
          <div className="border border-gray-300 rounded-lg shadow-md p-2">
            <EvaluacionCount
              evaluacionCount={evaluacionCount}
            />
            {evaluacionesQuery.isFetching && <Cargando />}
          </div>
          <div className="border border-gray-300 rounded-lg shadow-md p-2">
            <UsuariosCount usuariosCount={usuariosCount}/>
            {usuariosQuery.isFetching && <Cargando />}
          </div>
          <div className="md:col-span-3 border border-gray-300 rounded-lg shadow-md p-2">
            <CrearObjetivo
              titulo={tDash('generalObjectives')}
              descripcion={tDash('generalObjectivesDesc')}
              tipo="general"
              objetivos={objetivos.filter(obj => obj.id_tipo_objetivo === 1 && obj.estado_actual === 'no completado')}
              isLoading={createObjetivoMutation.isPending}
            />
          </div>
          <div className="md:col-span-3 border border-gray-300 rounded-lg shadow-md p-2">
            <CrearObjetivo
              titulo={tDash('individualObjectives')}
              descripcion={tDash('individualObjectivesDesc')}
              tipo="individual"
              objetivos={objetivos.filter(obj => {
                const esTipoIndividual = obj.id_tipo_objetivo === 2;

                if (usuario && usuario.id_rol === 2) {
                  return esTipoIndividual && obj.id_usuario === usuario.id && obj.estado_actual === 'no completado';
                }

                return esTipoIndividual && obj.estado_actual === 'no completado';
              })}
              isLoading={createObjetivoMutation.isPending}
            />
          </div>
          <div className="md:col-span-3 border border-gray-300 rounded-lg shadow-md p-2 min-h-[300px] md:min-h-[400px]">
            <Chart />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default
    }
  };
}
