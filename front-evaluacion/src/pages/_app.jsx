import "@/styles/globals.css";
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { NextIntlClientProvider } from 'next-intl';
import AuthGuard from '@/components/AuthGuard';

const SITE_NAME = "ActionMetrics";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  // Crear una instancia de QueryClient para cada sesión de usuario
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60000, // 1 minuto - considerar datos "frescos" por 1 minuto
        cacheTime: 300000, // 5 minutos - mantener datos en caché por 5 minutos
        refetchOnWindowFocus: true, // Recargar datos cuando la ventana recupera el foco
        retry: 1, // Intentar de nuevo una vez si falla
      },
    },
  }));

  return (
    <NextIntlClientProvider
      locale={router.locale}
      timeZone="America/Caracas"
      messages={pageProps.messages}
    >
      <QueryClientProvider client={queryClient}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta property="og:site_name" content={SITE_NAME} />
          <meta property="og:type" content="website" />
          <meta property="og:locale" content={router.locale === 'en' ? 'en_US' : 'es_ES'} />
          <meta name="robots" content="index, follow" />
          <title>{SITE_NAME}</title>
        </Head>
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}
