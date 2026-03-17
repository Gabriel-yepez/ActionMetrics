import Head from "next/head";
import Layout from "@/components/dashboard/layout"
import ListaPersonal from "@/components/personal/ListaPersonal"
import { useTranslations } from 'next-intl';

export default function Personal() {
  const t = useTranslations('meta');
  return (
    <Layout>
      <Head>
        <title>{t('staffTitle')}</title>
        <meta name="description" content={t('staffDescription')} />
        <meta property="og:title" content={t('staffTitle')} />
      </Head>
      <ListaPersonal/>
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
