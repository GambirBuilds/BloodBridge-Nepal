import { getPrismaClient } from '../config/database.js';
import { sanitizeUser } from '../utils/index.js';
import { formatHospitalForResponse } from './hospitalController.js';
import { formatRequestForResponse } from './requestController.js';

export async function getDashboardMetrics(req, res) {
  try {
    const prisma = await getPrismaClient();

    const [
      totalDonors,
      activeDonors,
      totalRequests,
      verifiedRequests,
      pendingRequests,
      verifiedHospitals,
      pendingHospitals,
      totalUsers,
    ] = await Promise.all([
      prisma.donorProfile.count(),
      prisma.donorProfile.count({ where: { notificationsPaused: false } }),
      prisma.bloodRequest.count(),
      prisma.bloodRequest.count({ where: { status: 'VERIFIED' } }),
      prisma.bloodRequest.count({ where: { status: 'PENDING' } }),
      prisma.hospital.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.hospital.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.user.count(),
    ]);

    const recentActivities = await prisma.auditLog.findMany({ take: 10 });

    return res.json({
      success: true,
      data: {
        totalRegisteredDonors: totalDonors,
        activeDonors,
        totalRequests,
        verifiedRequests,
        pendingRequests,
        verifiedHospitals,
        pendingHospitalVerification: pendingHospitals,
        totalUsers,
        recentActivities: recentActivities.map(a => ({
          id: a.id,
          timestamp: a.createdAt,
          actor: a.actorName,
          role: a.actorRole,
          summary: `${a.action} on ${a.targetType}`,
        })),
      },
    });
  } catch (err) {
    console.error('[GetAdminMetricsError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve administrative metrics.' });
  }
}

export async function getUsers(req, res) {
  try {
    const { role, status, q } = req.query;
    const prisma = await getPrismaClient();

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const users = await prisma.user.findMany({
      where,
      include: {
        donorProfile: true,
        requesterProfile: true,
        hospitalStaff: { include: { hospital: true } },
      },
    });

    const filtered = users
      .filter(u => {
        if (!q) return true;
        const search = q.toLowerCase();
        return u.fullName.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
      })
      .map(sanitizeUser);

    return res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (err) {
    console.error('[GetAdminUsersError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
}

export async function getDonors(req, res) {
  try {
    const prisma = await getPrismaClient();
    const profiles = await prisma.donorProfile.findMany({
      include: { user: true, donationRecords: true },
    });

    return res.json({
      success: true,
      count: profiles.length,
      data: profiles.map(p => ({
        id: p.id,
        fullName: p.user?.fullName || 'Donor',
        email: p.user?.email,
        phone: p.user?.phone,
        bloodGroup: p.bloodGroup,
        district: p.district,
        province: p.province,
        municipality: p.municipality,
        availabilityPreference: p.availabilityPreference,
        notificationsPaused: p.notificationsPaused,
        totalDonations: p.donationRecords?.length || 0,
      })),
    });
  } catch (err) {
    console.error('[GetAdminDonorsError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve donors.' });
  }
}

export async function getRequests(req, res) {
  try {
    const prisma = await getPrismaClient();
    const requests = await prisma.bloodRequest.findMany({
      include: { hospital: true, donorRequests: true },
    });

    return res.json({
      success: true,
      count: requests.length,
      data: requests.map(formatRequestForResponse),
    });
  } catch (err) {
    console.error('[GetAdminRequestsError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve blood requests.' });
  }
}

export async function getHospitals(req, res) {
  try {
    const prisma = await getPrismaClient();
    const hospitals = await prisma.hospital.findMany({
      include: { staff: true },
    });

    return res.json({
      success: true,
      count: hospitals.length,
      data: hospitals.map(formatHospitalForResponse),
    });
  } catch (err) {
    console.error('[GetAdminHospitalsError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve hospitals.' });
  }
}

export async function updateHospitalVerification(req, res) {
  try {
    const { id } = req.params;
    const { verificationStatus, rejectionReason } = req.validatedBody;
    const prisma = await getPrismaClient();

    const hospital = await prisma.hospital.findUnique({ where: { id } });
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    const updated = await prisma.hospital.update({
      where: { id },
      data: {
        verificationStatus,
        verifiedAt: verificationStatus === 'VERIFIED' ? new Date() : null,
        rejectionReason: verificationStatus === 'REJECTED' ? rejectionReason : null,
      },
    });

    await prisma.hospitalVerification.create({
      data: {
        hospitalId: id,
        status: verificationStatus,
        notes: rejectionReason || `Status set to ${verificationStatus} by platform administrator.`,
        reviewedBy: req.user.fullName,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        actorName: req.user.fullName,
        actorRole: req.user.role,
        action: `HOSPITAL_${verificationStatus}`,
        targetType: 'Hospital',
        targetId: id,
        details: { verificationStatus, rejectionReason },
        ipAddress: req.ip,
      },
    });

    return res.json({
      success: true,
      message: `Hospital verification status updated to ${verificationStatus}.`,
      data: formatHospitalForResponse(updated),
    });
  } catch (err) {
    console.error('[UpdateHospitalVerificationError]', err);
    return res.status(500).json({ success: false, message: 'Failed to update hospital verification.' });
  }
}

export async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.validatedBody;
    const prisma = await getPrismaClient();

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'ADMIN' && req.user.id !== user.id) {
      return res.status(403).json({ success: false, message: 'Cannot modify status of fellow administrators.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        actorName: req.user.fullName,
        actorRole: req.user.role,
        action: `USER_STATUS_${status}`,
        targetType: 'User',
        targetId: id,
        details: { previousStatus: user.status, newStatus: status },
        ipAddress: req.ip,
      },
    });

    return res.json({
      success: true,
      message: `User status changed to ${status}.`,
      data: sanitizeUser(updated),
    });
  } catch (err) {
    console.error('[UpdateUserStatusError]', err);
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
}

export async function getReports(req, res) {
  try {
    const prisma = await getPrismaClient();
    const reports = await prisma.report.findMany({ take: 20 });
    return res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (err) {
    console.error('[GetReportsError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reports.' });
  }
}

export async function getAuditLogs(req, res) {
  try {
    const prisma = await getPrismaClient();
    const logs = await prisma.auditLog.findMany({ take: 50 });
    return res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    console.error('[GetAuditLogsError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
}
