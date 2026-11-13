import { Router } from 'express';
import * as requestController from '../controllers/requestController.js';
import { authenticateToken, validateBody } from '../middleware/index.js';
import { bloodRequestSchema, requestStatusUpdateSchema } from '../validators/index.js';

export const requestRouter = Router();

requestRouter.get('/', requestController.getRequests);
requestRouter.get('/my', authenticateToken, requestController.getMyRequests);
requestRouter.get('/:id', requestController.getRequestById);

requestRouter.post(
  '/',
  authenticateToken,
  validateBody(bloodRequestSchema),
  requestController.createRequest
);

requestRouter.patch(
  '/:id/cancel',
  authenticateToken,
  requestController.cancelRequest
);

requestRouter.patch(
  '/:id/status',
  authenticateToken,
  validateBody(requestStatusUpdateSchema),
  requestController.updateRequestStatus
);
