import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.mongodb';

const router = Router();

// POST /api/auth/register
router.post('/register', AuthController.register);

// POST /api/auth/login
router.post('/login', AuthController.login);

// POST /api/auth/refresh
router.post('/refresh', AuthController.refresh);

// POST /api/auth/logout
router.post('/logout', AuthController.logout);

// GET /api/auth/me
router.get('/me', AuthController.getCurrentUser);

export default router;
