import Head from "next/head";
import InicioRegister from '../components/register/InicioRegister';
import { useTranslations } from 'next-intl';

export default function Registro() {
  const t = useTranslations('meta');
  return (
    <>
      <Head>
        <title>{t('registerTitle')}</title>
        <meta name="description" content={t('registerDescription')} />
        <meta property="og:title" content={t('registerTitle')} />
        <meta property="og:description" content={t('registerOgDescription')} />
      </Head>
      <InicioRegister />
    </>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default
    }
  };
}
