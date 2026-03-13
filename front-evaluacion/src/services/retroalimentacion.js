import { authFetch } from "@/services/authFetch";

export const guardarRetroalimentacion = async (data) => {
    try {
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
            console.log('Error al guardar la retroalimentación:', result.message);
        }

        return result.data;
    } catch (error) {
        console.error('Error al guardar la retroalimentación:', error);
    }
};

export const getAllRetroalimentacion = async () => {
    try {
        const response = await authFetch('/retroalimentacion');
        const result = await response.json();

        if (!response.ok) {
            console.log('Error al obtener la retroalimentación:', result.message);
        }

        return result.data || [];
    } catch (error) {
        console.error('Error al obtener la retroalimentación:', error);
    }
};
