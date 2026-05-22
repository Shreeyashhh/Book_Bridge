import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  toggleWishlist,
  getRecommendations,
  getUserListings,
  getAdminAnalytics,
} from '../controllers/bookController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getBooks)
  .post(protect, createBook);

router.get('/user/listings', protect, getUserListings);
router.get('/admin/analytics', protect, admin, getAdminAnalytics);

router.route('/:id')
  .get(getBookById)
  .put(protect, updateBook)
  .delete(protect, deleteBook);

router.post('/:id/wishlist', protect, toggleWishlist);
router.get('/:id/recommendations', getRecommendations);

export default router;
