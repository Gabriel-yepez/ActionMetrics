import { useUserStore } from "@/store/userStore"
import { useDashboardStore } from "@/store/dashboardStore"
import { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { filtrarUsuariosEmpleados } from '@/helper/filtroUsers'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTranslations } from 'next-intl'

const formatearFecha = (fecha, noDateText, invalidText) => {
  if (!fecha) return noDateText;
  try {
    const fechaObj = new Date(fecha);
    fechaObj.setDate(fechaObj.getDate() + 1);
    return format(fechaObj, "d 'de' MMMM 'de' yyyy", { locale: es });
  } catch (error) {
    return invalidText;
  }
};

const getUrgencyColor = (fechaVencimiento) => {
  if (!fechaVencimiento) return 'default';
  const hoy = new Date();
  const fechaObj = new Date(fechaVencimiento);
  const diferenciaDias = Math.ceil((fechaObj - hoy) / (1000 * 60 * 60 * 24));
  if (diferenciaDias < 0) return 'error';
  if (diferenciaDias <= 3) return 'warning';
  if (diferenciaDias <= 7) return 'info';
  return 'success';
};

const getUrgencyText = (color) => {
  switch (color) {
    case 'error': return 'overdue';
    case 'warning': return 'fewDays';
    case 'info': return 'sevenDays';
    case 'success': return 'onTrack';
    default: return 'noDeadline';
  }
};

