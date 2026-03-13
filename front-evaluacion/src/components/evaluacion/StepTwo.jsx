import { useState, useEffect, useCallback, useMemo } from "react";
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

  const [responses, setResponses] = useState(habilidadResult?.responses || {});
  const [comments, setComments] = useState(habilidadResult?.comentarioHabilidad || "");

  // Validación derivada con useMemo en lugar de useEffect
  const isFormValid = useMemo(() => {
    const allAnswered = indicators.every(indicator => responses[indicator]);
    const commentValid = comments && comments.trim().length > 0;
    return allAnswered && commentValid;
  }, [responses, comments]);

  // Notificar validez al padre
  useEffect(() => {
    onValidation?.(isFormValid);
  }, [isFormValid, onValidation]);

  // Calcular puntuación con useMemo en lugar de useEffect + setState
  const puntuacionFinal = useMemo(() => {
    let puntuacionHabilidades = 0;
    let totalResponsesHabilidades = 0;

    Object.entries(responses).forEach(([, option]) => {
      if (option && optionScores[option]) {
        puntuacionHabilidades += optionScores[option];
        totalResponsesHabilidades++;
      }
    });

    const promedioHabilidades = totalResponsesHabilidades > 0
      ? puntuacionHabilidades / totalResponsesHabilidades
      : 0;

    const allAnswered = indicators.every(indicator => responses[indicator]);

    if (allAnswered && objetivosUsuarios && objetivosUsuarios.length > 0) {
      const resultado = calculoDeObjetivos(objetivosUsuarios);
      const promedioObjetivos = resultado.totalResponsesObjetivos > 0
        ? resultado.puntuacionTotalObjetivos / resultado.totalResponsesObjetivos
        : 0;
      const promedio = (promedioHabilidades + promedioObjetivos) / 2;
      return Math.max(1, Math.min(5, promedio));
    }

    return promedioHabilidades;
  }, [responses, objetivosUsuarios]);

  // Sincronizar con el padre solo cuando cambia la puntuación o los comentarios
  useEffect(() => {
    sethabilidadResult(prev => ({
      ...prev,
      puntuacion: puntuacionFinal.toFixed(0),
      responses,
      comentarioHabilidad: comments,
    }));
  }, [puntuacionFinal, responses, comments, sethabilidadResult]);

  const handleSelect = useCallback((indicator, option) => {
    setResponses(prev => ({ ...prev, [indicator]: option }));
  }, []);

  const handleCommentsChange = useCallback((e) => {
    setComments(e.target.value);
  }, []);

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
