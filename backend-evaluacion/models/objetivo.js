const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('objetivos', // Cambiado a "objetivos" para coincidir con el nombre de la tabla
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            descripcion: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            fecha_inicio: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            fecha_fin: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            estado_actual: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            estado_deseado: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            freezeTableName: true, // Asegura que el nombre de la tabla sea exactamente "objetivos"
            timestamps: false,
        }
    );
};