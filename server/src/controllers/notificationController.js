import { getPrismaClient } from '../config/database.js';

export async function getNotifications(req, res) {
  try {
    const prisma = await getPrismaClient();
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
    });

    return res.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    console.error('[GetNotificationsError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const prisma = await getPrismaClient();

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return res.json({
      success: true,
      message: 'Notification marked as read.',
      data: updated,
    });
  } catch (err) {
    console.error('[MarkAsReadError]', err);
    return res.status(500).json({ success: false, message: 'Failed to mark notification as read.' });
  }
}

export async function markAllAsRead(req, res) {
  try {
    const prisma = await getPrismaClient();
    await prisma.notification.updateMany({
      where: { userId: req.user.id },
      data: { read: true },
    });

    return res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (err) {
    console.error('[MarkAllAsReadError]', err);
    return res.status(500).json({ success: false, message: 'Failed to mark notifications as read.' });
  }
}
