import LogoInicio from "../LogoInicio";
import Form from "./Form";



export default function InicioRegister() {
  return (
    <div>
       <div className='flex h-screen'>
            <div className="flex flex-col bg-gradient-to-b from-indigo-500 to-indigo-300 w-1/2 justify-center items-center p-8">
              <LogoInicio/>       
              <div className="text-5xl font-boldm mb-4 text-white">Bienvenidos a ActionMetrics</div>
            </div>
            <div className="flex flex-col bg-white w-1/2 justify-center items-center">
              <h1 className="text-2xl font-bold mb-5">Registro de Usuario</h1>
              <Form/>
            </div>
       </div>
    </div>
  )
}
