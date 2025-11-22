import { useUserStore } from "@/store/userStore"
import { useDashboardStore } from "@/store/dashboardStore"
import { useRef, useEffect, useState } from "react"
import { filtrarUsuariosEmpleados } from '@/helper/filtroUsers'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function StepOne({dataEvaluacion, setDataEvaluacion, onValidation}) {
  // Función para formatear la fecha de vencimiento
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha límite';
    
    try {
      // Convertir la cadena de fecha a un objeto Date
      const fechaObj = new Date(fecha);
      
      // Sumar un día a la fecha para compensar el timezone
      fechaObj.setDate(fechaObj.getDate() + 1);
      
      // Formatear la fecha en español
      return format(fechaObj, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return 'Fecha inválida';
    }
  };
  
  // Función para determinar el color de la notificación basado en la urgencia
  const getUrgencyColor = (fechaVencimiento) => {
    if (!fechaVencimiento) return 'default';
    
    const hoy = new Date();
    const fechaObj = new Date(fechaVencimiento);
    const diferenciaDias = Math.ceil((fechaObj - hoy) / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias < 0) return 'error'; // Vencido
    if (diferenciaDias <= 3) return 'warning'; // A punto de vencer
    if (diferenciaDias <= 7) return 'info'; // Próximo a vencer
    return 'success'; // Tiempo suficiente
  };
  
  // Obtener el texto de urgencia según el color
  const getUrgencyText = (color) => {
    switch (color) {
      case 'error': return 'Retrasado';
      case 'warning': return 'Falta pocos días para que termine el objetivo';
      case 'info': return 'Tiene 7 dias para terminar el objetivo';
      case 'success': return 'En plazo';
      default: return 'Sin plazo';
    }
  };
  
  // Obtener clases de color para el indicador de urgencia
  const getUrgencyColorClass = (color) => {
    switch (color) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-amber-600 bg-amber-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'success': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
    // Reference to the form
    const formRef = useRef(null)
    
    // Estado para controlar la validación de campos
    const [formValues, setFormValues] = useState({
      id_usuario: dataEvaluacion?.id_usuario || '',
      fecha: dataEvaluacion?.fecha || '',
      comentario: dataEvaluacion?.comentarioEvaluacion || ''
    })
    
    //accedo a los usuarios del estado global
    const {users} = useUserStore()
    const {objetivos} = useDashboardStore()
    const [objetivosUsuarios, setObjetivosUsuarios] = useState([])  // Cambiado a array vacío para consistencia
    
    // Filtrar objetivos cuando cambia el usuario seleccionado o los objetivos
    // Función para validar los campos del formulario
    const validateForm = () => {
      const isValid = formValues.id_usuario && formValues.fecha && formValues.comentario;
      
      // Notificar al componente padre sobre el estado de validación
      if (onValidation) {
        onValidation(!!isValid);
      }
      
      return isValid;
    }
    
    useEffect(() => {
      // Primero actualizamos el formulario con los datos existentes
      if (dataEvaluacion && formRef.current) {
        const form = formRef.current;
        if (dataEvaluacion.id_usuario) form.id_usuario.value = dataEvaluacion.id_usuario;
        if (dataEvaluacion.fecha) form.fecha.value = dataEvaluacion.fecha;
        if (dataEvaluacion.comentarioEvaluacion) form.comentario.value = dataEvaluacion.comentarioEvaluacion;
        
        // Actualizar también nuestro estado local de valores del formulario
        setFormValues({
          id_usuario: dataEvaluacion.id_usuario || '',
          fecha: dataEvaluacion.fecha || '',
          comentario: dataEvaluacion.comentarioEvaluacion || ''
        });
        
        // Si hay un usuario seleccionado y tenemos objetivos guardados, los cargamos
        if (dataEvaluacion.id_usuario) {
          // Si ya hay objetivos guardados en el estado, los usamos
          if (dataEvaluacion.objetivos_usuario) {
            setObjetivosUsuarios(dataEvaluacion.objetivos_usuario);
          }
        }
      }
     
    }, [dataEvaluacion, objetivos])
    
    // Ejecutar validación cuando cambian los valores del formulario
    useEffect(() => {
      validateForm();
    }, [formValues])
    
    // Handle input changes to update the parent state
    const handleInputChange = () => {
      if (!formRef.current) return;
      
      const form = new FormData(formRef.current);
      const id_usuario = form.get('id_usuario');
      const fecha = form.get('fecha');
      const comentarioEvaluacion = form.get('comentario');
      
      // Actualizar el estado local de valores del formulario
      setFormValues({
        id_usuario,
        fecha,
        comentario: comentarioEvaluacion
      });
      
      // Inicializamos objetivosFiltrados fuera del bloque if
      let objetivosFiltrados = [];
      
      // Filtrar objetivos basados en el usuario seleccionado
      if (id_usuario) {
        // Convertimos el ID a string para comparación consistente
        const usuarioIdStr = String(id_usuario);
        
        objetivosFiltrados = objetivos.filter(objetivo => {
          const objUsuarioId = objetivo.id_usuario ? String(objetivo.id_usuario) : null;
          return objUsuarioId === usuarioIdStr;
        });
        
        console.log("Objetivos filtrados desde handleInputChange:", objetivosFiltrados);
      }

      // Update the parent state with the filtered objetivos
      setDataEvaluacion({
        ...dataEvaluacion,
        id_usuario,
        fecha,
        comentarioEvaluacion,
        objetivos_usuario: objetivosFiltrados // Añadimos los objetivos filtrados al estado
      });
      
      // Actualizamos el estado local de objetivos para la UI
      setObjetivosUsuarios(objetivosFiltrados);
    }
  return (
    <div className='flex flex-col h-full w-full p-4'>

      <div className='flex flex-col md:flex-row w-full h-full gap-4'>
        {/*parte de la izquierda */}
        <section className='w-full md:w-1/2 p-5 bg-slate-200 rounded-lg shadow-lg flex flex-col h-full'>
          <h1 className='font-semibold text-xl mb-4 text-center'> Datos del evaluado</h1>

          <form ref={formRef} onChange={handleInputChange} className='h-full flex flex-col'>
              <div className='flex flex-col gap-2 flex-1 flex-grow'>
                <label 
                htmlFor="id_usuario"
                className='font-semibold mt-1 text-lg'
                > Persona a evaluar</label>
                <select 
                  name="id_usuario" 
                  id="id_usuario"
                  className='border border-gray-300 rounded-md p-2 text-lg'
                >
                  <option value="">Selecione una persona</option>
                  {users &&  filtrarUsuariosEmpleados(users).map(user => (
                    <option key={user.id} value={user.id}>
                      {user.nombre} {user.apellido}
                    </option>
                  ))}
                </select>

                <label htmlFor="fecha"
                className='font-semibold mt-1 text-lg'
                >Fecha</label>
                
                <input 
                type="date" 
                id="fecha"
                name="fecha"
                className='border border-gray-300 rounded-md p-2 text-lg'
                />

                <label 
                htmlFor="comentario"
                className='font-semibold mt-1 text-lg'
                >Comentarios</label>

                <div className="flex-1 min-h-[150px]">
                  <textarea 
                  id="comentario"
                  name="comentario"
                  className='border border-gray-300 rounded-md p-2 h-full w-full resize-none text-lg'
                  placeholder="Ingrese sus comentarios aquí"
                  />
                </div>

              </div>
          </form>
        </section>

        {/*parte de la derecha - Objetivos */}
        <section className='w-full md:w-1/2 p-5 bg-white rounded-lg shadow-lg flex flex-col h-full'>
          <h1 className='font-semibold text-xl mb-4 text-center'>Objetivos del evaluado</h1>
          <div className='flex-1 overflow-auto'>
            {!dataEvaluacion.id_usuario ? (
              <div className='flex items-center justify-center h-full'>
                <p className='font-bold text-lg'>Seleccione un usuario para ver sus objetivos</p>
              </div>
            ) : objetivosUsuarios && objetivosUsuarios.length > 0 ? (
              <ul className='space-y-2'>
                {objetivosUsuarios.map((objetivo, index) => {
                  const urgencyColor = getUrgencyColor(objetivo.fecha_fin);
                  const urgencyText = getUrgencyText(urgencyColor);
                  
                  return (
                    <li key={index} className='border-b border-gray-300 py-2'>
                      {objetivo.descripcion && (
                        <div className='text-gray-600'>{objetivo.descripcion}</div>
                      )}
                      
                      {objetivo.fecha_fin && (
                        <div className='mt-1'>
                          <span className='font-medium'>Fecha de culminación: </span>
                          <span>{formatearFecha(objetivo.fecha_fin)} </span>
                          <span className={`${getUrgencyColorClass(urgencyColor)} rounded-full px-2 py-1`}>
                              {urgencyText}
                          </span>
                        </div>
                      )}
                      
                      <div className='mt-1 flex flex-wrap gap-2'>
                        {objetivo.estado_actual && (
                          <div>
                            <span className='font-medium'>Estado: </span>
                            <span className={`${objetivo.estado_actual === 'completado' ? 'text-green-600 bg-green-100 rounded-full px-2 py-1' : 'text-red-600 bg-red-100 rounded-full px-2 py-1'}`}>
                              {objetivo.estado_actual}
                            </span>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className='flex items-center justify-center h-full'>
                <p className='font-bold text-lg'>El usuario no tiene objetivos asignados</p>
              </div>
            )}
          </div>
        </section>
        
      </div>
    </div>
  )
}
