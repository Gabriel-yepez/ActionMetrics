const {DataTypes}=require('sequelize')
const { encryptedAttribute } = require('../services/dataEncryption')

module.exports = (sequelize)=>{

    return sequelize.define('plan_mejora',
        {
            id:{
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            detalles: encryptedAttribute('plan_mejora', 'detalles'),
            fecha_creacion:{
                type: DataTypes.DATEONLY,
                allowNull: false,
            } , 
        },{
            freezeTableName: true,
            timestamps: false,
        }
    )
}