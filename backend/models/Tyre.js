// models/Tyre.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Tyre = sequelize.define('Tyre', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tyre_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Brands',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  typeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Types',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  tubeless: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true, // default to tubeless
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // active by default
  },
}, {
  tableName: 'Tyres',
  timestamps: true,
});

// Associations
Tyre.associate = (models) => {
  Tyre.belongsTo(models.Brand, { foreignKey: 'brandId', onDelete: 'CASCADE' });
  Tyre.belongsTo(models.Type, { foreignKey: 'typeId', onDelete: 'CASCADE' });
};

module.exports = Tyre;
