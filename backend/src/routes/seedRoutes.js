import express from 'express';
import {
  getSeeds,
  getSeedById,
  createSeed,
  updateSeed,
  deleteSeed,
  adjustSeedPackages,
  getSeedsByType,
  getLowStockSeeds,
  getSeedMovements,
} from '../controllers/seedController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All seed routes need authentication

router
  .route('/')
  .get(getSeeds)
  .post(createSeed);

router.get('/lowstock', getLowStockSeeds);
router.get('/type/:type', getSeedsByType);

router
  .route('/:id')
  .get(getSeedById)
  .put(updateSeed)
  .delete(deleteSeed);

router.post('/:id/adjust', adjustSeedPackages);
router.get('/:id/movements', getSeedMovements);

export default router;