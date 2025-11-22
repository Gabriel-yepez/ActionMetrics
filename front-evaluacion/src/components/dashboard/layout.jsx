import Logo from "../Logo"
import Link from "next/link"
import { usePathname } from 'next/navigation';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import LogoutIcon from '@mui/icons-material/Logout';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useSesionStore } from '@/store/sesionStore';
import { useDashboardStore } from '@/store/dashboardStore';

export default function Layout({children}) {
 
  const { usuario , logout } = useSesionStore()
  const { resetObjetivos } = useDashboardStore()
  const pathname = usePathname();
  const borrarUsuarios = () =>{
    logout()
    resetObjetivos()
  }
  return (

    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">

      <aside className="w-full flex-none md:w-64 bg-gradient-to-b from-indigo-500 to-indigo-300">

        <div className="flex h-full flex-col px-3 py-4 md:px-2">

          <h1 className="mb-2 flex h-20 items-end justify-start md:h-40">
            <div className="w-32 text-white md:h-40">
              <Logo/>
            </div>
          </h1>

          <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">

            <Link href="/dashboard" 
            className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/dashboard' ? 'bg-indigo-600' : ''}`} >
            <DashboardIcon size={30} />
            Inicio
            </Link>
            
            {usuario && usuario.id_rol === 1 &&
            <Link href="/evaluacion" 
            className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/evaluacion' ? 'bg-indigo-600' : ''}`} >
            <TextSnippetIcon size={30}/>
            Generar evaluación
            </Link>
            }
            
            <Link href="/historial" 
            className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/historial' ? 'bg-indigo-600' : ''}`} >
            <HistoryIcon size={30}/>
            Historial
            </Link>

            <Link href="/personal" 
            className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/personal' ? 'bg-indigo-600' : ''}`} >
            <PersonIcon size={30}/>
            Personal
            </Link>

            <Link href="/rendimiento" 
            className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/rendimiento' ? 'bg-indigo-600' : ''}`} >
            <LeaderboardIcon size={30}/>
            Rendimiento
            </Link>
            
            <Link href="/notificaciones" 
            className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/notificaciones' ? 'bg-indigo-600' : ''}`} >
            <NotificationsIcon size={30}/>
            Notificaciones
            </Link>

            <div className="hidden h-auto w-full grow md:block"></div>

            <Link href="/" 
            className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/' ? 'bg-indigo-600' : ''}`} 
            onClick={borrarUsuarios}
            >
            <LogoutIcon size={30}/>
            Salir
            </Link>

          </div>
          

        </div>
      </aside>
            
       <div className="flex-grow p-6 md:overflow-y-auto md:p-0">
          {children}
       </div>

    </div>
  )
}
