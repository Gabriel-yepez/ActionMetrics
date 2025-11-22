const {DataTypes}=require('sequelize')

module.exports = (sequelize)=>{

    return sequelize.define('plan_mejora',
        {
            id:{
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            detalles:{
                type: DataTypes.STRING,
                allowNull: false,
            },
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