const { Sequelize } = require('sequelize')
require('dotenv').config();

const UsuarioModel= require('../models/usuario')
const RolModel= require('../models/roles')
const EvaluacionModel= require('../models/evaluacion')
const ObjetivoModel= require('../models/objetivo')
const TipoObjetivoModel= require('../models/tipo_objetivo')
const HabilidadModel= require('../models/habilidades')
const ResultadoHabilidadModel= require('../models/resultado_habilidad')
const PlanMejoraModel= require('../models/plan_mejora')
const RetroalimmentacionModel= require('../models/retroalimentacion') 

//conectando a la BD
const sequelize = new Sequelize('evaluacion', 'postgres', process.env.passwordDB, {
    host: 'localhost',
    dialect: 'postgres',
  });

//declaracion de los modelos
const Usuario = UsuarioModel(sequelize);
const Rol = RolModel(sequelize);
const Evaluacion = EvaluacionModel(sequelize);
const Objetivo = ObjetivoModel(sequelize);
const TipoObjetivo = TipoObjetivoModel(sequelize);
const Habilidad = HabilidadModel(sequelize);
const ResultadoHabilidad = ResultadoHabilidadModel(sequelize);
const PlanMejora = PlanMejoraModel(sequelize);
const Retroalimentacion = RetroalimmentacionModel(sequelize);

//relaciones
Usuario.belongsTo(Rol, {foreignKey: 'id_rol'})
Evaluacion.belongsTo(Usuario, {foreignKey: 'id_usuario'})
ResultadoHabilidad.belongsTo(Evaluacion, {foreignKey: 'id_evaluacion'})
ResultadoHabilidad.belongsTo(Habilidad, {foreignKey: 'id_habilidad'})
Objetivo.belongsTo(Usuario, {foreignKey: 'id_usuario'})
Objetivo.belongsTo(TipoObjetivo, {foreignKey: 'id_tipo_objetivo'})
PlanMejora.belongsTo(Evaluacion, {foreignKey: 'id_evaluacion'})
PlanMejora.belongsTo(Usuario,{foreignKey: 'id_usuario'})
Retroalimentacion.belongsTo(Usuario, {foreignKey: 'id_usuario'})
Retroalimentacion.belongsTo(Evaluacion, {foreignKey: 'id_evaluacion'})

//sincronizar con base de datos
/* const syncDatabase = async () => {
  try {
      await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
      console.log('Database synchronized');
  } catch (error) {
      console.error('Error synchronizing database:', error);
  }
};   
 
syncDatabase(); */

module.exports={
  sequelize,
  Usuario,
  Rol,
  Evaluacion,
  Objetivo,
  TipoObjetivo,
  Habilidad,
  ResultadoHabilidad,
  PlanMejora,
  Retroalimentacion
}
  
