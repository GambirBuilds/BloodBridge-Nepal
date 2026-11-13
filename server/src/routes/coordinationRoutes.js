import { Router } from 'express';
import * as coordinationController from '../controllers/coordinationController.js';
import { authenticateToken } from '../middleware/index.js';

export const coordinationRouter = Router();

// Dispatch invitation to donor
coordinationRouter.post(
  '/requests/:id/invitations',
  authenticateToken,
  coordinationController.createInvitation
);

// Get my invitations (Donor)
coordinationRouter.get(
  '/invitations/my',
  authenticateToken,
  coordinationController.getMyInvitations
);

// Respond to invitation (Donor)
coordinationRouter.patch(
  '/invitations/:id/respond',
  authenticateToken,
  coordinationController.respondToInvitation
);
