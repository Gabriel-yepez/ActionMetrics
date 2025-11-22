import { useState, useEffect } from "react";
import { calculoDeObjetivos } from "@/helper/calculoDeObjetivos";

const indicators = [
  "Comunicación efectiva",
  "Trabajo en equipo",
  "Capacidad de organizacion",
  "Iniciativa en las actividades",
  "Compromiso con la organización y el equipo de trabajo",
  "Adaptabilidad para ajustarse a cambios"
];
const options = ["Muy bueno", "bueno", "Regular", "Malo", "Muy malo"];

const optionScores = {
  "Muy bueno": 5,
  "bueno": 4,
  "Regular": 3,
  "Malo": 2,
  "Muy malo": 1
};

export default function StepTwo({habilidadResult, sethabilidadResult, onValidation, objetivosUsuarios}) {

  // Inicializar el estado local con valores del estado padre (si existen)
  const [responses, setResponses] = useState(habilidadResult?.responses || {});
  const [comments, setComments] = useState(habilidadResult?.comentarioHabilidad || "");
  
  // Función para validar las respuestas
  const validateResponses = () => {
    // Verificar que todos los indicadores tienen una respuesta seleccionada
    const allAnswered = indicators.every(indicator => responses[indicator]);
    
    // Verificar que se haya ingresado un comentario (si es requerido)
    // Si los comentarios no son obligatorios, quita esta condición
    const commentValid = comments && comments.trim().length > 0;
    
    // Determinar si el formulario es válido (todas las preguntas respondidas y comentario válido)
    const isValid = allAnswered && commentValid;
    
    // Notificar al componente padre sobre el estado de validación
    if (onValidation) {
      onValidation(isValid);
    }
    
    return isValid;
  };
  
  // Cargar datos previos al montar el componente
  useEffect(() => {
    if (habilidadResult) {
      if (habilidadResult.responses) {
        setResponses(habilidadResult.responses);
      }
      if (habilidadResult.comentarioHabilidad) {
        setComments(habilidadResult.comentarioHabilidad);
      }
    }
    
    // Validar formulario al iniciar
    validateResponses();
  }, []);
  
  // Validar cuando cambien las respuestas o comentarios
  useEffect(() => {
    validateResponses();
  }, [responses, comments]);

  const handleSelect = (indicator, option) => {
    setResponses({ ...responses, [indicator]: option });
        
  };
  
  const handleCommentsChange = (e) => {
    setComments(e.target.value);
  };

  useEffect(()=>{
    let puntuacionHabilidades = 0;
    let totalResponsesHabilidades = 0;
    let puntuacionObjetivos = 0;
    let totalResponsesObjetivos = 0;
    
    // Calcular puntuación de habilidades
    Object.entries(responses).forEach(([indicator, option]) => {
      if (option && optionScores[option]) {
        console.log(`Respuesta: ${indicator} - Opción: ${option} - Puntaje: ${optionScores[option]}`);
        puntuacionHabilidades += optionScores[option];
        totalResponsesHabilidades++;
      }
    });
    
    // Calcular promedio de habilidades
    const promedioHabilidades = totalResponsesHabilidades > 0 
      ? puntuacionHabilidades / totalResponsesHabilidades 
      : 0;
    
    const allAnswered = indicators.every(indicator => responses[indicator]);
    
    // Si hay objetivos, calcular su promedio
    if(allAnswered && objetivosUsuarios.length > 0){
        const resultado = calculoDeObjetivos(objetivosUsuarios);
        puntuacionObjetivos = resultado.puntuacionTotalObjetivos;
        totalResponsesObjetivos = resultado.totalResponsesObjetivos;
        
        // Calcular promedio de objetivos
        const promedioObjetivos = totalResponsesObjetivos > 0 
          ? puntuacionObjetivos / totalResponsesObjetivos 
          : 0;
        
        // Calcular promedio final (50% habilidades + 50% objetivos)
        const promedio = (promedioHabilidades + promedioObjetivos) / 2;
        
        // Asegurar que el promedio esté entre 1 y 5
        const finalScore = Math.max(1, Math.min(5, promedio));
        
        // Guardar datos en el estado padre y mostrar logs
        sethabilidadResult({
          ...habilidadResult,
          puntuacion: finalScore.toFixed(0),
          responses
        });
        
        console.log(`Puntuación habilidades: ${promedioHabilidades}, Puntuación objetivos: ${promedioObjetivos}, Promedio final: ${finalScore.toFixed(0)}`);
    } else{
        // Si no hay objetivos pero sí se han respondido todas las habilidades
        // Usar solo el promedio de habilidades
        const finalScore = promedioHabilidades;
        
        // Guardar datos en el estado padre y mostrar logs
        sethabilidadResult({
          ...habilidadResult,
          puntuacion: finalScore.toFixed(0),
          responses
        });
        
        console.log(`Puntuación habilidades: ${promedioHabilidades}, Promedio final: ${finalScore.toFixed(0)}`);
    }

  },[responses, objetivosUsuarios])

   useEffect(()=>{
       sethabilidadResult({
       ...habilidadResult,
       comentarioHabilidad: comments,
       }) 
   },[comments])


  return (
    <div className="flex flex-col h-full w-full p-1 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg p-1 w-full h-full overflow-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Evaluación de habilidades</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 table-auto">
            <thead className="bg-gray-100 text-lg">
              <tr>
                <th className="border border-gray-300 p-2 text-left w-1/3">Habilidades</th>
                {options.map(option => (
                  <th key={option} className="border border-gray-300 p-2 text-center">
                    {option}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {indicators.map(indicator => (
                <tr key={indicator} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">{indicator}</td>
                  {options.map(option => (
                    <td key={option} className="border border-gray-300 p-2 text-center">
                      <input
                        type="radio"
                        name={indicator}
                        value={option}
                        checked={responses[indicator] === option}
                        onChange={() => handleSelect(indicator, option)}
                        className="cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Sección de comentarios */}
        <div className="mt-6">
          <h3 className="font-medium text-lg mb-2">Comentarios adicionales</h3>
          <textarea
            className="h-72 w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="4"
            placeholder="Ingrese sus comentarios adicionales aquí..."
            value={comments}
            onChange={handleCommentsChange}
          ></textarea>
        </div>
      </div>
    </div>
  )
}
