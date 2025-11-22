import { urlApi } from '@/config/config';

export const uploadDocument = async (formData) => {
  try {
    if (!(formData instanceof FormData)) {
      console.error('Error: formData no es una instancia de FormData');
      throw new Error('Formato de datos inválido');
    }
    
    const response = await fetch(`${urlApi}/documentos`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // Intentar obtener el mensaje de error del cuerpo de la respuesta
      let errorMessage = 'Error al subir el archivo';
      try {
        const errorData = await response.text();
        console.error('Cuerpo de respuesta de error:', errorData);
        errorMessage = `Error ${response.status}: ${errorData || response.statusText}`;
      } catch (e) {
        // Si no podemos leer el cuerpo, usamos el mensaje genérico
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Datos de respuesta:', data);
    return data;
  } catch (error) {
    console.error('Error en servicio uploadDocument:', error);
    throw error;
  }
};


export const getDocument = async () => {
  try {
    const response = await fetch(`${urlApi}/documentos`);
    if (!response.ok) {
      throw new Error('Error al obtener el documento');
    }

    const res= await response.json();
    return res;
    
  } catch (error) {
    console.error('Error al obtener el documento:', error);
    throw error;
  }
};
  