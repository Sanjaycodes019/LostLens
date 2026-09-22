import { Router } from 'express';
import {
  createClaim,
  getMyClaims,
  getClaimById,
  reviewClaim,
  cancelClaim,
} from '../controllers/claimController.js';
import { validate, claimSchema } from '../validators/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, validate(claimSchema), createClaim);
router.get('/mine', authenticate, getMyClaims);
router.get('/:id', authenticate, getClaimById);
router.patch('/:id', authenticate, authorize('ADMIN'), reviewClaim);
router.delete('/:id', authenticate, cancelClaim);

export default router;
