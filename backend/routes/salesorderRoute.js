const express = require('express');
const router = express.Router();
const salesOrderController = require('../controllers/salesorderController');

router.get('/', salesOrderController.getAllOrders);
router.get('/:orderId', salesOrderController.getOrderById);
router.post('/', salesOrderController.createOrder);
router.put('/:orderId', salesOrderController.updateOrder);
router.delete('/:orderId', salesOrderController.deleteOrder);

module.exports = router;
