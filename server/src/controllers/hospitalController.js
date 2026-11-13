import { getPrismaClient } from '../config/database.js';
import { REVERSE_HOSPITAL_VERIFICATION_MAP } from '../constants/index.js';
import { hashPassword } from '../utils/index.js';
import { formatRequestForResponse } from './requestController.js';

export async function registerHospital(req, res) {
  try {
    const data = req.validatedBody;
    const prisma = await getPrismaClient();

    // Check existing email
    const existingEmail = await prisma.user.findUnique({ where: { email: data.officialEmail } });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'An account with this official email already exists.' });
    }

    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.officialEmail,
        passwordHash,
        fullName: data.authorizedRepresentative,
        phone: data.contactNumber,
        role: 'HOSPITAL',
        district: data.district,
        province: data.province,
      },
    });

    // Create hospital in PENDING verification state
    const hospital = await prisma.hospital.create({
      data: {
        hospitalName: data.hospitalName,
        institutionType: data.institutionType || 'Public Hospital',
        registrationNumber: data.registrationNumber,
        address: data.address,
        province: data.province,
        district: data.district,
        municipality: data.municipality,
        officialEmail: data.officialEmail,
        contactNumber: data.contactNumber,
        authorizedRepresentative: data.authorizedRepresentative,
        representativeDesignation: data.representativeDesignation,
        verificationStatus: 'PENDING',
        verificationDocReference: data.verificationDocReference,
      },
    });

    await prisma.hospitalStaff.create({
      data: {
        userId: user.id,
        hospitalId: hospital.id,
        roleTitle: data.representativeDesignation,
      },
    });

    await prisma.hospitalVerification.create({
      data: {
        hospitalId: hospital.id,
        status: 'PENDING',
        notes: 'Initial institutional permit submitted. Awaiting administrative review.',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Hospital registered successfully and queued for administrative verification.',
      data: formatHospitalForResponse(hospital),
    });
  } catch (err) {
    console.error('[RegisterHospitalError]', err);
    return res.status(500).json({ success: false, message: 'Failed to register hospital.' });
  }
}

export async function getHospitals(req, res) {
  try {
    const { province, district, verificationStatus } = req.query;
    const prisma = await getPrismaClient();

    const where = {};
    if (province) where.province = province;
    if (district) where.district = district;
    if (verificationStatus) where.verificationStatus = verificationStatus;

    const hospitals = await prisma.hospital.findMany({
      where,
      include: { staff: true },
    });

    return res.json({
      success: true,
      count: hospitals.length,
      data: hospitals.map(formatHospitalForResponse),
    });
  } catch (err) {
    console.error('[GetHospitalsError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve hospitals.' });
  }
}

export async function getHospitalById(req, res) {
  try {
    const { id } = req.params;
    const prisma = await getPrismaClient();

    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: { staff: true },
    });

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    return res.json({
      success: true,
      data: formatHospitalForResponse(hospital),
    });
  } catch (err) {
    console.error('[GetHospitalByIdError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve hospital.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const data = req.validatedBody;
    const prisma = await getPrismaClient();

    if (req.user.role !== 'HOSPITAL' || !req.user.hospitalStaff) {
      return res.status(403).json({ success: false, message: 'Only hospital staff can update hospital profile.' });
    }

    const hospitalId = req.user.hospitalStaff.hospitalId;
    const updated = await prisma.hospital.update({
      where: { id: hospitalId },
      data,
    });

    return res.json({
      success: true,
      message: 'Hospital profile updated successfully.',
      data: formatHospitalForResponse(updated),
    });
  } catch (err) {
    console.error('[UpdateHospitalProfileError]', err);
    return res.status(500).json({ success: false, message: 'Failed to update hospital profile.' });
  }
}

