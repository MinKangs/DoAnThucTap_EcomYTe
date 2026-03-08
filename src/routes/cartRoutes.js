const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../config/authMiddleware');

router.get('/', protect, cartController.getCart);
router.post('/add', protect, cartController.addToCart);
router.delete('/remove/:id', protect, cartController.removeFromCart);

module.exports = router;