import express from 'express';
import { register, login, refresh } from '../controllers/authController.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/refresh', refresh);

export default router;
