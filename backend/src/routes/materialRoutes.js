import express from 'express';
import {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  addMaterialQuantity,
  useMaterial,
  getLowStockMaterials,
  getMaterialMovements,
} from '../controllers/materialController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All material routes need authentication

router
  .route('/')
  .get(getMaterials)
  .post(createMaterial);

router.get('/lowstock', getLowStockMaterials);

router
  .route('/:id')
  .get(getMaterialById)
  .put(updateMaterial)
  .delete(deleteMaterial);

router.post('/:id/add', addMaterialQuantity);
router.post('/:id/use', useMaterial);
router.get('/:id/movements', getMaterialMovements);

export default router;