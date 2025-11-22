import { useRouter } from 'next/router'
import { urlApi } from '@/config/config'
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react'
import { validateForm, hasErrors } from '@/helper/formValidation';


export default function Form() {
    const router= useRouter()//enrutamiento
    const [errors, setErrors] = useState({})

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
        
        // Validar los campos
        const formFields = { 
          nombre, 
          apellido, 
          usuario: nombre_usuario, 
          contraseña: password, 
          email, 
          cedula, 
          rol: id_rol 
        }
        const formErrors = validateForm(formFields)
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

      const response = await fetch(`${urlApi}/auth/register`, { //lama para autenticar el usuario
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_usuario, nombre, apellido,email, password, ci, id_rol }),
      })

      if(response.ok){
          toast.success('Registro exitoso')
          setTimeout(() => {
            router.push('/')
          }, 2000)
      }
      else toast.error('Error al registrar')
    }

  return (
    <div>
        <ToastContainer autoClose={2000} />
        <form onSubmit={handlesubmit}>

            <div className="mb-4">

            <label htmlFor="nombre" className="text-gray-700 font-bold mb-2">Nombre</label>
                <input
                    name="nombre" 
                    type="text" 
                    id="nombre"
                    className={`shadow appearance-none border ${errors.nombre ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder="introducir nombre"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                )}
            </div>

            <div className='mb-4'>

            <label htmlFor="apellido" className="text-gray-700 font-bold mb-2">Apellido</label>
                <input
                    name="apellido" 
                    type="text" 
                    id="apellido"
                    className={`shadow appearance-none border ${errors.apellido ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder="introducir apellido"
                />
                {errors.apellido && (
                  <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>
                )}
            </div>

            <div className="mb-4">
            <label htmlFor="usuario" className="text-gray-700 font-bold mb-2">Usuario</label>
                <input
                    name="usuario" 
                    type="text" 
                    id="usuario"
                    className={`shadow appearance-none border ${errors.usuario ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder="introducir usuario"
                />
                {errors.usuario && (
                  <p className="text-red-500 text-xs mt-1">{errors.usuario}</p>
                )}
             </div>

            <div className="mb-4">

            <label htmlFor="password" className="text-gray-700 font-bold mb-2">Contraseña</label>
                <input 
                    name="password"
                    type="password" 
                    id="password"
                    className={`shadow appearance-none border ${errors.contraseña ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder="introduce contraseña"       
                />
                {errors.contraseña && (
                  <p className="text-red-500 text-xs mt-1">{errors.contraseña}</p>
                )}         
            </div>

            <div className="mb-4">

            <label htmlFor="email" className="text-gray-700 font-bold mb-2">email</label>
                <input 
                    name="email"
                    type="email" 
                    id="email"
                    className={`shadow appearance-none border ${errors.email ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder="introduce tu email"       
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}         
            </div>

            <div className="mb-4">

            <label htmlFor="cedula" className="text-gray-700 font-bold mb-2">cedula</label>
                <input 
                    name="cedula"
                    type="number" 
                    id="cedula"
                    className={`shadow appearance-none border ${errors.cedula ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    placeholder="introduce tu cedula"       
                />
                {errors.cedula && (
                  <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>
                )}          
            </div>

            <div className="mb-4">
            <label htmlFor="rol" className="text-gray-700 font-bold mb-2">Cargo</label>
            
                <select
                    name="rol"
                    id="rol"
                    className={`shadow appearance-none border ${errors.rol ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                >
                    <option value="">Seleccionar rol</option>
                    <option value="gerente">Gerente</option>
                    <option value="empleado">Empleado</option>
                </select>
                {errors.rol && (
                  <p className="text-red-500 text-xs mt-1">{errors.rol}</p>
                )}
            </div>

            <div className="flex items-center justify-between">
                <button
                    type="submit" 
                    className="bg-indigo-400 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">

                    Registar
                </button>
            </div>
                
        </form>
            
      
    </div>
  )
}
