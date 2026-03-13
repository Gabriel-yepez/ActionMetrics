import { authFetch } from '@/services/authFetch';

export const uploadDocument = async (formData) => {
  try {
    if (!(formData instanceof FormData)) {
      console.error('Error: formData no es una instancia de FormData');
      throw new Error('Formato de datos inválido');
    }

    const response = await authFetch('/documentos', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Error ${response.status} al subir el archivo`);
    }

    return result.data;
  } catch (error) {
    console.error('Error en servicio uploadDocument:', error);
    throw error;
  }
};


export const getDocument = async () => {
  try {
    const response = await authFetch('/documentos');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al obtener los documentos');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error al obtener el documento:', error);
    throw error;
  }
};
