const {DataTypes}=require('sequelize')
const bcrypt = require('bcrypt');

module.exports = (sequelize)=>{

    return sequelize.define('usuario', 
        {
            id:{
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nombre_usuario:{
                type: DataTypes.STRING,
                allowNull: false,
            },
            nombre:{
                type: DataTypes.STRING,
                allowNull: false,
            },
            apellido:{
                type: DataTypes.STRING,
                allowNull: false,
            },
            email:{
                type: DataTypes.STRING,
                allowNull: false,
            },
            password:{
                type: DataTypes.STRING,
                allowNull: false,
            },
            ci:{
                type: DataTypes.INTEGER,
                allowNull: false,
            }, 
        },{
            freezeTableName: true,
            timestamps: false,
            hooks: {
                beforeCreate: async (usuario) => {
                    if (usuario.password) {
                        const hash = await bcrypt.hash(usuario.password, 10);
                        usuario.password = hash;
                    }
                },
                beforeUpdate: async (usuario) => {
                    if (usuario.changed('password')) {
                        const hash = await bcrypt.hash(usuario.password, 10);
                        usuario.password = hash;
                    }
                }
            }
        }
    )
}