import { getPrismaClient } from '../config/database.js';
import {
  BLOOD_GROUP_MAP,
  REVERSE_BLOOD_GROUP_MAP,
  REVERSE_REQUEST_STATUS_MAP,
  REVERSE_URGENCY_MAP,
  URGENCY_MAP,
} from '../constants/index.js';

export async function createRequest(req, res) {
  try {
    const data = req.validatedBody;
    const prisma = await getPrismaClient();

    // Ensure user has a requester profile or create one
    let requesterProfile = req.user.requesterProfile;
    if (!requesterProfile) {
      requesterProfile = await prisma.requesterProfile.create({
        data: {
          userId: req.user.id,
          district: req.user.district,
          province: req.user.province,
        },
      });
    }

    // Resolve hospital
    let hospital = null;
    if (data.hospitalId) {
      hospital = await prisma.hospital.findUnique({ where: { id: data.hospitalId } });
    }
    if (!hospital) {
      hospital = await prisma.hospital.findUnique({ where: { officialEmail: 'bloodbank@bagmatiteaching.demo.np' } });
    }
    if (!hospital) {
      const all = await prisma.hospital.findMany();
      hospital = all[0];
    }

    const bloodGroupEnum = BLOOD_GROUP_MAP[data.bloodGroup] || 'O_POSITIVE';
    const urgencyEnum = URGENCY_MAP[data.urgency] || 'URGENT';
    const requestCode = `REQ-NP-${Math.floor(1000 + Math.random() * 9000)}`;

    // Anti-Spam & Duplicate Request Detection
    const existingActive = await prisma.bloodRequest.findFirst({
      where: {
        patientName: data.patientName,
        bloodGroup: bloodGroupEnum,
        hospitalId: hospital.id,
        status: { in: ['PENDING', 'UNDER_VERIFICATION', 'VERIFIED', 'DONOR_COORDINATION'] },
      },
    });

    if (existingActive) {
      return res.status(409).json({
        success: false,
        message: `An active blood request (${existingActive.requestCode}) is already registered for patient "${data.patientName}" at ${hospital.hospitalName}. Please coordinate under the existing requisition slip.`,
        data: formatRequestForResponse(existingActive),
      });
    }

    const newRequest = await prisma.bloodRequest.create({
      data: {
        requestCode,
        requesterProfileId: requesterProfile.id,
        patientName: data.patientName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail || null,
        bloodGroup: bloodGroupEnum,
        unitsRequired: data.unitsRequired,
        urgency: urgencyEnum,
        hospitalId: hospital.id,
        hospitalName: hospital.hospitalName,
        province: data.province,
        district: data.district,
        municipality: data.municipality,
        requiredDate: new Date(data.requiredDate),
        requestDetails: data.requestDetails,
        status: 'PENDING',
      },
    });

    // Notify hospital staff
    const hospitalStaff = await prisma.hospitalStaff.findMany({ where: { hospitalId: hospital.id } });
    for (const staff of hospitalStaff) {
      await prisma.notification.create({
        data: {
          userId: staff.userId,
          title: `New ${data.bloodGroup} blood request received (${requestCode})`,
          message: `${data.unitsRequired} unit(s) requested for patient ${data.patientName}. Awaiting requisition verification.`,
          category: 'Verification Queue',
          actionPath: '/dashboard/hospital?tab=requests',
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        actorName: req.user.fullName,
        actorRole: req.user.role,
        action: 'BLOOD_REQUEST_CREATED',
        targetType: 'BloodRequest',
        targetId: newRequest.id,
        details: { requestCode, units: data.unitsRequired, bloodGroup: data.bloodGroup },
        ipAddress: req.ip,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Blood request submitted successfully and queued for hospital verification.',
      data: formatRequestForResponse(newRequest),
    });
  } catch (err) {
    console.error('[CreateRequestError]', err);
    return res.status(500).json({ success: false, message: 'Failed to submit blood request.' });
  }
}

export async function getRequests(req, res) {
  try {
    const { bloodGroup, status, province, district, hospitalId } = req.query;
    const prisma = await getPrismaClient();

    const where = {};
    if (bloodGroup && BLOOD_GROUP_MAP[bloodGroup]) {
      where.bloodGroup = BLOOD_GROUP_MAP[bloodGroup];
    }
    if (status) {
      where.status = status;
    }
    if (province) where.province = province;
    if (district) where.district = district;
    if (hospitalId) where.hospitalId = hospitalId;

    const requests = await prisma.bloodRequest.findMany({
      where,
      include: {
        hospital: true,
        donorRequests: true,
      },
    });

    return res.json({
      success: true,
      count: requests.length,
      data: requests.map(formatRequestForResponse),
    });
  } catch (err) {
    console.error('[GetRequestsError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve blood requests.' });
  }
}

export async function getRequestById(req, res) {
  try {
    const { id } = req.params;
    const prisma = await getPrismaClient();

    const request = await prisma.bloodRequest.findUnique({
      where: { id },
      include: {
        hospital: true,
        donorRequests: true,
      },
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found.' });
    }

    return res.json({
      success: true,
      data: formatRequestForResponse(request),
    });
  } catch (err) {
    console.error('[GetRequestByIdError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve request details.' });
  }
}

export async function getMyRequests(req, res) {
  try {
    const prisma = await getPrismaClient();

    if (!req.user.requesterProfile) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const requests = await prisma.bloodRequest.findMany({
      where: { requesterProfileId: req.user.requesterProfile.id },
      include: { hospital: true, donorRequests: true },
    });

    return res.json({
      success: true,
      count: requests.length,
      data: requests.map(formatRequestForResponse),
    });
  } catch (err) {
    console.error('[GetMyRequestsError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve your blood requests.' });
  }
}

