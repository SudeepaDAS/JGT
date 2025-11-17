const express = require("express");
const router = express.Router();
const {
  getTopTyres,
  getCardData,
  getLowStock,
  getOutOfStock,
  getStockByBrand,
  getStockByType,
  getRecentAdded,
  getRecentSales,
  getMonthlyStockMovement,
  getBrandSales,
  getTypeSales

} = require("../controllers/dashboardController");

router.get("/top-tyres", getTopTyres);
router.get("/carddata", getCardData);
router.get("/low-stock", getLowStock);
router.get("/out-of-stock", getOutOfStock);
router.get("/stock-by-brand", getStockByBrand);
router.get("/stock-by-category", getStockByType);
router.get("/recent-added", getRecentAdded);
router.get("/recent-sales", getRecentSales);
router.get("/monthly-stock-movement", getMonthlyStockMovement);
router.get("/brand-sales", getBrandSales);
router.get("/type-sales", getTypeSales);

module.exports = router;