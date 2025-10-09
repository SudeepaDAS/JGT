const { sequelize } = require('../config/db');

const Brand = require('./Brand');
const Type = require('./Type');
const Tyre = require('./Tyre');

const models = { Brand, Type, Tyre };

// Setup associations
Object.keys(models).forEach(modelName => {
  if (typeof models[modelName].associate === 'function') {
    models[modelName].associate(models);
  }
});

module.exports = { ...models, sequelize };
