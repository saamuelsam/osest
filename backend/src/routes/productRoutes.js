import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustProductQuantity,
  getProductsByCategory,
  getLowStockProducts,
  getProductMovements,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All product routes need authentication

router
  .route('/')
  .get(getProducts)
  .post(createProduct);

router.get('/lowstock', getLowStockProducts);
router.get('/category/:category', getProductsByCategory);

router
  .route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

router.post('/:id/adjust', adjustProductQuantity);
router.get('/:id/movements', getProductMovements);

export default router;