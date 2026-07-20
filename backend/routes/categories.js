const express = require('express');
const router = express.Router();
const { getCategories, getCategoryById, createCategory } = require('../controllers/categoryController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', verifyToken, requireRole('admin'), createCategory);

module.exports = router;