const getUrgencyColorClass = (color) => {
  switch (color) {
    case 'error': return 'text-red-600 bg-red-100';
    case 'warning': return 'text-amber-600 bg-amber-100';
    case 'info': return 'text-blue-600 bg-blue-100';
    case 'success': return 'text-green-600 bg-green-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export default function StepOne({dataEvaluacion, setDataEvaluacion, onValidation}) {
    const t = useTranslations('evaluation');
    const tUrgency = useTranslations('urgency');
    const tCommon = useTranslations('common');
    const formRef = useRef(null)

    const [formValues, setFormValues] = useState({
      id_usuario: dataEvaluacion?.id_usuario || '',
      fecha: dataEvaluacion?.fecha || '',
      comentario: dataEvaluacion?.comentarioEvaluacion || ''
    })

    const users = useUserStore(state => state.users)
    const objetivos = useDashboardStore(state => state.objetivos)

    // Derivar objetivos del usuario seleccionado con useMemo en lugar de useState + useEffect
    const objetivosUsuarios = useMemo(() => {
      if (!formValues.id_usuario) return [];
      const usuarioIdStr = String(formValues.id_usuario);
      return objetivos.filter(objetivo => {
        const objUsuarioId = objetivo.id_usuario ? String(objetivo.id_usuario) : null;
        return objUsuarioId === usuarioIdStr;
      });
    }, [formValues.id_usuario, objetivos])

    // Validar y notificar al padre
    useEffect(() => {
      const isValid = !!(formValues.id_usuario && formValues.fecha && formValues.comentario);
      onValidation?.(isValid);
    }, [formValues, onValidation])

    // Restaurar valores del formulario al volver al paso 1
    useEffect(() => {
      if (dataEvaluacion && formRef.current) {
        const form = formRef.current;
        if (dataEvaluacion.id_usuario) form.id_usuario.value = dataEvaluacion.id_usuario;
        if (dataEvaluacion.fecha) form.fecha.value = dataEvaluacion.fecha;
        if (dataEvaluacion.comentarioEvaluacion) form.comentario.value = dataEvaluacion.comentarioEvaluacion;
      }
    // Solo al montar - restaurar valores previos del formulario
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Sincronizar con el padre solo cuando cambian los valores del form
    const handleInputChange = useCallback(() => {
      if (!formRef.current) return;

      const form = new FormData(formRef.current);
      const id_usuario = form.get('id_usuario');
      const fecha = form.get('fecha');
      const comentarioEvaluacion = form.get('comentario');

      setFormValues({ id_usuario, fecha, comentario: comentarioEvaluacion });
    }, [])

    // Sincronizar con el padre cuando cambian formValues u objetivosUsuarios
    useEffect(() => {
      setDataEvaluacion(prev => ({
        ...prev,
        id_usuario: formValues.id_usuario,
        fecha: formValues.fecha,
        comentarioEvaluacion: formValues.comentario,
        objetivos_usuario: objetivosUsuarios
      }));
    }, [formValues, objetivosUsuarios, setDataEvaluacion])

  return (
    <div className='flex flex-col h-full w-full p-4'>
      <div className='flex flex-col md:flex-row w-full h-full gap-4'>
        <section className='w-full md:w-1/2 p-5 bg-slate-200 rounded-lg shadow-lg flex flex-col h-full'>
          <h1 className='font-semibold text-xl mb-4 text-center'> {t('evalueeData')}</h1>
          <form ref={formRef} onChange={handleInputChange} className='h-full flex flex-col'>
              <div className='flex flex-col gap-2 flex-1 flex-grow'>
                <label
                htmlFor="id_usuario"
                className='font-semibold mt-1 text-lg'
                > {t('personToEvaluate')}</label>
                <select
                  name="id_usuario"
                  id="id_usuario"
                  className='border border-gray-300 rounded-md p-2 text-lg'
                  defaultValue={dataEvaluacion?.id_usuario || ''}
                >
                  <option value="">{t('selectPerson')}</option>
                  {users && filtrarUsuariosEmpleados(users).map(user => (
                    <option key={user.id} value={user.id}>
                      {user.nombre} {user.apellido}
                    </option>
                  ))}
                </select>

                <label htmlFor="fecha"
                className='font-semibold mt-1 text-lg'
                >{tCommon('date')}</label>

                <input
                type="date"
                id="fecha"
                name="fecha"
                className='border border-gray-300 rounded-md p-2 text-lg'
                defaultValue={dataEvaluacion?.fecha || ''}
                />

                <label
                htmlFor="comentario"
                className='font-semibold mt-1 text-lg'
                >{t('comments')}</label>

                <div className="flex-1 min-h-[150px]">
                  <textarea
                  id="comentario"
                  name="comentario"
                  className='border border-gray-300 rounded-md p-2 h-full w-full resize-none text-lg'
                  placeholder={t('commentsPlaceholder')}
                  defaultValue={dataEvaluacion?.comentarioEvaluacion || ''}
                  />
                </div>
              </div>
          </form>
        </section>

        <section className='w-full md:w-1/2 p-5 bg-white rounded-lg shadow-lg flex flex-col h-full'>
          <h1 className='font-semibold text-xl mb-4 text-center'>{t('evalueeObjectives')}</h1>
          <div className='flex-1 overflow-auto'>
            {!formValues.id_usuario ? (
              <div className='flex items-center justify-center h-full'>
                <p className='font-bold text-lg'>{t('selectUserForObjectives')}</p>
              </div>
            ) : objetivosUsuarios.length > 0 ? (
              <ul className='space-y-2'>
                {objetivosUsuarios.map((objetivo, index) => {
                  const urgencyColor = getUrgencyColor(objetivo.fecha_fin);
                  const urgencyKey = getUrgencyText(urgencyColor);

                  return (
                    <li key={objetivo.id || index} className='border-b border-gray-300 py-2'>
                      {objetivo.descripcion && (
                        <div className='text-gray-600'>{objetivo.descripcion}</div>
                      )}

                      {objetivo.fecha_fin && (
                        <div className='mt-1'>
                          <span className='font-medium'>{t('dueDate')} </span>
                          <span>{formatearFecha(objetivo.fecha_fin, tCommon('noDateLimit'), tCommon('invalidDate'))} </span>
                          <span className={`${getUrgencyColorClass(urgencyColor)} rounded-full px-2 py-1`}>
                              {tUrgency(urgencyKey)}
                          </span>
                        </div>
                      )}

                      <div className='mt-1 flex flex-wrap gap-2'>
                        {objetivo.estado_actual && (
                          <div>
                            <span className='font-medium'>{t('statusLabel')} </span>
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
                <p className='font-bold text-lg'>{t('noObjectivesAssigned')}</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
