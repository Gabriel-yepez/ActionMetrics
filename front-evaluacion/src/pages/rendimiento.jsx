import Head from "next/head";
import Layout from "@/components/dashboard/layout"
import InicioRendimiento from '@/components/rendimiento/InicioRendimiento'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl';

export default function Rendimiento() {
  const router = useRouter();
  const { userId } = router.query;
  const t = useTranslations('meta');

  return (
    <Layout>
      <Head>
        <title>{t('performanceTitle')}</title>
        <meta name="description" content={t('performanceDescription')} />
        <meta property="og:title" content={t('performanceTitle')} />
      </Head>
      <InicioRendimiento selectedUserId={userId} />
    </Layout>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default
    }
  };
}
