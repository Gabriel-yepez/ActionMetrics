const {DataTypes}=require('sequelize')

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
            comentario:{
                type: DataTypes.STRING,
                allowNull: false,
            },
        },{
            freezeTableName: true,
            timestamps: false,
        }
    )
}