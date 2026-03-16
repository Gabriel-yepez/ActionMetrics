import { authFetch } from "@/services/authFetch";

export const graficaGeneral = async (departamento = null) => {
    let url = '/evaluaciones/grafica'
    if (departamento) url += `?departamento=${departamento}`
    const response = await authFetch(url);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'No se pudieron obtener los datos de la gráfica.');
    }

    const result = await response.json();
    return result.data || [];
};

export const graficaUsuario = async (userId) => {
    const response = await authFetch(`/evaluaciones/grafica/${userId}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'No se pudieron obtener los datos de la gráfica del usuario.');
    }

    const result = await response.json();
    return result.data || {};
};
