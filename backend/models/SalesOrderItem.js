// models/SalesOrderItem.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SalesOrderItem = sequelize.define('SalesOrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'SalesOrders',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  tyreId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Tyres',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  total_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'SalesOrderItems',
  timestamps: true,
});

// Associations
SalesOrderItem.associate = (models) => {
  SalesOrderItem.belongsTo(models.SalesOrder, { foreignKey: 'orderId', onDelete: 'CASCADE' });
  SalesOrderItem.belongsTo(models.Tyre, { foreignKey: 'tyreId', onDelete: 'CASCADE' });
};

module.exports = SalesOrderItem;
