import { Router } from 'express';
import multer from 'multer';
import {
  createItem,
  getItems,
  getMyItems,
  getItemById,
  updateItem,
  deleteItem,
  analyzeItemImage,
  getItemMatches,
  markRecovered,
  flagItem,
  uploadItemImage,
} from '../controllers/itemController.js';
import { validate, itemSchema } from '../validators/index.js';
import { authenticate } from '../middleware/auth.js';
import { MAX_IMAGE_SIZE_BYTES, ALLOWED_IMAGE_MIMES } from '../config/index.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  },
});

router.get('/', authenticate, getItems);
router.get('/mine', authenticate, getMyItems);
router.get('/:id', authenticate, getItemById);
router.get('/:id/matches', authenticate, getItemMatches);

router.post('/', authenticate, validate(itemSchema), createItem);
router.post('/:id/analyze', authenticate, upload.single('image'), analyzeItemImage);
router.post('/upload', authenticate, upload.single('image'), uploadItemImage);

router.patch('/:id', authenticate, updateItem);
router.delete('/:id', authenticate, deleteItem);
router.post('/:id/recover', authenticate, markRecovered);
router.post('/:id/flag', authenticate, flagItem);

export default router;
