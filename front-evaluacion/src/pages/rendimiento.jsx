import Head from "next/head";
import Layout from "@/components/dashboard/layout"
import InicioRendimiento from '@/components/rendimiento/InicioRendimiento'
import { useRouter } from 'next/router'

export default function Rendimiento() {
  const router = useRouter();
  const { userId } = router.query;

  return (
    <Layout>
      <Head>
        <title>Rendimiento | ActionMetrics</title>
        <meta name="description" content="Visualiza reportes de rendimiento y desempeño por usuario en ActionMetrics." />
        <meta property="og:title" content="Rendimiento | ActionMetrics" />
      </Head>
      <InicioRendimiento selectedUserId={userId} />
    </Layout>
  )
}
