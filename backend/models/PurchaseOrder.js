// models/PurchaseOrder.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  brand_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Completed'),
    defaultValue: 'Pending',
  },
  order_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'PurchaseOrders',
  timestamps: true,
});

// Associations
PurchaseOrder.associate = (models) => {
  PurchaseOrder.belongsTo(models.Brand, { foreignKey: 'brand_id' });
  PurchaseOrder.hasMany(models.PurchaseOrderItem, { foreignKey: 'purchase_order_id', onDelete: 'CASCADE' });
};

module.exports = PurchaseOrder;
