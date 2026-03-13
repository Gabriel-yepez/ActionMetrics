import BarraProgreso from "@/components/evaluacion/BarraProgreso"
import { useState, useCallback } from "react"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import StepOne from "./StepOne"
import StepTwo from "./StepTwo"
import StepThree from "./StepThree"
import { useCreateEvaluacion } from "@/hooks/useQueries"

export default function MutiStepForm() {

  const [step, setStep] = useState(1)
  const totalStep = 3

  const [stepsValid, setStepsValid] = useState({
    step1: false,
    step2: false,
    step3: true
  })

  const [reportId, setreportId] = useState("")
  const [dataEvaluacion, setDataEvaluacion] = useState({
    fecha: '',
    comentarioEvaluacion:'',
    estado: false,
  })

  const [habilidadResult, sethabilidadResult] = useState({
    puntuacion: 0,
    comentarioHabilidad: '',
  })

  // Callbacks estables con useCallback para evitar re-renders en hijos
  const updateStep1Validity = useCallback((isValid) => {
    setStepsValid(prev => ({ ...prev, step1: isValid }))
  }, [])

  const updateStep2Validity = useCallback((isValid) => {
    setStepsValid(prev => ({ ...prev, step2: isValid }))
  }, [])

  const nextStep = useCallback(() => {
    setStepsValid(current => {
      const currentStepValid = step === 1 ? current.step1 :
                              step === 2 ? current.step2 : true;
      if (currentStepValid) {
        setStep(prev => Math.min(prev + 1, totalStep))
      }
      return current;
    })
  }, [step, totalStep])

  const prevStep = useCallback(() => setStep(prev => Math.max(prev - 1, 1)), [])

  const createEvaluacionMutation = useCreateEvaluacion()

  const completarEvaluacion = useCallback(() => {
    const evaluacionData = {
      ...dataEvaluacion,
      habilidad: habilidadResult,
      reportId: reportId
    }

    createEvaluacionMutation.mutate(evaluacionData, {
      onSuccess: () => {
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
        setStepsValid({
          step1: false,
          step2: false,
          step3: true
        })
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
        console.error("Error al crear la evaluación:", error)
        toast.error("Error al crear la evaluación", {
          position: "top-right",
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
        })
      }
    })
  }, [dataEvaluacion, habilidadResult, reportId, createEvaluacionMutation])

  return (
    <div className="flex flex-col h-screen">
        <ToastContainer />
        <BarraProgreso currentStep={step}/>
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
