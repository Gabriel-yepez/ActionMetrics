const { Op } = require('sequelize');
const { Evaluacion } = require('../db/sequelize');

const generarConteoGeneral = async () => {
  // Inicializar array con todos los meses y contadores en cero
  const estadisticasMensuales = [
    { name: 'Enero', evaluaciones: 0 },
    { name: 'Febrero', evaluaciones: 0 },
    { name: 'Marzo', evaluaciones: 0 },
    { name: 'Abril', evaluaciones: 0 },
    { name: 'Mayo', evaluaciones: 0 },
    { name: 'Junio', evaluaciones: 0 },
    { name: 'Julio', evaluaciones: 0 },
    { name: 'Agosto', evaluaciones: 0 },
    { name: 'Septiembre', evaluaciones: 0 },
    { name: 'Octubre', evaluaciones: 0 },
    { name: 'Noviembre', evaluaciones: 0 },
    { name: 'Diciembre', evaluaciones: 0 }
  ];

  // Usar fechas estáticas para todo el año 2024
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-12-31');
  
  const whereClause = {
    fecha: {
      [Op.between]: [startDate, endDate]
    }
  };
  
  // Buscar siempre las evaluaciones en la base de datos cuando se hace la petición
  const evaluaciones = await Evaluacion.findAll({
    where: whereClause,
    attributes: ['id', 'fecha'],
    raw: true
  });
  
  // Procesar cada evaluación y contar por mes
  evaluaciones.forEach(evaluacion => {
    // Asegurar que la fecha se interprete correctamente, independiente de la zona horaria
    const fechaString = evaluacion.fecha.split('T')[0]; // Obtener solo la parte de la fecha YYYY-MM-DD
    const [year, month, day] = fechaString.split('-').map(Number);
    const mes = month - 1; // Ajustar porque month es 1-12 pero los índices son 0-11
    estadisticasMensuales[mes].evaluaciones += 1;
  });

  return estadisticasMensuales;
};

const generarConteoUsuario = async (idUsuario) => {
  // Usar fechas estáticas para todo el año 2025
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-12-31');
  
  const whereClause = {
    fecha: {
      [Op.between]: [startDate, endDate]
    }
  };
  
  // Agregar filtro por usuario si se proporciona un ID
  if (idUsuario) {
    whereClause.id_usuario = idUsuario;
  }
  
  // Buscar siempre las evaluaciones en la base de datos cuando se hace la petición
  const evaluaciones = await Evaluacion.findAll({
    where: whereClause,
    attributes: ['id', 'fecha', 'id_usuario'],
    raw: true
  });
  
  // Crear objeto para almacenar estadísticas por usuario
  const estadisticasPorUsuario = {};
  
  // Obtener lista única de usuarios
  const usuarios = [...new Set(evaluaciones.map(e => e.id_usuario))];
  
  // Inicializar estadísticas para cada usuario
  usuarios.forEach(idUsuario => {
    estadisticasPorUsuario[idUsuario] = [
      { name: 'Enero', evaluaciones: 0 },
      { name: 'Febrero', evaluaciones: 0 },
      { name: 'Marzo', evaluaciones: 0 },
      { name: 'Abril', evaluaciones: 0 },
      { name: 'Mayo', evaluaciones: 0 },
      { name: 'Junio', evaluaciones: 0 },
      { name: 'Julio', evaluaciones: 0 },
      { name: 'Agosto', evaluaciones: 0 },
      { name: 'Septiembre', evaluaciones: 0 },
      { name: 'Octubre', evaluaciones: 0 },
      { name: 'Noviembre', evaluaciones: 0 },
      { name: 'Diciembre', evaluaciones: 0 }
    ];
  });
  
  // Procesar cada evaluación
  evaluaciones.forEach(evaluacion => {
    const idUsuario = evaluacion.id_usuario;
    // Asegurar que la fecha se interprete correctamente, independiente de la zona horaria
    const fechaString = evaluacion.fecha.split('T')[0]; // Obtener solo la parte de la fecha YYYY-MM-DD
    const [year, month, day] = fechaString.split('-').map(Number);
    const mes = month - 1; // Ajustar porque month es 1-12 pero los índices son 0-11
    
    // Incrementar contador para este usuario y mes
    if (estadisticasPorUsuario[idUsuario]) {
      estadisticasPorUsuario[idUsuario][mes].evaluaciones += 1;
    }
  });
  
  return estadisticasPorUsuario;
};

module.exports = {
  generarConteoGeneral,
  generarConteoUsuario
};