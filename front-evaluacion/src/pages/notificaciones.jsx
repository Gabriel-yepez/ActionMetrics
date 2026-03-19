import Head from "next/head"
import Layout from "@/components/dashboard/layout"
import NotificacionesObjetivos from "@/components/notificaciones/NotificacionesObjetivos"
import Cargando from "@/components/Cargando"
import { useSesionStore } from "@/store/sesionStore"
import { useObjetivos } from "@/hooks/useQueries"
import { useMemo } from "react"
import Alert from "@mui/material/Alert"
import { ToastContainer } from "react-toastify"
import { ordenarObjetivosPorFecha } from "@/helper/FiltrarFecha"
import { useTranslations } from 'next-intl';

export default function Notificaciones() {
  const tMeta = useTranslations('meta');
  const tNotif = useTranslations('notifications');
  const tCommon = useTranslations('common');

  const usuario = useSesionStore(state => state.usuario);
  const objetivosQuery = useObjetivos();

  const objetivos = objetivosQuery.data || [];
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
            {tNotif('loadError')}
          </Alert>
          <button
            onClick={() => objetivosQuery.refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {tCommon('retry')}
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{tMeta('notificationsTitle')}</title>
        <meta name="description" content={tMeta('notificationsDescription')} />
        <meta property="og:title" content={tMeta('notificationsTitle')} />
      </Head>
      <ToastContainer />
      <div className="flex-grow h-full p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold mb-4">{tNotif('title')}</h1>

        {objetivosNoCompletados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-lg text-gray-500">{tNotif('noPending')}</p>
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

export async function getStaticProps({ locale }) {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default
    }
  };
}
