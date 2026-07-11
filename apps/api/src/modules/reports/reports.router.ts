import { Router } from 'express';
import { getSummary, getBestSellers } from './reports.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/summary', getSummary);
router.get('/best-sellers', getBestSellers);

export default router;
