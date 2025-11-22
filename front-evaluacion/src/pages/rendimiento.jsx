import Layout from "@/components/dashboard/layout"
import InicioRendimiento from '@/components/rendimiento/InicioRendimiento'
import { useRouter } from 'next/router'

export default function Rendimiento() {
  // Obtener el router para acceder a los parámetros de la URL
  const router = useRouter();
  // Extraer el userId de la query
  const { userId } = router.query;

  return (
    <Layout>
      <InicioRendimiento selectedUserId={userId} />
    </Layout>
  )
}
