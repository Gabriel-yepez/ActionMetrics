const {DataTypes}=require('sequelize')
const { encryptedAttribute } = require('../services/dataEncryption')
const bcrypt = require('bcrypt');

module.exports = (sequelize)=>{

    const Usuario = sequelize.define('usuario', 
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
            nombre: encryptedAttribute('usuario', 'nombre'),
            apellido: encryptedAttribute('usuario', 'apellido'),
            email: encryptedAttribute('usuario', 'email'),
            password:{
                type: DataTypes.STRING,
                allowNull: false,
            },
            ci: encryptedAttribute('usuario', 'ci', { parse: Number }),
            id_departamento:{
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },{
            freezeTableName: true,
            timestamps: false,
            // El hash de la contraseña nunca se carga salvo que se pida explícitamente
            defaultScope: {
                attributes: { exclude: ['password'] },
            },
            scopes: {
                withPassword: {},
            },
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

    // Defensa adicional: nunca serializar el hash en respuestas JSON
    Usuario.prototype.toJSON = function () {
        const values = { ...this.get() }
        delete values.password
        return values
    }

    return Usuario
}
