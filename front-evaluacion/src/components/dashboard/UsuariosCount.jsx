import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function UsuariosCount({usuariosCount}) {

  return (
    <div className="flex justify-normal items-center w-full h-full p-3 md:p-6">
      <section className="m-1 md:m-2 shrink-0">
        <AccountCircleIcon sx={{fontSize: {xs: 48, md: 80}, color: "#818cf8"}} />
      </section>

      <section className="text-center min-w-0">
        <h1 className="text-lg md:text-2xl font-semibold mb-1 md:mb-2">
          Cantidad del personal
        </h1>
        <span className="text-lg md:text-2xl font-medium">
          {usuariosCount !== null ? usuariosCount : 0}
        </span>
      </section>

    </div>
  )
}
