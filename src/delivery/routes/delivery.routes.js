const express = require('express');
const router = express.Router();
const deliveryController = require('../controller/delivery.controller');


router.post('/:id', deliveryController.createDelivery);
router.get('/:id', deliveryController.getDeliveryById);
router.get('/', deliveryController.getAllDeliveries);
router.delete('/:id', deliveryController.deleteDelivery);
router.put('/:id', deliveryController.updateDelivery);


module.exports = router;