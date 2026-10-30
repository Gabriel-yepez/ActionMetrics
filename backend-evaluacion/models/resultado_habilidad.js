const {DataTypes}=require('sequelize')
const { encryptedAttribute } = require('../services/dataEncryption')

module.exports = (sequelize)=>{

    return sequelize.define('resultado_habilidad',
        {
            id:{
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            puntuacion:{
                type: DataTypes.INTEGER,
                allowNull:false,
                validate:{
                    min: 1,
                    max: 5,
                }
            },
            comentario: encryptedAttribute('resultado_habilidad', 'comentario'),
        },{
            freezeTableName: true,
            timestamps: false,
        }
    )
}