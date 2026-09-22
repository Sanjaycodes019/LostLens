import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { validate, registerSchema, loginSchema } from '../validators/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
