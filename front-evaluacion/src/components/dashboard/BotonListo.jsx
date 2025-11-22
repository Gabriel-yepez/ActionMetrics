import { useUpdateObjetivo } from '@/hooks/useQueries';
import { toast } from 'react-toastify';

export default function BotonListo({ objetivo }) {
  const actualizarObjetivo = useUpdateObjetivo();

  const handleListo = (e) => {
    const objetivoId = e.currentTarget.getAttribute('data-objetivo-id');
    if (!objetivoId) {
      console.error('No se pudo obtener el ID del objetivo');
      return;
    }
    
    // Utilizar el hook actualizarObjetivo para cambiar el estado del objetivo a completado
    actualizarObjetivo.mutate(objetivoId, {
      onSuccess: () => {
        toast.success('Objetivo completado correctamente');
      },
      onError: (error) => {
        console.error('Error al actualizar el objetivo:', error);
        toast.error('Error al actualizar el objetivo. Intente nuevamente.');
      }
    });
  };

  return (
    <button 
      className='text-base text-gray-500 font-sans border border-green-300 bg-green-200 rounded-sm px-2 py-1 hover:bg-green-400'
      onClick={handleListo}
      data-objetivo-id={objetivo.id}
      disabled={objetivo.estado_actual === "completado"}
      hidden={objetivo.estado_actual === "completado"}
    >
      listo
    </button>
  );
}
