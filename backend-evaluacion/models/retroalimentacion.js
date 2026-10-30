const {DataTypes}=require('sequelize')
const { encryptedAttribute } = require('../services/dataEncryption')

module.exports = (sequelize)=>{

    return sequelize.define('retroalimentacion',
        {
            id:{
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            comentario: encryptedAttribute('retroalimentacion', 'comentario'),
            fecha:{
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
        },{
            freezeTableName: true,
            timestamps: false,
        }
    )
}