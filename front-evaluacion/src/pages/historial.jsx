import Head from "next/head";
import Layout from "@/components/dashboard/layout"
import ListaHistorial from "@/components/historial/ListaHistorial"
import { useTranslations } from 'next-intl';

export default function Historial() {
  const t = useTranslations('meta');
  return (
    <Layout>
      <Head>
        <title>{t('historyTitle')}</title>
        <meta name="description" content={t('historyDescription')} />
        <meta property="og:title" content={t('historyTitle')} />
      </Head>
      <ListaHistorial/>
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
