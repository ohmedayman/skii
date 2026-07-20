const express = require('express');
const router = express.Router();
const { register, getProfile, updateProfile, toggleFavorite, getFavorites } = require('../controllers/authController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

router.post('/register', verifyToken, register);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.post('/favorites/:businessId', verifyToken, toggleFavorite);
router.get('/favorites', verifyToken, getFavorites);

module.exports = router;
