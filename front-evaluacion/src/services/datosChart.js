import { authFetch } from "@/services/authFetch";

export const graficaGeneral = async (departamento = null) => {
    try {
        let url = '/evaluaciones/grafica'
        if (departamento) url += `?departamento=${departamento}`
        const response = await authFetch(url);
        if (!response.ok) {
          throw new Error(`Error al obtener datos para la gráfica: ${response.status}`);
        }
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error("Error al obtener datos para la gráfica general:", error);
        return [];
    }
};

export const graficaUsuario = async (userId) => {
  try {
    const response = await authFetch(`/evaluaciones/grafica/${userId}`);

    if (!response.ok) {
      throw new Error(`Error al obtener datos para la gráfica del usuario: ${response.status}`);
    }
    const result = await response.json();
    return result.data || {};
  } catch (error) {
    console.error("Error al obtener datos para la gráfica del usuario:", error);
    return {};
  }
};
