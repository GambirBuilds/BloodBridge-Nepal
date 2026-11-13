import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/index.js';

export const notificationRouter = Router();

notificationRouter.use(authenticateToken);

notificationRouter.get('/', notificationController.getNotifications);
notificationRouter.patch('/:id/read', notificationController.markAsRead);
notificationRouter.patch('/read-all', notificationController.markAllAsRead);
