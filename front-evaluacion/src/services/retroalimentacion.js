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

        if (!response.ok) {
            console.log('Error al guardar la retroalimentación');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al guardar la retroalimentación:', error);
    }
};

export const getAllRetroalimentacion = async () => {
    try {
        const response = await authFetch('/retroalimentacion');
        if (!response.ok) {
            console.log('Error al obtener la retroalimentación');
        }
        return await response.json();
    } catch (error) {
        console.error('Error al obtener la retroalimentación:', error);
    }
};
