import { Router } from 'express';
import multer from 'multer';
import { analyzeItem } from '../services/aiService.js';
import { uploadImage } from '../services/imageService.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
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

router.post(
  '/analyze',
  authenticate,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const { description, category, imageUrl: bodyUrl } = req.body;
    let imageUrl = bodyUrl;
    let uploadedImage;

    if (req.file) {
      uploadedImage = await uploadImage(req.file);
      imageUrl = uploadedImage.url.startsWith('http')
        ? uploadedImage.url
        : `${req.protocol}://${req.get('host')}${uploadedImage.url}`;
    }

    const analysis = await analyzeItem({ imageUrl, description, category });
    res.json({
      success: true,
      data: {
        analysis,
        image: uploadedImage
          ? { url: imageUrl, publicId: uploadedImage.publicId, width: uploadedImage.width, height: uploadedImage.height }
          : undefined,
      },
    });
  })
);

export default router;
