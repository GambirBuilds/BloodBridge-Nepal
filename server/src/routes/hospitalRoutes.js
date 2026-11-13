import { Router } from 'express';
import * as hospitalController from '../controllers/hospitalController.js';
import { authenticateToken, requireRole, validateBody } from '../middleware/index.js';
import { hospitalProfileSchema, hospitalRegisterSchema } from '../validators/index.js';

export const hospitalRouter = Router();

hospitalRouter.post(
  '/register',
  validateBody(hospitalRegisterSchema),
  hospitalController.registerHospital
);

hospitalRouter.get('/', hospitalController.getHospitals);
hospitalRouter.get('/verification-status', authenticateToken, hospitalController.getVerificationStatus);
hospitalRouter.get('/:id', hospitalController.getHospitalById);

hospitalRouter.patch(
  '/profile',
  authenticateToken,
  requireRole('HOSPITAL', 'ADMIN'),
  validateBody(hospitalProfileSchema),
  hospitalController.updateProfile
);

hospitalRouter.get(
  '/requests',
  authenticateToken,
  requireRole('HOSPITAL'),
  hospitalController.getHospitalRequests
);

hospitalRouter.patch(
  '/requests/:id/verify',
  authenticateToken,
  requireRole('HOSPITAL'),
  hospitalController.verifyRequest
);
