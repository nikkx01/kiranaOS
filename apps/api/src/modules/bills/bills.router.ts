import { Router } from 'express';
import { createBill, listBills, getBill } from './bills.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.post('/', createBill);
router.get('/', listBills);
router.get('/:id', getBill);

export default router;
