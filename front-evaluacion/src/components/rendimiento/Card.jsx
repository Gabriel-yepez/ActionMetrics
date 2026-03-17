
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import {formatearFecha} from '@/services/formatearFecha'
import { ordenarObjetivosPorFecha } from '@/helper/FiltrarFecha'
import { useGetDocuments } from '@/hooks/useQueries';
import { emparejarDocumentosConObjetivos } from '@/helper/buscarDocumento';
import Documento from './Documento';
// Colores para la gráfica
const COLORS = ['#4caf50', '#f44336', '#2196f3', '#ff9800'];

// Componente personalizado para el tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-2 shadow-md rounded-md border border-gray-200">
        <p className="font-semibold">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function Card({ userData, objetivos }) {
  const t = useTranslations('performance');
  const tCommon = useTranslations('common');
  const { data: documentos } = useGetDocuments();

  // Procesar objetivos con sus documentos correspondientes
  const objetivosConDocumentos = useMemo(() => {
    return documentos ? emparejarDocumentosConObjetivos(documentos, objetivos) : objetivos;
  }, [documentos, objetivos]);

  const objetivosToShow = ordenarObjetivosPorFecha(objetivosConDocumentos, 'inicio');

  // Derivar stats y chartData con useMemo en lugar de useEffect + setState
  const stats = useMemo(() => {
    if (!objetivos || objetivos.length === 0) return { completados: 0, pendientes: 0, total: 0 };
    const completados = objetivos.filter(obj => obj.estado_actual === 'completado').length;
    const pendientes = objetivos.filter(obj => obj.estado_actual === 'no completado').length;
    return { completados, pendientes, total: objetivos.length };
  }, [objetivos]);

  const chartData = useMemo(() => {
    if (!objetivos || objetivos.length === 0) return [];
    return [
      { name: t('completed'), value: stats.completados },
      { name: t('pendingItems'), value: stats.pendientes }
    ];
  }, [objetivos, stats, t]);

  // Si no hay datos o no hay objetivos, mostrar mensaje apropiado
  if (!userData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <p className="text-center text-gray-500">{t('loadingUserData')}</p>
      </div>
    );
  }
  
  if (!objetivos || objetivos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="text-center py-4">
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 inline-block">
            <p className="text-yellow-700">{t('noObjectivesYet')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* División en dos columnas en pantallas medianas y grandes */}
      <div className="md:flex">
        {/* Primera sección: Gráfica */}
        <div className="md:w-1/2 p-4 border-r border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{t('objectivesProgress')}</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Segunda sección: Información del usuario y resumen */}
        <div className="md:w-1/2 p-4 bg-gray-50">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">{userData.nombre} {userData.apellido}</h2>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{t('objectivesSummary')}</h3>
            <p className="text-gray-700 mb-2">
              {t('summaryText', { total: stats.total, completed: stats.completados, pending: stats.pendientes })}
            </p>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className="bg-green-500 h-4 rounded-full" 
                style={{ width: `${stats.total > 0 ? (stats.completados / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {t('progressLabel')} {stats.total > 0 ? ((stats.completados / stats.total) * 100).toFixed(0) : 0}%
            </p>
          </div>
          
          <div className="flex justify-between">
            <div className="text-center p-2 bg-green-100 rounded-lg w-5/12">
              <span className="block text-2xl font-bold text-green-600">{stats.completados}</span>
              <span className="text-sm text-green-700">{t('completed')}</span>
            </div>
            <div className="text-center p-2 bg-red-100 rounded-lg w-5/12">
              <span className="block text-2xl font-bold text-red-600">{stats.pendientes}</span>
              <span className="text-sm text-red-700">{t('pendingItems')}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tercera sección: Lista de Objetivos */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-3">{t('theirObjectives')}</h3>
        
        {objetivos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">{tCommon('description')}</th>
                  <th scope="col" className="px-4 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">{tCommon('status')}</th>
                  <th scope="col" className="px-4 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">{t('document')}</th>
                  <th scope="col" className="px-4 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">{t('startDate')}</th>
                  <th scope="col" className="px-4 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">{t('endDate')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {objetivosToShow.map((objetivo, index) => (
                  <tr key={objetivo.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm text-gray-500 whitespace-normal break-words">
                      {objetivo.descripcion}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span 
                        className={`px-4 py-1 text-sm font-semibold rounded-full ${
                          objetivo.estado_actual === 'completado' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {objetivo.estado_actual === 'completado' ? t('completedStatus') : t('notCompletedStatus')}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                      {objetivo.documento_url ? (
                        <Documento url={objetivo.documento_url} />
                      ) : t('noDocument')}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                      {objetivo.fecha_inicio ? formatearFecha(objetivo.fecha_inicio) : tCommon('na')}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                      {objetivo.fecha_fin ? formatearFecha(objetivo.fecha_fin) : tCommon('na')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">{t('noObjectivesAvailable')}</p>
        )}
      </div>
    </div>
  );
}
