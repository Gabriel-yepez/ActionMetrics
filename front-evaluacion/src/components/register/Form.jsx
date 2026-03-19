import { useRouter } from 'next/router'
import { urlApi } from '@/config/config'
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react'
import { validateWithSchema, hasErrors } from '@/helper/formValidation';
import { registerSchema } from '@/validations/schemas';
import { useTranslations } from 'next-intl';


export default function Form() {
    const t = useTranslations('register');
    const tCommon = useTranslations('common');
    const tVal = useTranslations('validation');
    const router= useRouter()//enrutamiento
    const [errors, setErrors] = useState({})
    const [departamentos, setDepartamentos] = useState([])

    useEffect(() => {
        const fetchDepartamentos = async () => {
            try {
                const res = await fetch(`${urlApi}/departamentos/public`)
                if (res.ok) {
                    const result = await res.json()
                    setDepartamentos(result.data || [])
                }
            } catch (error) {
                console.error("Error al obtener departamentos:", error)
            }
        }
        fetchDepartamentos()
    }, [])

    async function handlesubmit(event){ 

        event.preventDefault()

        const form= new FormData(event.target)
        const nombre= form.get('nombre')
        const apellido= form.get('apellido')
        const nombre_usuario= form.get('usuario')
        const password= form.get('password')
        const email = form.get('email')
        const cedula= form.get('cedula')
        let id_rol= form.get('rol')
        const id_departamento = form.get('departamento') ? parseInt(form.get('departamento'), 10) : null

        // Validar los campos con Zod
        const formErrors = validateWithSchema(registerSchema, {
          nombre,
          apellido,
          usuario: nombre_usuario,
          password,
          email,
          cedula,
          rol: id_rol
        })
        setErrors(formErrors)

        // Si hay errores, detener el envío del formulario
        if (hasErrors(formErrors)) {
          return
        }

        // volver la cedula un numero para el guardado en base de datos
        const ci= parseInt(cedula, 10)

        if (isNaN(cedula)) {
          console.error("La cédula proporcionada no es un número válido.");
          // Puedes mostrar un mensaje de error al usuario o detener el envío.
          return;
        }

        if(id_rol==="gerente"){
          id_rol=1
        }
        else if(id_rol==="empleado"){
          id_rol=2
        }
        else if(id_rol==="superadmin"){
          id_rol=3
        }

      try {
        const response = await fetch(`${urlApi}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre_usuario, nombre, apellido, email, password, ci, id_rol, id_departamento }),
          credentials: 'include',
        })

        const responseData = await response.json()

        if(response.ok && responseData.ok){
            toast.success(t('success'))
            setTimeout(() => {
              router.push('/')
            }, 2000)
        }
        else {
          toast.error(responseData.message || t('error'))
        }
      } catch (error) {
        console.error("Error en registro:", error)
        toast.error(tCommon('serverError'))
      }
    }

  return (
    <div>
        <ToastContainer autoClose={2000} />
        <form onSubmit={handlesubmit}>

            <div className="mb-4">

            <label htmlFor="nombre" className="text-gray-700 font-bold mb-2">{t('firstName')}</label>
                <input
                    name="nombre" 
                    type="text" 
                    id="nombre"
                    className={`shadow appearance-none border ${errors.nombre ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder={t('firstNamePlaceholder')}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{tVal(errors.nombre)}</p>
                )}
            </div>

            <div className='mb-4'>

            <label htmlFor="apellido" className="text-gray-700 font-bold mb-2">{t('lastName')}</label>
                <input
                    name="apellido" 
                    type="text" 
                    id="apellido"
                    className={`shadow appearance-none border ${errors.apellido ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder={t('lastNamePlaceholder')}
                />
                {errors.apellido && (
                  <p className="text-red-500 text-xs mt-1">{tVal(errors.apellido)}</p>
                )}
            </div>

            <div className="mb-4">
            <label htmlFor="usuario" className="text-gray-700 font-bold mb-2">{t('username')}</label>
                <input
                    name="usuario" 
                    type="text" 
                    id="usuario"
                    className={`shadow appearance-none border ${errors.usuario ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder={t('usernamePlaceholder')}
                />
                {errors.usuario && (
                  <p className="text-red-500 text-xs mt-1">{tVal(errors.usuario)}</p>
                )}
             </div>

            <div className="mb-4">

            <label htmlFor="password" className="text-gray-700 font-bold mb-2">{t('password')}</label>
                <input 
                    name="password"
                    type="password" 
                    id="password"
                    className={`shadow appearance-none border ${errors.password ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder={t('passwordPlaceholder')}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{tVal(errors.password)}</p>
                )}         
            </div>

            <div className="mb-4">

            <label htmlFor="email" className="text-gray-700 font-bold mb-2">{t('email')}</label>
                <input 
                    name="email"
                    type="email" 
                    id="email"
                    className={`shadow appearance-none border ${errors.email ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder={t('emailPlaceholder')}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{tVal(errors.email)}</p>
                )}         
            </div>

            <div className="mb-4">

            <label htmlFor="cedula" className="text-gray-700 font-bold mb-2">{t('cedula')}</label>
                <input
                    name="cedula"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && !['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const paste = e.clipboardData.getData('text');
                      if (!/^\d+$/.test(paste)) e.preventDefault();
                    }}
                    id="cedula"
                    className={`shadow appearance-none border ${errors.cedula ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder={t('cedulaPlaceholder')}
                />
                {errors.cedula && (
                  <p className="text-red-500 text-xs mt-1">{tVal(errors.cedula)}</p>
                )}          
            </div>

            <div className="mb-4">
            <label htmlFor="rol" className="text-gray-700 font-bold mb-2">{t('role')}</label>

                <select
                    name="rol"
                    id="rol"
                    className={`shadow appearance-none border ${errors.rol ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                >
                    <option value="">{t('selectRole')}</option>
                    <option value="superadmin">{t('superAdmin')}</option>
                    <option value="gerente">{t('departmentManager')}</option>
                    <option value="empleado">{t('employee')}</option>
                </select>
                {errors.rol && (
                  <p className="text-red-500 text-xs mt-1">{tVal(errors.rol)}</p>
                )}
            </div>

            <div className="mb-4">
            <label htmlFor="departamento" className="text-gray-700 font-bold mb-2">{t('department')}</label>

                <select
                    name="departamento"
                    id="departamento"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                    <option value="">{t('selectDepartment')}</option>
                    {departamentos.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center justify-between">
                <button
                    type="submit" 
                    className="bg-indigo-400 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">

                    {t('submit')}
                </button>
            </div>
                
        </form>
            
      
    </div>
  )
}
