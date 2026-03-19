import { useTranslations } from 'next-intl'
import Card from "./Card"
import { useSesionStore } from '@/store/sesionStore'
import { useState, useEffect, useMemo } from 'react'
import { filtrarUsuariosEmpleados } from '@/helper/filtroUsers'
import { useObjetivos, useAllUsers } from '@/hooks/useQueries'

export default function InicioRendimiento({ selectedUserId: initialSelectedId }) {
  const t = useTranslations('performance');
  const { data: users = [] } = useAllUsers()
  const usuario = useSesionStore(state => state.usuario)
  const { data: objetivosData } = useObjetivos()
  const [selectedUserId, setSelectedUserId] = useState('')

  // Establecer usuario inicial
  useEffect(() => {
    if (initialSelectedId) {
      setSelectedUserId(initialSelectedId.toString());
    } else if (usuario && usuario.id_rol === 2 && users && users.length > 0) {
      setSelectedUserId(usuario.id.toString());
    }
  }, [usuario, users, initialSelectedId])

  // Derivar objetivos y usuario seleccionado con useMemo
  const userObjetivos = useMemo(() => {
    if (!objetivosData || !selectedUserId) return [];
    return objetivosData.filter(
      objetivo => objetivo.id_usuario.toString() === selectedUserId
    );
  }, [objetivosData, selectedUserId])

  const selectedUser = useMemo(() => {
    if (!selectedUserId || !users) return null;
    return users.find(u => u.id.toString() === selectedUserId) || null;
  }, [selectedUserId, users])

  const handleUserChange = (e) => {
    setSelectedUserId(e.target.value)
  }

  return (
   <div className="p-4 md:p-8">
     {usuario && (usuario.id_rol === 1 || usuario.id_rol === 3) && <h1 className="text-2xl md:text-4xl font-bold mb-4">{t('employeePerformance')}</h1>}
     {usuario && usuario.id_rol ===2 && <h1 className="text-2xl md:text-4xl font-bold mb-4">{t('myPerformance')}</h1>}

      {usuario  && (usuario.id_rol === 1 || usuario.id_rol === 3) &&
        <div className="mb-6">
            <label htmlFor="usuario" className="block mb-2 font-medium text-gray-700">{t('selectEmployee')}</label>
            <select
            id="usuario"
            name="usuario"
            className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            onChange={handleUserChange}
            value={selectedUserId}
            >
            <option value="">{t('selectAnEmployee')}</option>
            {users && filtrarUsuariosEmpleados(users).map(user => (
                <option key={user.id} value={user.id}>
                {user.nombre} {user.apellido}
                </option>
            ))}
            </select>
        </div>
      }

      {selectedUser && (
        <Card userData={selectedUser} objetivos={userObjetivos} />
      )}

      {!selectedUser && selectedUserId && (
        <div className="bg-yellow-100 p-4 rounded-md border border-yellow-300 text-yellow-800">
          <p>{t('noDataFound')}</p>
        </div>
      )}

      {!selectedUserId && (
        <div className="bg-blue-100 p-4 rounded-md border border-blue-300 text-blue-800">
          <p>{t('selectToView')}</p>
        </div>
      )}
    </div>
  )
}
