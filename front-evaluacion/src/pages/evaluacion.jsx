import Head from "next/head";
import Layout from "@/components/dashboard/layout"
import MutiStepForm from "@/components/evaluacion/MutiStepForm"

export default function Evaluacion() {
  return (
    <Layout>
      <Head>
        <title>Evaluación | ActionMetrics</title>
        <meta name="description" content="Realiza evaluaciones de desempeño del personal con formularios paso a paso en ActionMetrics." />
        <meta property="og:title" content="Evaluación | ActionMetrics" />
      </Head>
      <MutiStepForm/>
    </Layout>
  )
}
