import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken, validateBody } from '../middleware/index.js';
import { changePasswordSchema, loginSchema, registerSchema } from '../validators/index.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), authController.register);
authRouter.post('/login', validateBody(loginSchema), authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authenticateToken, authController.getMe);
authRouter.post('/change-password', authenticateToken, validateBody(changePasswordSchema), authController.changePassword);
