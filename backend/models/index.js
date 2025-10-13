const { sequelize } = require('../config/db');

const Brand = require('./Brand');
const Type = require('./Type');
const Tyre = require('./Tyre');
const SalesOrder = require('./SalesOrder');
const SalesOrderItem = require('./SalesOrderItem');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');

const models = { Brand, Type, Tyre, SalesOrder, SalesOrderItem, PurchaseOrder, PurchaseOrderItem};

// Setup associations
Object.keys(models).forEach(modelName => {
  if (typeof models[modelName].associate === 'function') {
    models[modelName].associate(models);
  }
});

module.exports = { ...models, sequelize };
