import BarraProgreso from "@/components/evaluacion/BarraProgreso"
import { useState, useEffect } from "react"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import StepOne from "./StepOne"
import StepTwo from "./StepTwo"
import StepThree from "./StepThree"
import { useCreateEvaluacion } from "@/hooks/useQueries"

export default function MutiStepForm() {

  const [step,setStep]= useState(1)
  const totalStep = 3

  // Estados para controlar la validación de cada paso
  const [stepsValid, setStepsValid] = useState({
    step1: false,
    step2: false,
    step3: true // El paso 3 no necesita validación, es solo visualización
  })

  const [reportId, setreportId] =useState("")
  const [dataEvaluacion, setDataEvaluacion]= useState({
    fecha: '',
    comentarioEvaluacion:'',
    estado: false,
  })

  const [habilidadResult , sethabilidadResult]= useState({
    puntuacion: 0,
    comentarioHabilidad: '',
  })
  
  // Detectar cambios en el usuario seleccionado para reiniciar datos del paso 2
  useEffect(() => {
    // Verificar si id_usuario ha cambiado
    if (dataEvaluacion.id_usuario) {
      // Reiniciar los datos del paso 2
      sethabilidadResult({
        puntuacion: 0,
        comentarioHabilidad: '',
      });
    }
  }, [dataEvaluacion.id_usuario]);

  // Funciones para actualizar la validez de cada paso
  const updateStep1Validity = (isValid) => {
    setStepsValid(prev => ({ ...prev, step1: isValid }))
  }

  const updateStep2Validity = (isValid) => {
    setStepsValid(prev => ({ ...prev, step2: isValid }))
  }

  // Handle next step and save form data when moving from step 1
  const nextStep = () => {
    // Verificar si el paso actual es válido antes de proceder
    const currentStepValid = step === 1 ? stepsValid.step1 : 
                            step === 2 ? stepsValid.step2 : true;
    
    if (!currentStepValid) {
      // No permitir avanzar si el paso actual no es válido
      return;
    }
    // Proceed to next step
    setStep((prev) => Math.min(prev + 1, totalStep))
  }
  
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  const createEvaluacionMutation = useCreateEvaluacion()

  const completarEvaluacion = () =>{
    // Preparar datos para enviar al servidor
    const evaluacionData = {
      ...dataEvaluacion,
      habilidad: habilidadResult,
      reportId: reportId
    }
    
    // Ejecutar la mutación para crear la evaluación
    createEvaluacionMutation.mutate(evaluacionData, {
      onSuccess: () => {
        // Reiniciar todos los estados a sus valores iniciales
        setStep(1)
        setDataEvaluacion({
          fecha: '',
          comentarioEvaluacion: '',
          estado: false,
        })
        sethabilidadResult({
          puntuacion: 0,
          comentarioHabilidad: '',
        })
        setreportId("")
        // Reiniciar validaciones
        setStepsValid({
          step1: false,
          step2: false,
          step3: true
        })
        // Mostrar mensaje de éxito con toast
        toast.success("Evaluación creada exitosamente", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
        
      },
      onError: (error) => {
        // Manejar errores
        console.error("Error al crear la evaluación:", error)
        toast.error("Error al crear la evaluación", {
          position: "top-right",
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
        })
      }
    })
  }

  return (
    <div className="flex flex-col h-screen">
        <ToastContainer />
        <BarraProgreso currentStep={step}/>
      {/* componentes principales segun el paso 1,2,3 */}
      <div className="flex-1 overflow-auto">
        {step===1 && <StepOne 
          dataEvaluacion={dataEvaluacion} 
          setDataEvaluacion={setDataEvaluacion}
          onValidation={updateStep1Validity}
        />}
        {step===2 && <StepTwo 
          habilidadResult={habilidadResult} 
          sethabilidadResult={sethabilidadResult}
          onValidation={updateStep2Validity}
          objetivosUsuarios={dataEvaluacion.objetivos_usuario}
        />}
        {step===3 && <StepThree 
          dataEvaluacion={dataEvaluacion} 
          habilidadResult={habilidadResult} 
          setreportId={setreportId}
        />}
      </div>
      
      {/* botones segun el paso 1,2,3 */}
      <div className="flex justify-center gap-4 p-4" > 
        {step > 1 && (
          <button 
            onClick={prevStep}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg"
          >
            Regresar
          </button>
        )}

        {step < totalStep ? (
          <button 
            onClick={nextStep}
            disabled={step === 1 ? !stepsValid.step1 : step === 2 ? !stepsValid.step2 : false}
            className={`${step === 1 && !stepsValid.step1 || step === 2 && !stepsValid.step2 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-6 rounded-lg`}
          >
            Siguiente
          </button>
        ) : (
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg"
            onClick={completarEvaluacion}
          >
            Completar
          </button>
        )}
      </div>
    </div>
  )
}
