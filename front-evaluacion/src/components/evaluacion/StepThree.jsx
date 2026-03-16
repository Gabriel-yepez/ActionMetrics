import { useGetReport ,useGetReportIA } from "@/hooks/useQueries"
import { useEffect, useState } from "react"

export default function StepThree({dataEvaluacion,habilidadResult, setreportId}) {
  const { mutate: fetchReport, isPending: isLoading, isError } = useGetReport()
  const {mutate: fetchReportIA, isPending: isLoadingia, isErroria } = useGetReportIA()
  const [pdfUrl, setPdfUrl] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [idReport, setIdReport] = useState("")
  const [desabilitar, setDesabilitar] = useState(false);

  useEffect(() => {
    // Cargar el reporte al montar el componente
    handleGetReport()
    
    // Limpiar la URL del objeto al desmontar para evitar fugas de memoria
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [])

  const getReportIa = async () => {
    try {
      const reportData ={
        ...dataEvaluacion,
        ...habilidadResult,
        reportId: idReport
      }
      console.log(reportData)
      setErrorMessage(null);
      
      // Ejecutar la mutación con los datos y manejar el resultado con un callback
      fetchReportIA(reportData, {
        onSuccess: (result) => {
          setDesabilitar(true)
          // Verificar que result existe y tiene la propiedad pdfUrl
          if (result && result.pdfUrl) {
            console.log('PDF URL:', result.pdfUrl);
            
            // Capturar el idreport si existe en la respuesta
            if (result.idreport) {
              console.log('ID del reporte recibido:', result.idreport);
              setIdReport(result.idreport);
              setreportId(result.idreport)
            }
            
            setPdfUrl(result.pdfUrl);
          } else {
            console.warn('La respuesta del servidor no incluye la URL del PDF');
            setErrorMessage('El reporte se generó pero no se obtuvo el documento PDF. Haga clic en "Reintentar" para volver a generarlo.');
          }
        },
        onError: (error) => {
          console.error("Error al obtener el reporte con ia:", error);
          setErrorMessage(error.message || 'No se pudo conectar con el servicio de reportes. Verifique su conexión e intente de nuevo.');
        }
      });
      
    } catch (error) {
      console.error("Error al obtener el reporte con ia:", error)
    }
  }

  const handleGetReport = async () => {
    try {
      // Preparar los datos para enviar en el POST request - estructura plana
      const reportData = {
        ...dataEvaluacion,
        ...habilidadResult
      };
      console.log(reportData , dataEvaluacion , habilidadResult)
      
      // Limpiar cualquier mensaje de error anterior
      setErrorMessage(null);
      
      // Ejecutar la mutación con los datos y manejar el resultado con un callback
      fetchReport(reportData, {
        onSuccess: (result) => {
          // Verificar que result existe y tiene la propiedad pdfUrl
          if (result && result.pdfUrl) {
            console.log('PDF URL:', result.pdfUrl);
            
            // Capturar el idreport si existe en la respuesta
            if (result.idreport) {
              console.log('ID del reporte recibido:', result.idreport);
              setIdReport(result.idreport);
              setreportId(result.idreport)
            }
            
            setPdfUrl(result.pdfUrl);
          } else {
            console.warn('La respuesta del servidor no incluye la URL del PDF');
            setErrorMessage('El reporte se generó pero no se obtuvo el documento PDF. Haga clic en "Reintentar" para volver a generarlo.');
          }
        },
        onError: (error) => {
          console.error("Error al obtener el reporte:", error);
          setErrorMessage(error.message || 'No se pudo conectar con el servicio de reportes. Verifique su conexión e intente de nuevo.');
        }
      });
    } catch (error) {
      console.error("Error al obtener el reporte:", error)
    }
  }

  return (
    <div className="flex flex-col h-full w-full overflow-auto p-2">
      <div className="bg-white rounded-lg shadow-lg p-2 w-full h-full overflow-auto">
        
        <div className="flex flex-col md:flex-row w-full h-full gap-4">
          {/* Lado izquierdo - PDF viewer */}
          <div className="w-full md:w-1/2 min-h-[300px] md:h-full flex flex-col">

            <h1 className="font-semibold text-lg md:text-xl text-center mb-2">Resumen de la evaluación</h1>
            {(isError || errorMessage || isErroria) && (
              <div className="flex flex-col justify-center items-center h-full">
                <p className="text-red-600 mb-2">{errorMessage || 'Hubo un problema al cargar el reporte. Haga clic en "Reintentar".'}</p>
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  onClick={handleGetReport}
                >
                  Reintentar
                </button>
              </div>
            )}
            
            <div className="w-full h-full border border-gray-300 rounded overflow-hidden flex flex-col relative">
              {(isLoading || isLoadingia) && (
                <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-80 z-10">
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              )}
              
              {pdfUrl && !isError && (
                <iframe
                  src={`${pdfUrl}#zoom=page-fit&toolbar=0`}
                  className="w-full h-full border-none"
                  title="Resumen de Evaluación"
                ></iframe>
              )}
            </div>
          </div>
          
          {/* Lado derecho - Contenido adicional */}
          <div className="w-full md:w-1/2 md:h-full rounded flex flex-col">

            <h1 className="font-semibold text-lg md:text-xl text-center mb-2">Generar plan de mejorar</h1>

              <section className="flex flex-col justify-center items-center py-8 md:h-[60%] relative">
                <button
                  className={`w-32 h-32 md:w-48 md:h-48 rounded-md ${isLoadingia || desabilitar ? 'bg-indigo-200 cursor-not-allowed' : 'bg-indigo-300 hover:bg-indigo-500 cursor-pointer'} transition-all text-3xl md:text-4xl text-white font-serif shadow-lg flex items-center justify-center`}
                  onClick={getReportIa}
                  disabled={isLoadingia || desabilitar}
                >
                  IA
                </button>
              </section>

              <article className="flex flex-col items-center text-center relative">
                <span className="font-semibold text-sm md:text-base">Despues de este paso ya el proceso esta completado</span>
                {isLoadingia && (
                  <div className="mt-4 flex items-center text-indigo-700">
                    <div className="w-5 h-5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Generando plan de mejora con IA. Esto puede tardar unos segundos...</span>
                  </div>
                )}
              </article>
          </div>


        </div>
      </div>
    </div>
  )
}
