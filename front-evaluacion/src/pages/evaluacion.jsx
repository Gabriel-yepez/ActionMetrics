import Head from "next/head";
import Layout from "@/components/dashboard/layout"
import MutiStepForm from "@/components/evaluacion/MutiStepForm"
import { useTranslations } from 'next-intl';

export default function Evaluacion() {
  const t = useTranslations('meta');
  return (
    <Layout>
      <Head>
        <title>{t('evaluationTitle')}</title>
        <meta name="description" content={t('evaluationDescription')} />
        <meta property="og:title" content={t('evaluationTitle')} />
      </Head>
      <MutiStepForm/>
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
