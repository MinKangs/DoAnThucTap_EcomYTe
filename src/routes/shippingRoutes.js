const express = require('express');
const router = express.Router();
const { getShippingPartners, createShippingPartner, updateShippingPartner, deleteShippingPartner } = require('../controllers/shippingController');

router.get('/', getShippingPartners);
router.post('/', createShippingPartner);
router.put('/:id', updateShippingPartner);
router.delete('/:id', deleteShippingPartner);

module.exports = router;