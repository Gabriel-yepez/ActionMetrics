import Head from "next/head";
import Layout from "@/components/dashboard/layout"
import ListaHistorial from "@/components/historial/ListaHistorial"

export default function Historial() {
  return (
    <Layout>
      <Head>
        <title>Historial de Evaluaciones | ActionMetrics</title>
        <meta name="description" content="Consulta el historial completo de evaluaciones de desempeño realizadas en ActionMetrics." />
        <meta property="og:title" content="Historial de Evaluaciones | ActionMetrics" />
      </Head>
      <ListaHistorial/>
    </Layout>
  )
}
