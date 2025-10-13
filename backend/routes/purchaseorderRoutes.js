const express = require('express');
const router = express.Router();
const controller = require('../controllers/purchaseorderController');

router.post('/', controller.createPurchaseOrder);
router.get('/', controller.getAllPurchaseOrders);
router.get('/tyres/:brandId', controller.getTyresByBrand);
router.put('/:id', controller.updatePurchaseOrder);

module.exports = router;
