import Head from "next/head";
import Layout from "@/components/dashboard/layout"
import ListaPersonal from "@/components/personal/ListaPersonal"

export default function Personal() {
  return (
    <Layout>
      <Head>
        <title>Personal | ActionMetrics</title>
        <meta name="description" content="Gestiona el personal y los usuarios del equipo de trabajo en ActionMetrics." />
        <meta property="og:title" content="Personal | ActionMetrics" />
      </Head>
      <ListaPersonal/>
    </Layout>
  )
}
