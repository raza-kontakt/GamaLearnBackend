import { Router } from 'express';
import { loginController, logoutController } from '../controllers/examinerController';
import { validate } from '../utils/validation';
import { loginSchema } from '../schemas/examinerSchema';
import { authMiddleware } from '../middleware/authMiddleware';
import { getExaminerController } from '../controllers/examinerController';

const router = Router();

router.post('/login', validate(loginSchema), loginController);
router.post('/logout', logoutController);
router.get('/me', authMiddleware, getExaminerController);

export default router;
