const express = require('express');
const router = express.Router();
const { searchBusinesses, searchPosts, searchAll, getSearchSuggestions } = require('../controllers/searchController');

router.get('/businesses', searchBusinesses);
router.get('/posts', searchPosts);
router.get('/all', searchAll);
router.get('/suggestions', getSearchSuggestions);

module.exports = router;
