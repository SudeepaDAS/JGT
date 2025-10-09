// models/Brand.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Brand = sequelize.define('Brand', {
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
}, {
  tableName: 'Brands',
  timestamps: true,
});

Brand.associate = (models) => {
  Brand.hasMany(models.Tyre, { foreignKey: 'brandId', onDelete: 'CASCADE' });
};

module.exports = Brand;
