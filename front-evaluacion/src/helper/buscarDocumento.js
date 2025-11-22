export const emparejarDocumentosConObjetivos = (documentos, objetivos) => {
  // Depuración: Mostrar los documentos y objetivos recibidos
  console.log('Documentos recibidos:', documentos);
  console.log('Objetivos recibidos:', objetivos);

  // Crear un mapa de documentos por ID de objetivo para búsqueda rápida
  const documentosPorObjetivo = {};
  
  documentos.data.forEach(doc => {
    if (doc.url) {
      // Intentar extraer el ID del objetivo de la URL del documento
      // Formato esperado: "/document/obj_38_20250616_1306"
      const match = doc.url.match(/\/obj_(\d+)/);
      if (match && match[1]) {
        const objetivoId = parseInt(match[1]);
        documentosPorObjetivo[objetivoId] = doc.url;
      }
    }
  });

  // Agregar la URL del documento a cada objetivo si existe
  return objetivos.map(objetivo => {
    const objetivoConDocumento = { ...objetivo };
    
    // Si hay un documento para este objetivo, añadir la URL
    if (documentosPorObjetivo[objetivo.id]) {
      objetivoConDocumento.documento_url = documentosPorObjetivo[objetivo.id];
    }
    
    return objetivoConDocumento;
  });
};
