import Head from "next/head";
import Login from "@/components/login/Login";

export default function Home() {
  return (
    <>
      <Head>
        <title>Iniciar Sesión | ActionMetrics</title>
        <meta name="description" content="Inicia sesión en ActionMetrics para gestionar evaluaciones de desempeño, objetivos y rendimiento de tu equipo de trabajo." />
        <meta property="og:title" content="Iniciar Sesión | ActionMetrics" />
        <meta property="og:description" content="Accede a la plataforma de evaluación de desempeño y seguimiento de objetivos." />
      </Head>
      <Login />
    </>
  );
}
