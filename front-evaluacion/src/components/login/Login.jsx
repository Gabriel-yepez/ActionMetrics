import { useRouter } from 'next/router'
import { toast,ToastContainer } from 'react-toastify';
import { useState } from 'react'
import Cargando from '../Cargando';
import Link from "next/link"
import LogoInicio from '../LogoInicio';
import 'react-toastify/dist/ReactToastify.css';
import { useSesionStore } from '@/store/sesionStore';
import { validateWithSchema, hasErrors } from '@/helper/formValidation';
import { loginSchema } from '@/validations/schemas';
import { urlApi } from '@/config/config';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../LanguageSwitcher';

export default function Login() {

  const t = useTranslations('login');
  const tCommon = useTranslations('common');
  const tVal = useTranslations('validation');
  const router= useRouter()
  const [loading, setLoading]= useState(false)
  const [errors, setErrors] = useState({})
  const {login} = useSesionStore()

  async function handlesubmit(event){

        event.preventDefault()
        const form= new FormData(event.target)
        const nombre_usuario= form.get('usuario')
        const password= form.get('password')

        const formErrors = validateWithSchema(loginSchema, { usuario: nombre_usuario, password })
        setErrors(formErrors)

        if (hasErrors(formErrors)) {
          return
        }

        try {
          const response = await fetch(`${urlApi}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_usuario, password }),
            credentials: 'include',
          })

          const responseData = await response.json()

          if(response.ok && responseData.ok){
            login(responseData)
            setLoading(true)

            setTimeout(() => {
            router.push('/dashboard')
            }, 3000)
            toast.success(t('welcomeBack'))
          }
          else {
            toast.error(responseData.message || t('invalidCredentials'))
          }
        } catch (error) {
          console.error("Error en login:", error)
          toast.error(tCommon('serverError'))
        }
    }

  return (
    <div>

      {loading

      ? (<Cargando/>)
      :(
      <div className="flex flex-col md:flex-row h-screen relative">
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>

        <div className="hidden md:flex flex-col bg-gradient-to-b from-indigo-500 to-indigo-300 md:w-1/2 justify-center items-center p-8">
            <LogoInicio/>
            <div className="text-3xl lg:text-5xl font-bold mb-4 text-white text-center">{t('welcome')}</div>
        </div>

        <div className="flex flex-col bg-white w-full md:w-1/2 justify-center items-center p-6 md:p-8">
            <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-10">{t('title')}</h1>

            <form onSubmit={handlesubmit} className="w-full max-w-sm">

                <div className="mb-4">
                  <label htmlFor="usuario" className="text-gray-700 font-bold mb-2 text-lg">{t('username')}</label>
                  <input
                    name="usuario"
                    type="text"
                    id="text"
                    className={`shadow appearance-none border ${errors.usuario ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2`}
                    placeholder={t('usernamePlaceholder')}
                  />
                  {errors.usuario && (
                    <p className="text-red-500 text-xs  mt-1">{tVal(errors.usuario)}</p>
                  )}
                </div>

                <div className="mb-4">

                  <label htmlFor="password" className="text-gray-700 font-bold mb-2 text-lg">{t('password')}</label>
                  <input
                    name="password"
                    type="password"
                    id="password"
                    className={`shadow appearance-none border ${errors.password ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2`}
                    placeholder={t('passwordPlaceholder')}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs  mt-1">{tVal(errors.password)}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="bg-indigo-400 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">

                      {t('submit')}
                  </button>

                  <Link
                    href="/registro"
                    className="inline-block align-baseline font-bold text-sm text-indigo-400 hover:text-indigo-500">
                    {t('register')}
                  </Link>
                </div>
            </form>
        </div>
      </div>
      )}
      <ToastContainer autoClose={2000} />
    </div>
  )
}
