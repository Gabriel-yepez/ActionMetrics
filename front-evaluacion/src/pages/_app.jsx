import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function App({ Component, pageProps }) {
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
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}
