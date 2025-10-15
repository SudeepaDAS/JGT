const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');
require('./models'); // 👈 ensures relationships load before sync
const { errorHandler } = require('./middleware/errorMiddleware');

const tyreRoutes = require('./routes/tyreRoutes');
const brandRoutes = require('./routes/brandRoutes');
const typeRoutes = require('./routes/typeRoutes');
const salesOrderRoutes = require('./routes/salesorderRoute');
const purchaseorderRoutes = require('./routes/purchaseorderRoutes');
const inventoryReportRoutes = require('./routes/inventoryReportRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tyres', tyreRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/salesorders', salesOrderRoutes);
app.use('/api/purchaseorders', purchaseorderRoutes);
app.use('/api/inventory-report', inventoryReportRoutes);

// Error Middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  await sequelize.sync({ alter: true }); // ensure tables & relationships are up-to-date
  console.log(`🚗 Tyre Shop backend running on port ${PORT}`);
});
