import { authFetch } from "@/services/authFetch";

export const guardarRetroalimentacion = async (data) => {
    const { evaluacionId, usuarioId, comentario, fecha } = data;

    const response = await authFetch('/retroalimentacion', {
        method: 'POST',
        body: JSON.stringify({
            comentario,
            fecha,
            id_evaluacion: evaluacionId,
            id_usuario: usuarioId
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'No se pudo guardar la retroalimentación.');
    }

    return result.data;
};

export const getAllRetroalimentacion = async (departamento = null) => {
    let url = '/retroalimentacion'
    if (departamento) url += `?departamento=${departamento}`
    const response = await authFetch(url);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'No se pudieron obtener las retroalimentaciones.');
    }

    return result.data || [];
};
