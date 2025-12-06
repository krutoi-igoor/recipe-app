import express from 'express';
import { register, login, refresh, me } from '../controllers/authController.js';
import { validate, schemas } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/refresh', refresh);
router.get('/me', authMiddleware, me);

export default router;
