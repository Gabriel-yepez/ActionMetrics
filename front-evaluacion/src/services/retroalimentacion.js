import { urlApi } from "@/config/config";

export const guardarRetroalimentacion = async (data) => {
    try {
        const { evaluacionId, usuarioId, comentario, fecha } = data;
        
        const response = await fetch(`${urlApi}/retroalimentacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
        const response = await fetch(`${urlApi}/retroalimentacion`);
        if (!response.ok) {
            console.log('Error al obtener la retroalimentación');
        }
        return await response.json();
    } catch (error) {
        console.error('Error al obtener la retroalimentación:', error);
    }
};