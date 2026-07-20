const express = require('express');
const router = express.Router();
const {
  createBusiness,
  getBusinesses,
  getBusinessBySlug,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  addReview,
  getReviews,
} = require('../controllers/businessController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getBusinesses);
router.get('/slug/:slug', optionalAuth, getBusinessBySlug);
router.get('/:id', optionalAuth, getBusinessById);
router.post('/', verifyToken, createBusiness);
router.put('/:id', verifyToken, updateBusiness);
router.delete('/:id', verifyToken, deleteBusiness);
router.post('/:id/reviews', verifyToken, addReview);
router.get('/:id/reviews', getReviews);

module.exports = router;
