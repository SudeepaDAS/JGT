// models/Type.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Type = sequelize.define('Type', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // active by default
  },
}, {
  tableName: 'Types',
  timestamps: true,
});

Type.associate = (models) => {
  Type.hasMany(models.Tyre, { foreignKey: 'typeId', onDelete: 'CASCADE' });
};

module.exports = Type;