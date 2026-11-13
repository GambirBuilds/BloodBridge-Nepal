import { getPrismaClient } from '../config/database.js';
import {
  AVAILABILITY_MAP,
  BLOOD_GROUP_MAP,
  CONTACT_METHOD_MAP,
  HOSPITAL_VERIFICATION_STATUS,
  REQUEST_STATUS,
  ROLES,
  URGENCY_MAP,
} from '../constants/index.js';
import { hashPassword } from '../utils/index.js';

export async function seedDatabase() {
  const prisma = await getPrismaClient();

  // Check if already seeded (idempotent)
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('[Seed] Database already populated with records. Skipping initial seed.');
    return;
  }

  console.log('[Seed] Populating database with realistic Nepal demonstration data...');

  const defaultPasswordHash = await hashPassword('demoPassword123');

  // 1. Seed Administrators (Aarav Khadka & Pratiksha KC)
  const admin1 = await prisma.user.create({
    data: {
      email: 'aarav.khadka@demo.bloodbridge.np',
      passwordHash: defaultPasswordHash,
      fullName: 'Aarav Khadka (DEMO DATA)',
      phone: '+977 9851000901',
      role: ROLES.ADMIN,
      district: 'Kathmandu',
      province: 'Bagmati Province',
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      email: 'pratiksha.kc@demo.bloodbridge.np',
      passwordHash: defaultPasswordHash,
      fullName: 'Pratiksha KC (DEMO DATA)',
      phone: '+977 9851000902',
      role: ROLES.ADMIN,
      district: 'Lalitpur',
      province: 'Bagmati Province',
    },
  });

  // 2. Seed Hospitals (Verified, Pending, and Rejected states)
  const hosp1 = await prisma.hospital.create({
    data: {
      hospitalName: 'Bagmati Valley Teaching Hospital (Demo Institution)',
      institutionType: 'Teaching Hospital',
      registrationNumber: 'MOHP-DEMO-2081-014',
      address: 'Maharajgunj Ring Road Corridor, Ward 3',
      province: 'Bagmati Province',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      officialEmail: 'bloodbank@bagmatiteaching.demo.np',
      contactNumber: '+977 01-4412890',
      emergencyDeskPhone: '+977 9851088101',
      authorizedRepresentative: 'Dr. Bikash Poudel',
      representativeDesignation: 'Chief Transfusion Officer',
      verificationStatus: HOSPITAL_VERIFICATION_STATUS.VERIFIED,
      verifiedAt: new Date('2026-08-14'),
      verificationDocReference: 'NPHL-BB-PERMIT-2081-A9',
      operatingHours: '24-Hour Emergency Cross-Match Desk',
      regulatedCrossMatchFeeNPR: 850,
      availableBloodUnits: { 'A+': 14, 'A-': 2, 'B+': 18, 'B-': 3, 'AB+': 7, 'AB-': 1, 'O+': 21, 'O-': 4 },
    },
  });

  const hosp2 = await prisma.hospital.create({
    data: {
      hospitalName: 'Patan Regional Transfusion Center (Demo Institution)',
      institutionType: 'Community Blood Bank',
      registrationNumber: 'MOHP-DEMO-2080-042',
      address: 'Lagankhel Health Complex, Ward 5',
      province: 'Bagmati Province',
      district: 'Lalitpur',
      municipality: 'Lalitpur Metropolitan City',
      officialEmail: 'desk@patantransfusion.demo.np',
      contactNumber: '+977 01-5522410',
      emergencyDeskPhone: '+977 9851144202',
      authorizedRepresentative: 'Dr. Manisha Shrestha',
      representativeDesignation: 'Director of Blood Services',
      verificationStatus: HOSPITAL_VERIFICATION_STATUS.VERIFIED,
      verifiedAt: new Date('2026-07-22'),
      verificationDocReference: 'NPHL-BB-PERMIT-2080-L3',
      operatingHours: '24-Hour Blood Component Unit',
      regulatedCrossMatchFeeNPR: 750,
      availableBloodUnits: { 'A+': 11, 'A-': 3, 'B+': 15, 'B-': 2, 'AB+': 5, 'AB-': 1, 'O+': 19, 'O-': 3 },
    },
  });

  const hosp3Pending = await prisma.hospital.create({
    data: {
      hospitalName: 'Lumbini Siddhartha Specialty Hospital (Demo Institution)',
      institutionType: 'Specialty Hospital',
      registrationNumber: 'LUMB-DEMO-2082-019',
      address: 'Milanchowk Clinical Avenue, Ward 9',
      province: 'Lumbini Province',
      district: 'Rupandehi',
      municipality: 'Butwal Sub-Metropolitan City',
      officialEmail: 'verify@lumbinisiddhartha.demo.np',
      contactNumber: '+977 071-546210',
      emergencyDeskPhone: '+977 9857055606',
      authorizedRepresentative: 'Dr. Rekha Pandey',
      representativeDesignation: 'Medical Superintendent',
      verificationStatus: HOSPITAL_VERIFICATION_STATUS.PENDING,
      verificationDocReference: 'LUMB-PERMIT-PENDING-2083',
      operatingHours: '24-Hour Maternal & Trauma Care',
      regulatedCrossMatchFeeNPR: 800,
      availableBloodUnits: { 'A+': 6, 'A-': 1, 'B+': 9, 'B-': 0, 'AB+': 3, 'AB-': 0, 'O+': 11, 'O-': 1 },
    },
  });

  const hosp4Rejected = await prisma.hospital.create({
    data: {
      hospitalName: 'Seti Far-West Community Clinic (Demo Institution)',
      institutionType: 'Specialty Hospital',
      registrationNumber: 'SUDUR-DEMO-2082-091',
      address: 'Hasanpur Main Road, Ward 5',
      province: 'Sudurpashchim Province',
      district: 'Kailali',
      municipality: 'Dhangadhi Sub-Metropolitan City',
      officialEmail: 'admin@seticlinic.demo.np',
      contactNumber: '+977 091-523499',
      emergencyDeskPhone: '+977 9858477808',
      authorizedRepresentative: 'Bhim Bahadur Bogati',
      representativeDesignation: 'Clinic Operations Manager',
      verificationStatus: HOSPITAL_VERIFICATION_STATUS.REJECTED,
      rejectionReason: 'Submitted NPHL blood storage cold-chain calibration certificate expired; re-upload current renewal.',
      verificationDocReference: 'EXPIRED-CERT-2079-04',
      operatingHours: '07:00–20:00 Outpatient & Minor Procedure',
      regulatedCrossMatchFeeNPR: 750,
      availableBloodUnits: { 'A+': 2, 'A-': 0, 'B+': 4, 'B-': 0, 'AB+': 1, 'AB-': 0, 'O+': 5, 'O-': 0 },
    },
  });

  // 3. Hospital Users and Staff Roster
  const hospUser1 = await prisma.user.create({
    data: {
      email: 'bloodbank@bagmatiteaching.demo.np',
      passwordHash: defaultPasswordHash,
      fullName: 'Dr. Bikash Poudel',
      phone: '+977 01-4412890',
      role: ROLES.HOSPITAL,
      district: 'Kathmandu',
      province: 'Bagmati Province',
    },
  });

  await prisma.hospitalStaff.create({
    data: {
      userId: hospUser1.id,
      hospitalId: hosp1.id,
      roleTitle: 'Chief Transfusion Officer',
      shift: 'Day Shift (08:00–16:00)',
    },
  });

  // 4. Seed Voluntary Donors (Nepal names across provinces)
  const donorsData = [
    { name: 'Suman Thapa', email: 'suman.thapa@demo.bloodbridge.np', phone: '+977 9841234501', group: 'O+', dist: 'Kathmandu', prov: 'Bagmati Province', muni: 'Kathmandu Metropolitan City', pref: 'AVAILABLE_NOW' },
    { name: 'Anisha Gurung', email: 'anisha.gurung@demo.bloodbridge.np', phone: '+977 9846023402', group: 'A-', dist: 'Kaski', prov: 'Gandaki Province', muni: 'Pokhara Metropolitan City', pref: 'AVAILABLE_NOW' },
    { name: 'Prakash Karki', email: 'prakash.karki@demo.bloodbridge.np', phone: '+977 9842098703', group: 'B+', dist: 'Morang', prov: 'Koshi Province', muni: 'Biratnagar Metropolitan City', pref: 'AVAILABLE_NOW' },
    { name: 'Sushmita Shrestha', email: 'sushmita.shrestha@demo.bloodbridge.np', phone: '+977 9851176504', group: 'O-', dist: 'Lalitpur', prov: 'Bagmati Province', muni: 'Lalitpur Metropolitan City', pref: 'EMERGENCY_ONLY' },
    { name: 'Nabin Adhikari', email: 'nabin.adhikari@demo.bloodbridge.np', phone: '+977 9845045605', group: 'AB+', dist: 'Chitwan', prov: 'Bagmati Province', muni: 'Bharatpur Metropolitan City', pref: 'AVAILABLE_NOW' },
    { name: 'Rojina Tamang', email: 'rojina.tamang@demo.bloodbridge.np', phone: '+977 9841998806', group: 'A+', dist: 'Bhaktapur', prov: 'Bagmati Province', muni: 'Madhyapur Thimi Municipality', pref: 'WEEKENDS_AND_EVENINGS' },
    { name: 'Bibek Poudel', email: 'bibek.poudel@demo.bloodbridge.np', phone: '+977 9847032107', group: 'B-', dist: 'Rupandehi', prov: 'Lumbini Province', muni: 'Butwal Sub-Metropolitan City', pref: 'AVAILABLE_NOW' },
    { name: 'Aayush Bhandari', email: 'aayush.bhandari@demo.bloodbridge.np', phone: '+977 9841654308', group: 'O+', dist: 'Kathmandu', prov: 'Bagmati Province', muni: 'Budhanilkantha Municipality', pref: 'AVAILABLE_NOW' },
  ];

  const createdDonorProfiles = [];
  for (const d of donorsData) {
    const u = await prisma.user.create({
      data: {
        email: d.email,
        passwordHash: defaultPasswordHash,
        fullName: `${d.name} (DEMO DATA)`,
        phone: d.phone,
        role: ROLES.DONOR,
        district: d.dist,
        province: d.prov,
      },
    });

    const dp = await prisma.donorProfile.create({
      data: {
        userId: u.id,
        bloodGroup: BLOOD_GROUP_MAP[d.group] || 'O_POSITIVE',
        province: d.prov,
        district: d.dist,
        municipality: d.muni,
        availabilityPreference: d.pref,
        notificationsPaused: false,
        shareMunicipalityPublicly: true,
        preferredContactMethod: 'PLATFORM_NOTIFICATION',
      },
    });

    createdDonorProfiles.push(dp);

    // Initial past donation record
    await prisma.donationRecord.create({
      data: {
        donorProfileId: dp.id,
        hospitalId: hosp1.id,
        units: 1,
        certificateRef: `BB-CERT-2026-${Math.floor(100 + Math.random() * 900)}`,
        donationDate: new Date('2026-06-18'),
        notes: 'Voluntary non-remunerated donation recorded for hospital cross-match reserve.',
      },
    });
  }

  // 5. Seed Requesters (Ramesh Adhikari & Nisha Tamang)
  const reqUser1 = await prisma.user.create({
    data: {
      email: 'ramesh.adhikari@demo.bloodbridge.np',
      passwordHash: defaultPasswordHash,
      fullName: 'Ramesh Adhikari (DEMO DATA)',
      phone: '+977 9851023456',
      role: ROLES.REQUESTER,
      district: 'Kathmandu',
      province: 'Bagmati Province',
    },
  });

  const reqProfile1 = await prisma.requesterProfile.create({
    data: {
      userId: reqUser1.id,
      district: 'Kathmandu',
      province: 'Bagmati Province',
    },
  });

  const reqUser2 = await prisma.user.create({
    data: {
      email: 'nisha.tamang@demo.bloodbridge.np',
      passwordHash: defaultPasswordHash,
      fullName: 'Nisha Tamang (DEMO DATA)',
      phone: '+977 9841667788',
      role: ROLES.REQUESTER,
      district: 'Lalitpur',
      province: 'Bagmati Province',
    },
  });

  const reqProfile2 = await prisma.requesterProfile.create({
    data: {
      userId: reqUser2.id,
      district: 'Lalitpur',
      province: 'Bagmati Province',
    },
  });

  // 6. Seed Blood Requests across all required 7 statuses
  const req1 = await prisma.bloodRequest.create({
    data: {
      requestCode: 'REQ-NP-2083',
      requesterProfileId: reqProfile1.id,
      patientName: 'Tika Ram Adhikari',
      contactPhone: '+977 9851023456',
      contactEmail: 'ramesh.adhikari@demo.bloodbridge.np',
      bloodGroup: BLOOD_GROUP_MAP['O-'],
      unitsRequired: 2,
      urgency: 'CRITICAL',
      hospitalId: hosp1.id,
      hospitalName: hosp1.hospitalName,
      province: 'Bagmati Province',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      requiredDate: new Date('2026-11-12'),
      requestDetails: 'Scheduled emergency mitral valve surgery in Ward CT-ICU Bed 4. Two packed red blood cell units required for cross-match.',
      status: REQUEST_STATUS.VERIFIED,
      hospitalVerificationNote: 'Verified against Cardio-Thoracic ICU requisition slip #CT-892 by Dr. Bikash Poudel.',
      verifiedByStaffName: 'Dr. Bikash Poudel',
      verifiedAt: new Date(),
    },
  });

  const req2 = await prisma.bloodRequest.create({
    data: {
      requestCode: 'REQ-NP-2082',
      requesterProfileId: reqProfile2.id,
      patientName: 'Nisha Tamang',
      contactPhone: '+977 9841667788',
      contactEmail: 'nisha.tamang@demo.bloodbridge.np',
      bloodGroup: BLOOD_GROUP_MAP['A-'],
      unitsRequired: 2,
      urgency: 'URGENT',
      hospitalId: hosp2.id,
      hospitalName: hosp2.hospitalName,
      province: 'Bagmati Province',
      district: 'Lalitpur',
      municipality: 'Lalitpur Metropolitan City',
      requiredDate: new Date('2026-11-12'),
      requestDetails: 'Post-partum hemorrhage standby support in Maternity Ward B. Coordinating second voluntary donor.',
      status: REQUEST_STATUS.DONOR_COORDINATION,
      hospitalVerificationNote: 'Maternity high-dependency ward slip verified by Dr. Manisha Shrestha; 1 donor confirmed.',
      verifiedByStaffName: 'Dr. Manisha Shrestha',
      verifiedAt: new Date(),
    },
  });

  const req3 = await prisma.bloodRequest.create({
    data: {
      requestCode: 'REQ-NP-2081',
      requesterProfileId: reqProfile1.id,
      patientName: 'Kamal Khadka',
      contactPhone: '+977 9851023456',
      contactEmail: 'ramesh.adhikari@demo.bloodbridge.np',
      bloodGroup: BLOOD_GROUP_MAP['B+'],
      unitsRequired: 1,
      urgency: 'SCHEDULED_SURGERY',
      hospitalId: hosp1.id,
      hospitalName: hosp1.hospitalName,
      province: 'Bagmati Province',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      requiredDate: new Date('2026-11-14'),
      requestDetails: 'Elective hip arthroplasty scheduled on 14 Nov. One whole blood unit requested for reserve.',
      status: REQUEST_STATUS.PENDING,
      hospitalVerificationNote: 'Awaiting ward requisition confirmation from Orthopedics Unit II.',
    },
  });

  const req4 = await prisma.bloodRequest.create({
    data: {
      requestCode: 'REQ-NP-2080',
      requesterProfileId: reqProfile2.id,
      patientName: 'Sarita Magar',
      contactPhone: '+977 9841667788',
      contactEmail: 'nisha.tamang@demo.bloodbridge.np',
      bloodGroup: BLOOD_GROUP_MAP['O+'],
      unitsRequired: 3,
      urgency: 'URGENT',
      hospitalId: hosp1.id,
      hospitalName: hosp1.hospitalName,
      province: 'Bagmati Province',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      requiredDate: new Date('2026-11-12'),
      requestDetails: 'Severe anemia management in Medical Ward 3. Reviewing transfusion chart.',
      status: REQUEST_STATUS.UNDER_VERIFICATION,
      hospitalVerificationNote: 'Pathology desk reviewing hematology oncology transfusion chart.',
    },
  });

  const req5 = await prisma.bloodRequest.create({
    data: {
      requestCode: 'REQ-NP-2079',
      requesterProfileId: reqProfile1.id,
      patientName: 'Gita Devi Chaudhary',
      contactPhone: '+977 9851023456',
      contactEmail: 'ramesh.adhikari@demo.bloodbridge.np',
      bloodGroup: BLOOD_GROUP_MAP['AB+'],
      unitsRequired: 2,
      urgency: 'CRITICAL',
      hospitalId: hosp1.id,
      hospitalName: hosp1.hospitalName,
      province: 'Bagmati Province',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      requiredDate: new Date('2026-11-08'),
      requestDetails: 'Oncology surgical resection transfusion completed with voluntary donor coordination.',
      status: REQUEST_STATUS.FULFILLED,
      hospitalVerificationNote: 'Both units cross-matched and issued to Surgical ICU on 8 Nov 2026.',
    },
  });

  const req6 = await prisma.bloodRequest.create({
    data: {
      requestCode: 'REQ-NP-2077',
      requesterProfileId: reqProfile1.id,
      patientName: 'Sita Devi Adhikari',
      contactPhone: '+977 9851023456',
      contactEmail: 'ramesh.adhikari@demo.bloodbridge.np',
      bloodGroup: BLOOD_GROUP_MAP['A+'],
      unitsRequired: 1,
      urgency: 'SCHEDULED_SURGERY',
      hospitalId: hosp2.id,
      hospitalName: hosp2.hospitalName,
      province: 'Bagmati Province',
      district: 'Lalitpur',
      municipality: 'Lalitpur Metropolitan City',
      requiredDate: new Date('2026-11-05'),
      requestDetails: 'Laparoscopic procedure reserve covered by existing hospital inventory.',
      status: REQUEST_STATUS.CANCELLED,
      hospitalVerificationNote: 'Cancelled by requester after hospital internal blood bank covered the unit.',
    },
  });

  const req7 = await prisma.bloodRequest.create({
    data: {
      requestCode: 'REQ-NP-2076',
      requesterProfileId: reqProfile2.id,
      patientName: 'Unverified Inpatient',
      contactPhone: '+977 9841667788',
      contactEmail: 'nisha.tamang@demo.bloodbridge.np',
      bloodGroup: BLOOD_GROUP_MAP['AB-'],
      unitsRequired: 4,
      urgency: 'URGENT',
      hospitalId: hosp1.id,
      hospitalName: hosp1.hospitalName,
      province: 'Bagmati Province',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      requiredDate: new Date('2026-11-06'),
      requestDetails: 'Unverified submission lacking inpatient bed number or attending physician requisition.',
      status: REQUEST_STATUS.REJECTED,
      hospitalVerificationNote: 'Rejected during hospital verification: no matching inpatient admission or requisition slip found.',
    },
  });

  // 7. Seed Donor Requests (Invitations)
  await prisma.donorRequest.create({
    data: {
      bloodRequestId: req1.id,
      donorProfileId: createdDonorProfiles[3].id, // Sushmita Shrestha (O-)
      status: 'ACCEPTED',
      responseNote: 'Donor confirmed arrival at Maharajgunj blood bank desk.',
    },
  });

  await prisma.donorRequest.create({
    data: {
      bloodRequestId: req2.id,
      donorProfileId: createdDonorProfiles[1].id, // Anisha Gurung (A-)
      status: 'ACCEPTED',
      responseNote: 'Coordinating arrival for maternity reserve cross-match.',
    },
  });

  // 8. Seed Initial Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: admin1.id,
      actorName: 'Aarav Khadka',
      actorRole: ROLES.ADMIN,
      action: 'SYSTEM_INITIALIZED',
      targetType: 'Platform',
      targetId: 'NEPAL-V1',
      details: { environment: 'production-ready', provinces: 7 },
      ipAddress: '127.0.0.1',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: hospUser1.id,
      actorName: 'Dr. Bikash Poudel',
      actorRole: ROLES.HOSPITAL,
      action: 'BLOOD_REQUEST_VERIFIED',
      targetType: 'BloodRequest',
      targetId: req1.id,
      details: { requestCode: 'REQ-NP-2083', units: 2, bloodGroup: 'O-' },
      ipAddress: '127.0.0.1',
    },
  });

  console.log('[Seed] Database seeding completed successfully.');
}