export async function cancelRequest(req, res) {
  try {
    const { id } = req.params;
    const prisma = await getPrismaClient();

    const request = await prisma.bloodRequest.findUnique({
      where: { id },
      include: { requesterProfile: true },
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found.' });
    }

    // Authorization rule: only requester who created it or ADMIN can cancel
    const isOwner = request.requesterProfile?.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden. You cannot cancel requests owned by others.' });
    }

    if (request.status === 'FULFILLED') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an already fulfilled blood request.' });
    }

    const updated = await prisma.bloodRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        hospitalVerificationNote: `Cancelled by ${req.user.fullName} (${req.user.role}).`,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        actorName: req.user.fullName,
        actorRole: req.user.role,
        action: 'BLOOD_REQUEST_CANCELLED',
        targetType: 'BloodRequest',
        targetId: id,
        ipAddress: req.ip,
      },
    });

    return res.json({
      success: true,
      message: 'Blood request cancelled successfully.',
      data: formatRequestForResponse(updated),
    });
  } catch (err) {
    console.error('[CancelRequestError]', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel request.' });
  }
}

export async function updateRequestStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note } = req.validatedBody;
    const prisma = await getPrismaClient();

    const request = await prisma.bloodRequest.findUnique({
      where: { id },
      include: { hospital: true, requesterProfile: true },
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found.' });
    }

    // Role-based authorization rules:
    // 1. A requester CANNOT mark their own request as VERIFIED or FULFILLED
    if (req.user.role === 'REQUESTER' && (status === 'VERIFIED' || status === 'FULFILLED' || status === 'UNDER_VERIFICATION')) {
      return res.status(403).json({
        success: false,
        message: 'Requesters cannot self-verify or mark requests fulfilled. Hospital staff or Admin required.',
      });
    }

    // 2. Hospital staff can only update requests assigned to their hospital
    if (req.user.role === 'HOSPITAL') {
      const staff = req.user.hospitalStaff;
      if (!staff || staff.hospitalId !== request.hospitalId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized. You can only verify and coordinate requests for your assigned hospital.',
        });
      }
    }

    // 3. Donor cannot mark request as fulfilled
    if (req.user.role === 'DONOR' && status === 'FULFILLED') {
      return res.status(403).json({
        success: false,
        message: 'Donors cannot mark hospital blood requests as fulfilled.',
      });
    }

    const updated = await prisma.bloodRequest.update({
      where: { id },
      data: {
        status,
        hospitalVerificationNote: note || request.hospitalVerificationNote,
        verifiedByStaffName: req.user.fullName,
        verifiedAt: status === 'VERIFIED' ? new Date() : request.verifiedAt,
      },
    });

    // Notify requester
    if (request.requesterProfile?.userId) {
      await prisma.notification.create({
        data: {
          userId: request.requesterProfile.userId,
          title: `Request ${request.requestCode} status updated`,
          message: `Your request has been moved to ${REVERSE_REQUEST_STATUS_MAP[status] || status}.`,
          category: 'Request Update',
          actionPath: '/dashboard/requester?tab=track',
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        actorName: req.user.fullName,
        actorRole: req.user.role,
        action: `BLOOD_REQUEST_${status}`,
        targetType: 'BloodRequest',
        targetId: id,
        details: { status, note },
        ipAddress: req.ip,
      },
    });

    return res.json({
      success: true,
      message: `Request status updated to ${REVERSE_REQUEST_STATUS_MAP[status] || status}`,
      data: formatRequestForResponse(updated),
    });
  } catch (err) {
    console.error('[UpdateRequestStatusError]', err);
    return res.status(500).json({ success: false, message: 'Failed to update request status.' });
  }
}

export function formatRequestForResponse(r) {
  return {
    id: r.requestCode || r.id,
    dbId: r.id,
    patientName: r.patientName,
    requesterName: r.patientName,
    contactPhone: r.contactPhone,
    contactEmail: r.contactEmail,
    bloodGroup: REVERSE_BLOOD_GROUP_MAP[r.bloodGroup] || 'O+',
    unitsRequired: r.unitsRequired,
    urgency: REVERSE_URGENCY_MAP[r.urgency] || 'Urgent (Within 24 hrs)',
    hospitalId: r.hospitalId,
    hospitalName: r.hospitalName,
    province: r.province,
    district: r.district,
    municipality: r.municipality,
    requiredDate: r.requiredDate,
    requestDetails: r.requestDetails,
    status: REVERSE_REQUEST_STATUS_MAP[r.status] || 'Pending',
    hospitalVerificationNote: r.hospitalVerificationNote,
    verifiedByStaffName: r.verifiedByStaffName,
    verifiedAt: r.verifiedAt,
    createdAt: r.createdAt,
    pledgedDonors: r.donorRequests ? r.donorRequests.map(d => d.donorProfileId) : [],
  };
}
