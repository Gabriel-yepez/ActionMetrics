import { urlApi } from "@/config/config";

export const graficaGeneral = async () => {
    try {
        const response = await fetch(`${urlApi}/evaluaciones/grafica`);
        if (!response.ok) {
          throw new Error(`Error al obtener datos para la gráfica: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener datos para la gráfica general:", error);
        return null;
    }
};

export const graficaUsuario = async (userId) => {
  try {
    const response = await fetch(`${urlApi}/evaluaciones/grafica/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener datos para la gráfica del usuario: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener datos para la gráfica del usuario:", error);
    return null;
  }
};
