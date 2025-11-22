const {DataTypes}=require('sequelize')

module.exports = (sequelize)=>{

    return sequelize.define('retroalimenacion',
        {
            id:{
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            comentario:{
                type: DataTypes.STRING,
                allowNull: false,
            },
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