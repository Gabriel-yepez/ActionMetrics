import LogoInicio from "../LogoInicio";
import Form from "./Form";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../LanguageSwitcher';

export default function InicioRegister() {
  const t = useTranslations('register');
  return (
    <div className='flex flex-col md:flex-row h-screen relative'>
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <div className="hidden md:flex flex-col bg-gradient-to-b from-indigo-500 to-indigo-300 md:w-1/2 justify-center items-center p-8">
        <LogoInicio/>
        <div className="text-3xl lg:text-5xl font-bold mb-4 text-white text-center">{t('welcome')}</div>
      </div>
      <div className="flex flex-col bg-white w-full md:w-1/2 justify-center items-center p-6 md:p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-5">{t('title')}</h1>
        <div className="w-full max-w-sm">
          <Form/>
        </div>
      </div>
    </div>
  )
}
