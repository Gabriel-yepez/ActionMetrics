const {DataTypes}=require('sequelize')
const { encryptedAttribute } = require('../services/dataEncryption')

module.exports= (sequelize)=>{

    return sequelize.define('evaluacion',
        {
            id:{
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            fecha:{
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            comentario: encryptedAttribute('evaluacion', 'comentario'),
            estado:{
                type: DataTypes.BOOLEAN,
            },
            url :{
                type: DataTypes.STRING,
                allowNull: false,
            },
        },{
            freezeTableName: true,
            timestamps: false,
        }
    )
}