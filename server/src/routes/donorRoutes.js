import { Router } from 'express';
import * as donorController from '../controllers/donorController.js';
import { authenticateToken, requireRole, validateBody } from '../middleware/index.js';
import { donorAvailabilitySchema, donorProfileUpdateSchema } from '../validators/index.js';

export const donorRouter = Router();

// Public donor search (privacy projected)
donorRouter.get('/', donorController.getDonors);
donorRouter.get('/public', donorController.getDonors);
donorRouter.get('/:id', donorController.getDonorById);

// Protected donor self-management
donorRouter.patch(
  '/profile',
  authenticateToken,
  requireRole('DONOR'),
  validateBody(donorProfileUpdateSchema),
  donorController.updateProfile
);

donorRouter.patch(
  '/availability',
  authenticateToken,
  requireRole('DONOR'),
  validateBody(donorAvailabilitySchema),
  donorController.updateAvailability
);

donorRouter.get(
  '/requests',
  authenticateToken,
  requireRole('DONOR'),
  donorController.getDonorRequests
);

donorRouter.get(
  '/history',
  authenticateToken,
  requireRole('DONOR'),
  donorController.getDonationHistory
);
