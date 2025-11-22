import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';
import { useUpdateObjetivo, useUploadDocument } from '@/hooks/useQueries';

const FileUploadButton = ({ objetivoId, setDialog }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(null);
  const fileInputRef = useRef(null);
  const actualizarObjetivo = useUpdateObjetivo();
  const uploadDocument = useUploadDocument();
  
  const handleFileClick = () => {
    fileInputRef.current.click();
  };
  
  const handleListo = (e) => {
    // Check if e is an ID string or an event object
    let objetivoId;
    
    if (typeof e === 'string') {
      // If e is already the ID itself (from FileUploadButton)
      objetivoId = e;
    } else if (e && e.currentTarget) {
      // If e is an event object (from button click)
      objetivoId = e.currentTarget.getAttribute('data-objetivo-id');
    } else {
      console.error('No se pudo obtener el ID del objetivo');
      return;
    }
    
    console.log('Objetivo ID:', objetivoId);
    
    // Utilizar el hook actualizarObjetivo para cambiar el estado del objetivo a completado
    actualizarObjetivo.mutate(objetivoId, {
      onSuccess: () => {
        toast.success('Objetivo actualizado correctamente');
        setDialog(false); // Solo cerramos el diálogo
      },
      onError: (error) => {
        console.error('Error al actualizar el objetivo:', error);
        toast.error('Error al actualizar el objetivo. Intente nuevamente.');
      }
    });
  }
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    
    try {
      // Create FormData to send file
      const formData = new FormData();
      formData.append('document', file); // Changed from 'file' to 'document' to match backend expectation
      formData.append('objetivoId', objetivoId);
      
      // Usar el hook para subir el documento
      uploadDocument.mutate(formData, {
        onSuccess: (data) => {
          console.log('Respuesta del servidor:', data);
          // Guardar la URL del documento si está disponible
          const fileUrl = data?.url || data?.fileUrl || data?.path || null;
          if (fileUrl) {
            console.log('URL del documento:', fileUrl);
            setDocumentUrl(fileUrl);
          }
          toast.success('Archivo subido correctamente.');
          setUploadComplete(true); // Mark upload as complete
          setUploading(false);
        },
        onError: (error) => {
          console.error('Error al subir el archivo:', error);
          toast.error(`Error al subir el archivo`);
          setUploading(false);
        }
      });
    } catch (error) {
      console.error('Error en proceso de subida:', error);
      toast.error(`Error al subir el archivo`);
      setUploading(false);
    } finally {
      e.target.value = null; // Reset file input
    }
  };

  return (
    <>
      {!uploadComplete && (
        <button
          className='flex items-center gap-2 text-base text-white font-sans border border-gray-300 bg-gray-200 rounded-sm px-2 py-1 hover:bg-gray-300'
          onClick={handleFileClick}
          title="Subir evidencia de completado"
        >
          {uploading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <CloudUploadIcon fontSize="small"/>
          )}
          <span className='text-gray-500'>Subir archivo</span>
        </button>
      )}

      {uploadComplete && (
        <span className='text-gray-500 border-gray-300 text-base bg-gray-200 rounded-sm px-2 py-1 font-sans'>Archivo subido correctamente</span>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
      <button 
          className='text-base text-gray-500 font-sans border border-green-300 bg-green-200 rounded-sm px-2 py-1 hover:bg-green-400'
          onClick={handleListo}
          data-objetivo-id={objetivoId}
          disabled ={objetivoId.estado_actual==="completado" || uploadComplete===false}
          hidden ={objetivoId.estado_actual==="completado"}
        >
        listo
    </button>

    </>
  );
};

export default FileUploadButton;
