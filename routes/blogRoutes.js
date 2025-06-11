const express = require('express');
const blogController = require('../controllers/blogController');
const { protect, restrictToOwner } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET blogs routes
router.get('/', blogController.getAllBlogs);
router.get('/my-blogs', protect, blogController.getMyBlogs);
router.get('/drafts', protect, blogController.getDraftBlogs); 
router.get('/:id', blogController.getBlog);

// POST routes (Protected routes)
router.use(protect);
router.post('/', blogController.createBlog);

// PUT and DELETE routes (protected and Owner restricted routes)
router
  .route('/:id')
  .put(restrictToOwner, blogController.updateBlog) 
  .delete(restrictToOwner, blogController.deleteBlog);

module.exports = router;