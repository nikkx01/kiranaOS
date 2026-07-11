import { Router } from 'express';
import { login, me, register, updateProfile } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);

export default router;
