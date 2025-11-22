import { useState, useEffect } from "react"

export default function Documento({url}) {
  const [dialog, setDialog] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  
  // Gestionar efecto de transición del diálogo
  useEffect(() => {
    let timeoutId;
    if (dialog) {
      // Pequeño retraso para que la animación de entrada se vea bien
      timeoutId = setTimeout(() => setDialogVisible(true), 10);
    }
    return () => clearTimeout(timeoutId);
  }, [dialog]);
  
  const abrirDialog = () => {
    setDialog(true);
  }
  
  const cerrarDialog = () => {
    setDialogVisible(false);
    // Esperar a que termine la animación antes de cerrar completamente
    setTimeout(() => setDialog(false), 300);
  }

  return (
    <>
      <button 
        onClick={abrirDialog}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-full'>
        Ver documento
      </button>

      {dialog && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${dialogVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-white rounded-lg shadow-xl overflow-hidden transition-transform ${dialogVisible ? 'scale-100' : 'scale-95'}`} style={{ width: '80%', height: '80%' }}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Documento</h3>
              <button onClick={cerrarDialog} className="text-gray-500 text-xl hover:text-gray-700">
              ✕
              </button>
            </div>
            <div className="p-0 h-full">
              {/* Determinar qué tipo de visualizador usar según la extensión del archivo */}
              {url && url.toLowerCase().endsWith('.pdf') ? (
                // Visualizador de PDF usando el visor de PDF integrado del navegador
                <object
                  data={`http://localhost:4001${url}#zoom=page-fit&toolbar=0`}
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <p>Tu navegador no puede mostrar el PDF. <a href={`http://localhost:4001${url}`} target="_blank" rel="noopener noreferrer">Descárgalo aquí</a>.</p>
                </object>
              ) : url && /\.(jpe?g|png|gif|bmp|webp)$/i.test(url) ? (
                // Visualizador de imágenes
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <img 
                    src={`http://localhost:4001${url}`} 
                    alt="Documento" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                // Iframe como fallback para otros tipos de documentos
                <iframe 
                  src={`http://localhost:4001${url}#zoom=page-fit&toolbar=0`} 
                  className="w-full h-full"
                  title="Documento"
                  sandbox="allow-same-origin allow-scripts"
                ></iframe>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
