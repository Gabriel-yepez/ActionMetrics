const {DataTypes}=require('sequelize')

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
            comentario:{
                type: DataTypes.STRING,
                allowNull: false,
            },
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