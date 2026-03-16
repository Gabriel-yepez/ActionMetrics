import Head from "next/head";
import Layout from "@/components/dashboard/layout"
import ListaDepartamentos from "@/components/departamentos/ListaDepartamentos"

export default function Departamentos() {
  return (
    <Layout>
      <Head>
        <title>Departamentos | ActionMetrics</title>
        <meta name="description" content="Gestiona los departamentos de la organización en ActionMetrics." />
        <meta property="og:title" content="Departamentos | ActionMetrics" />
      </Head>
      <ListaDepartamentos/>
    </Layout>
  )
}
