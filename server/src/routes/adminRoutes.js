import { Router } from 'express';
import {
  getStats,
  getAdminItems,
  getAdminUsers,
  moderateItem,
  getHeatmapData,
  getMatchingStats,
} from '../controllers/adminController.js';
import { getAdminClaims } from '../controllers/adminClaimsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/stats', getStats);
router.get('/items', getAdminItems);
router.get('/users', getAdminUsers);
router.get('/claims', getAdminClaims);
router.patch('/items/:id', moderateItem);
router.get('/heatmap', getHeatmapData);
router.get('/matching-stats', getMatchingStats);

export default router;
