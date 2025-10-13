// models/PurchaseOrderItem.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  purchase_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tyre_id: {  // or product_id if you want to generalize
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'PurchaseOrderItems',
  timestamps: true,
});

// Associations
PurchaseOrderItem.associate = (models) => {
  PurchaseOrderItem.belongsTo(models.PurchaseOrder, { foreignKey: 'purchase_order_id' });
  PurchaseOrderItem.belongsTo(models.Tyre, { foreignKey: 'tyre_id' }); // or Product if generalized
};

module.exports = PurchaseOrderItem;
