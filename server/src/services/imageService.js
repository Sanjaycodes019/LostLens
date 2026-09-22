import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, isCloudinaryConfigured, ALLOWED_IMAGE_MIMES, MAX_IMAGE_SIZE_BYTES } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_UPLOAD_DIR = path.join(__dirname, '../../uploads');

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

export function validateImageFile(file) {
  if (!file) throw new AppError('No image provided', 400, 'NO_FILE');
  if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    throw new AppError('Invalid image type. Use JPEG, PNG, or WebP', 400, 'INVALID_FILE_TYPE');
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new AppError('Image exceeds 5MB limit', 400, 'FILE_TOO_LARGE');
  }
}

async function ensureLocalUploadDir() {
  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
}

async function uploadToCloudinary(file) {
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'lostlens', resource_type: 'image' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(file.buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

async function uploadToLocalDisk(file) {
  await ensureLocalUploadDir();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname) || '.jpg'}`;
  const filepath = path.join(LOCAL_UPLOAD_DIR, filename);
  await fs.writeFile(filepath, file.buffer);

  return {
    url: `/uploads/${filename}`,
    publicId: filename,
    width: null,
    height: null,
  };
}

export async function uploadImage(file) {
  validateImageFile(file);

  if (isCloudinaryConfigured()) {
    try {
      return await uploadToCloudinary(file);
    } catch (err) {
      console.error('Cloudinary upload failed, falling back to local storage:', err.message || err);
    }
  }

  return uploadToLocalDisk(file);
}

export async function deleteImage(publicId) {
  if (!publicId) return;
  if (isCloudinaryConfigured()) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return;
    } catch (err) {
      console.error('Cloudinary delete failed, trying local storage:', err.message || err);
    }
  }
  try {
    await fs.unlink(path.join(LOCAL_UPLOAD_DIR, publicId));
  } catch {
    // ignore missing local files
  }
}

export function getLocalUploadDir() {
  return LOCAL_UPLOAD_DIR;
}
