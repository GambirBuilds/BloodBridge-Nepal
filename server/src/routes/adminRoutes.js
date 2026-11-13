import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateToken, requireRole, validateBody } from '../middleware/index.js';
import { hospitalVerifySchema, userStatusSchema } from '../validators/index.js';

export const adminRouter = Router();

// All admin routes strictly require ADMIN role
adminRouter.use(authenticateToken, requireRole('ADMIN'));

adminRouter.get('/dashboard', adminController.getDashboardMetrics);
adminRouter.get('/users', adminController.getUsers);
adminRouter.get('/donors', adminController.getDonors);
adminRouter.get('/requests', adminController.getRequests);
adminRouter.get('/hospitals', adminController.getHospitals);

adminRouter.patch(
  '/hospitals/:id/verification',
  validateBody(hospitalVerifySchema),
  adminController.updateHospitalVerification
);

adminRouter.patch(
  '/users/:id/status',
  validateBody(userStatusSchema),
  adminController.updateUserStatus
);

adminRouter.get('/reports', adminController.getReports);
adminRouter.get('/audit-logs', adminController.getAuditLogs);
