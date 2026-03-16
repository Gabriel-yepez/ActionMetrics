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
import ApartmentIcon from '@mui/icons-material/Apartment';
import { useSesionStore } from '@/store/sesionStore';
import { useDashboardStore } from '@/store/dashboardStore';
import DepartmentSelector from './DepartmentSelector';

export default function Layout({children}) {
 
  const { usuario , logout } = useSesionStore()
  const { resetObjetivos } = useDashboardStore()
  const pathname = usePathname();
  const isAdmin = usuario && (usuario.id_rol === 1 || usuario.id_rol === 3);
  const isSuperAdmin = usuario && usuario.id_rol === 3;
  const borrarUsuarios = () =>{
    logout()
    resetObjetivos()
  }
  return (

    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">

      <aside className="w-full flex-none md:w-64 bg-gradient-to-b from-indigo-500 to-indigo-300">

        <div className="flex h-full flex-col px-3 py-4 md:px-2">

          <h1 className="mb-2 hidden md:flex h-40 items-end justify-start">
            <div className="w-32 text-white h-40">
              <Logo/>
            </div>
          </h1>

          <div className="flex grow flex-row justify-between space-x-1 overflow-x-auto md:flex-col md:space-x-0 md:space-y-2 md:overflow-x-visible">

            <Link href="/dashboard"
            className={`flex h-[48px] shrink-0 grow items-center justify-center gap-1 rounded-md p-2 text-sm md:text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/dashboard' ? 'bg-indigo-600' : ''}`} >
            <DashboardIcon fontSize="small" className="md:text-[30px]" />
            <span className="hidden sm:inline">Inicio</span>
            </Link>

            {isAdmin &&
            <Link href="/evaluacion"
            className={`flex h-[48px] shrink-0 grow items-center justify-center gap-1 rounded-md p-2 text-sm md:text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/evaluacion' ? 'bg-indigo-600' : ''}`} >
            <TextSnippetIcon fontSize="small" className="md:text-[30px]"/>
            <span className="hidden sm:inline">Evaluación</span>
            </Link>
            }

            <Link href="/historial"
            className={`flex h-[48px] shrink-0 grow items-center justify-center gap-1 rounded-md p-2 text-sm md:text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/historial' ? 'bg-indigo-600' : ''}`} >
            <HistoryIcon fontSize="small" className="md:text-[30px]"/>
            <span className="hidden sm:inline">Historial</span>
            </Link>

            <Link href="/personal"
            className={`flex h-[48px] shrink-0 grow items-center justify-center gap-1 rounded-md p-2 text-sm md:text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/personal' ? 'bg-indigo-600' : ''}`} >
            <PersonIcon fontSize="small" className="md:text-[30px]"/>
            <span className="hidden sm:inline">Personal</span>
            </Link>

            <Link href="/rendimiento"
            className={`flex h-[48px] shrink-0 grow items-center justify-center gap-1 rounded-md p-2 text-sm md:text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/rendimiento' ? 'bg-indigo-600' : ''}`} >
            <LeaderboardIcon fontSize="small" className="md:text-[30px]"/>
            <span className="hidden sm:inline">Rendimiento</span>
            </Link>

            <Link href="/notificaciones"
            className={`flex h-[48px] shrink-0 grow items-center justify-center gap-1 rounded-md p-2 text-sm md:text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/notificaciones' ? 'bg-indigo-600' : ''}`} >
            <NotificationsIcon fontSize="small" className="md:text-[30px]"/>
            <span className="hidden sm:inline">Alertas</span>
            </Link>

            {isSuperAdmin &&
            <Link href="/departamentos"
            className={`flex h-[48px] shrink-0 grow items-center justify-center gap-1 rounded-md p-2 text-sm md:text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/departamentos' ? 'bg-indigo-600' : ''}`} >
            <ApartmentIcon fontSize="small" className="md:text-[30px]"/>
            <span className="hidden sm:inline">Departamentos</span>
            </Link>
            }

            <div className="hidden h-auto w-full grow md:block"></div>

            <Link href="/"
            className={`flex h-[48px] shrink-0 grow items-center justify-center gap-1 rounded-md p-2 text-sm md:text-lg text-white font-bold hover:bg-indigo-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === '/' ? 'bg-indigo-600' : ''}`}
            onClick={borrarUsuarios}
            >
            <LogoutIcon fontSize="small" className="md:text-[30px]"/>
            <span className="hidden sm:inline">Salir</span>
            </Link>

          </div>

        </div>
      </aside>
            
       <div className="flex-grow flex flex-col md:overflow-y-auto">
          <div className="p-3 flex justify-end bg-white shadow-sm">
            <DepartmentSelector />
          </div>
          <div className="flex-grow p-6 md:p-0">
            {children}
          </div>
       </div>

    </div>
  )
}
