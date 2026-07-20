const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPostBySlug, updatePost, deletePost } = require('../controllers/postController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', getPosts);
router.get('/slug/:slug', getPostBySlug);
router.post('/', verifyToken, createPost);
router.put('/:id', verifyToken, updatePost);
router.delete('/:id', verifyToken, deletePost);

module.exports = router;