export async function getHospitalRequests(req, res) {
  try {
    const prisma = await getPrismaClient();
    if (req.user.role !== 'HOSPITAL' || !req.user.hospitalStaff) {
      return res.status(403).json({ success: false, message: 'Hospital staff profile required.' });
    }

    const hospitalId = req.user.hospitalStaff.hospitalId;
    const requests = await prisma.bloodRequest.findMany({
      where: { hospitalId },
      include: { donorRequests: true },
    });

    return res.json({
      success: true,
      count: requests.length,
      data: requests.map(formatRequestForResponse),
    });
  } catch (err) {
    console.error('[GetHospitalRequestsError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve hospital requests.' });
  }
}

export async function verifyRequest(req, res) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const prisma = await getPrismaClient();

    if (req.user.role !== 'HOSPITAL' || !req.user.hospitalStaff) {
      return res.status(403).json({ success: false, message: 'Only authorized hospital staff can verify requisitions.' });
    }

    const hospital = await prisma.hospital.findUnique({
      where: { id: req.user.hospitalStaff.hospitalId },
    });

    if (hospital.verificationStatus !== 'VERIFIED') {
      return res.status(403).json({
        success: false,
        message: 'Unverified hospitals cannot perform clinical request verifications.',
      });
    }

    const targetRequest = await prisma.bloodRequest.findUnique({ where: { id } });
    if (!targetRequest || targetRequest.hospitalId !== hospital.id) {
      return res.status(404).json({ success: false, message: 'Request not found at this hospital.' });
    }

    const updated = await prisma.bloodRequest.update({
      where: { id },
      data: {
        status: status || 'VERIFIED',
        hospitalVerificationNote: note || `Verified against inpatient requisition by ${req.user.fullName}.`,
        verifiedByStaffName: req.user.fullName,
        verifiedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: 'Requisition verified successfully.',
      data: formatRequestForResponse(updated),
    });
  } catch (err) {
    console.error('[VerifyRequestError]', err);
    return res.status(500).json({ success: false, message: 'Failed to verify request.' });
  }
}

export async function getVerificationStatus(req, res) {
  try {
    const prisma = await getPrismaClient();
    if (req.user.role !== 'HOSPITAL' || !req.user.hospitalStaff) {
      return res.status(403).json({ success: false, message: 'Hospital staff profile required.' });
    }

    const hospital = await prisma.hospital.findUnique({
      where: { id: req.user.hospitalStaff.hospitalId },
    });

    return res.json({
      success: true,
      data: {
        hospitalId: hospital.id,
        hospitalName: hospital.hospitalName,
        verificationStatus: REVERSE_HOSPITAL_VERIFICATION_MAP[hospital.verificationStatus] || 'Pending',
        verifiedAt: hospital.verifiedAt,
        rejectionReason: hospital.rejectionReason,
        verificationDocReference: hospital.verificationDocReference,
      },
    });
  } catch (err) {
    console.error('[GetVerificationStatusError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve verification status.' });
  }
}

export function formatHospitalForResponse(h) {
  let units = h.availableBloodUnits;
  if (typeof units === 'string') {
    try {
      units = JSON.parse(units);
    } catch {
      units = { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 };
    }
  }

  return {
    id: h.id,
    hospitalName: h.hospitalName,
    institutionType: h.institutionType,
    registrationNumber: h.registrationNumber,
    address: h.address,
    province: h.province,
    district: h.district,
    municipality: h.municipality,
    officialEmail: h.officialEmail,
    contactNumber: h.contactNumber,
    emergencyDeskPhone: h.emergencyDeskPhone || h.contactNumber,
    authorizedRepresentative: h.authorizedRepresentative,
    representativeDesignation: h.representativeDesignation,
    verificationStatus: REVERSE_HOSPITAL_VERIFICATION_MAP[h.verificationStatus] || 'Pending',
    verifiedAt: h.verifiedAt,
    rejectionReason: h.rejectionReason,
    verificationDocReference: h.verificationDocReference,
    operatingHours: h.operatingHours,
    regulatedCrossMatchFeeNPR: h.regulatedCrossMatchFeeNPR,
    availableBloodUnits: units || { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 },
    staff: h.staff || [],
  };
}
