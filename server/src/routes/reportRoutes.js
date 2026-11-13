import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticateToken, requireRole, validateBody } from '../middleware/index.js';
import { reportReviewSchema, reportSubmitSchema } from '../validators/index.js';

export const reportRouter = Router();

// Allow authenticated users to report suspicious activity, fraud, or abuse
reportRouter.post(
  '/',
  authenticateToken,
  validateBody(reportSubmitSchema),
  reportController.submitReport
);

// Admin review action for reports
reportRouter.patch(
  '/:id/review',
  authenticateToken,
  requireRole('ADMIN'),
  validateBody(reportReviewSchema),
  reportController.reviewReport
);
