import Head from "next/head";
import Login from "@/components/login/Login";
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('meta');
  return (
    <>
      <Head>
        <title>{t('loginTitle')}</title>
        <meta name="description" content={t('loginDescription')} />
        <meta property="og:title" content={t('loginTitle')} />
        <meta property="og:description" content={t('loginOgDescription')} />
      </Head>
      <Login />
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default
    }
  };
}
