import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function UsuariosCount({usuariosCount}) {
  

  return (
    <div className="flex justify-normal items-center w-full h-full p-6">
      <section className="m-2">
        <AccountCircleIcon sx={{fontSize: 80, color: "#818cf8"}} />
      </section>
      
      <section className="text-center">       
        <h1 className="text-2xl font-semibold mb-2"> 
          Cantidad del personal 
        </h1>
        <span className=" text-2xl font-medium ">
          {usuariosCount !== null ? usuariosCount : 0}
        </span>
      </section>
      
    </div>
  )
}

