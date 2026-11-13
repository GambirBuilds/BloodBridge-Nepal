import { getPrismaClient } from '../config/database.js';

export async function submitReport(req, res) {
  try {
    const { targetType, targetId, reason, details } = req.validatedBody;
    const prisma = await getPrismaClient();

    const report = await prisma.report.create({
      data: {
        reporterId: req.user ? req.user.id : null,
        targetType,
        targetId,
        reason,
        details,
        status: 'PENDING',
      },
    });

    // Create audit log for suspicious activity tracking
    await prisma.auditLog.create({
      data: {
        actorId: req.user ? req.user.id : 'ANONYMOUS',
        actorName: req.user ? req.user.fullName : 'Public Reporter',
        actorRole: req.user ? req.user.role : 'PUBLIC',
        action: 'SUBMIT_REPORT',
        targetType,
        targetId,
        details: { reason, reportId: report.id },
        ipAddress: req.ip,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Platform administrators and hospital coordinators will investigate promptly.',
      data: report,
    });
  } catch (err) {
    console.error('[SubmitReportError]', err);
    return res.status(500).json({ success: false, message: 'Failed to submit report.' });
  }
}

export async function reviewReport(req, res) {
  try {
    const { id } = req.params;
    const { status, actionTaken } = req.validatedBody;
    const prisma = await getPrismaClient();

    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status,
        actionTaken: actionTaken || existing.actionTaken,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        actorName: req.user.fullName,
        actorRole: req.user.role,
        action: 'REVIEW_REPORT',
        targetType: 'Report',
        targetId: id,
        details: { previousStatus: existing.status, newStatus: status, actionTaken },
        ipAddress: req.ip,
      },
    });

    return res.json({
      success: true,
      message: `Report marked as ${status}.`,
      data: updated,
    });
  } catch (err) {
    console.error('[ReviewReportError]', err);
    return res.status(500).json({ success: false, message: 'Failed to update report status.' });
  }
}
