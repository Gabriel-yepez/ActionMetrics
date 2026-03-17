import Head from "next/head";
import Layout from "@/components/dashboard/layout"
import ListaDepartamentos from "@/components/departamentos/ListaDepartamentos"
import { useTranslations } from 'next-intl';

export default function Departamentos() {
  const t = useTranslations('meta');
  return (
    <Layout>
      <Head>
        <title>{t('departmentsTitle')}</title>
        <meta name="description" content={t('departmentsDescription')} />
        <meta property="og:title" content={t('departmentsTitle')} />
      </Head>
      <ListaDepartamentos/>
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
