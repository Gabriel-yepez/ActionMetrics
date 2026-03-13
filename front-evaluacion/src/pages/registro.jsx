import Head from "next/head";
import InicioRegister from '../components/register/InicioRegister';

export default function Registro() {
  return (
    <>
      <Head>
        <title>Registro | ActionMetrics</title>
        <meta name="description" content="Crea tu cuenta en ActionMetrics para comenzar a gestionar el desempeño y los objetivos de tu equipo." />
        <meta property="og:title" content="Registro | ActionMetrics" />
        <meta property="og:description" content="Regístrate en la plataforma de evaluación de desempeño y seguimiento de objetivos." />
      </Head>
      <InicioRegister />
    </>
  )
}
