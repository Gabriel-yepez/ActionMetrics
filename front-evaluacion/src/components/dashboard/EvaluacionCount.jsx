import EventNoteIcon from '@mui/icons-material/EventNote';

export default function EvaluacionCount({evaluacionCount}) {
 
    return (
    <div className="flex justify-normal items-center w-full h-full p-6">
        <section className="m-2">
            <EventNoteIcon sx={{fontSize: 80, color: "#2196F3"}} />
        </section>
        
        <section className="text-center">       
            <h1 className="text-2xl font-semibold mb-2"> 
                Evaluaciones totales
            </h1>
            <span className=" text-2xl font-medium ">
                {evaluacionCount !== null ? evaluacionCount : 0}
            </span>
        </section>
    
  </div>
  )
}
