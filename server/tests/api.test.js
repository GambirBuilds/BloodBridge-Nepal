import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { getPrismaClient } from '../src/config/database.js';
import { seedDatabase } from '../src/services/seedService.js';

async function runTestSuite() {
  console.log('--- STARTING BLOODBRIDGE COMPREHENSIVE E2E & SECURITY TEST SUITE ---');

  // Initialize and Seed In-Process Database
  const prisma = await getPrismaClient();
  await seedDatabase();

  const app = createApp();

  let server;
  await new Promise((resolve) => {
    server = app.listen(5199, () => resolve());
  });

  const baseUrl = 'http://localhost:5199/api';

  try {
    // -------------------------------------------------------------
    // WORKFLOW A: DONOR WORKFLOW
    // -------------------------------------------------------------
    console.log('\n[Workflow A: Donor]');
    console.log('  1. Register new voluntary donor...');
    const newDonorEmail = `anisha.donor.${Date.now()}@demo.bloodbridge.np`;
    const donorRegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Anisha Gurung',
        email: newDonorEmail,
        phone: '+977 9841999888',
        password: 'securePassword123',
        role: 'DONOR',
        bloodGroup: 'B+',
        province: 'Gandaki Province',
        district: 'Kaski',
        municipality: 'Pokhara Metropolitan City',
        consentDonorRequests: true,
        consentPrivacy: true,
      }),
    }).then((r) => r.json());
    assert.equal(donorRegRes.success, true);
    assert.ok(donorRegRes.data.accessToken);
    const donorToken = donorRegRes.data.accessToken;
    console.log('  ✔ Donor registration succeeded with JWT.');

    console.log('  2. Complete donor profile update...');
    const profileUpdateRes = await fetch(`${baseUrl}/donors/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`,
      },
      body: JSON.stringify({
        preferredContactMethod: 'Platform Notification',
        shareMunicipalityPublicly: true,
      }),
    }).then((r) => r.json());
    assert.equal(profileUpdateRes.success, true);
    console.log('  ✔ Donor profile preferences updated.');

    console.log('  3. Toggle availability & pause notifications...');
    const availRes = await fetch(`${baseUrl}/donors/availability`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`,
      },
      body: JSON.stringify({
        availabilityPreference: 'Emergency Only',
        notificationsPaused: false,
      }),
    }).then((r) => r.json());
    assert.equal(availRes.success, true);
    console.log('  ✔ Donor availability toggled successfully.');

    // -------------------------------------------------------------
    // WORKFLOW B: REQUESTER WORKFLOW
    // -------------------------------------------------------------
    console.log('\n[Workflow B: Requester]');
    console.log('  4. Register patient/requester account...');
    const reqEmail = `requester.${Date.now()}@demo.bloodbridge.np`;
    const reqRegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Prakash Karki',
        email: reqEmail,
        phone: '+977 9851088777',
        password: 'securePassword123',
        role: 'REQUESTER',
        province: 'Bagmati Province',
        district: 'Kathmandu',
      }),
    }).then((r) => r.json());
    assert.equal(reqRegRes.success, true);
    const requesterToken = reqRegRes.data.accessToken;
    console.log('  ✔ Requester registered and authenticated.');

    console.log('  5. Submit hospital blood request...');
    const bloodReqRes = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requesterToken}`,
      },
      body: JSON.stringify({
        patientName: 'Sushmita Shrestha',
        contactPhone: '+977 9851088777',
        bloodGroup: 'O+',
        unitsRequired: 2,
        urgency: 'Emergency (Immediate)',
        hospitalName: 'Bagmati Valley Teaching Hospital (Demo Institution)',
        province: 'Bagmati Province',
        district: 'Kathmandu',
        municipality: 'Kathmandu Metropolitan City',
        requiredDate: '2026-11-25',
        requestDetails: 'Emergency acute trauma unit admission requiring urgent O+ units.',
      }),
    }).then((r) => r.json());
    assert.equal(bloodReqRes.success, true);
    assert.equal(bloodReqRes.data.status, 'Pending');
    const createdRequestId = bloodReqRes.data.id;
    console.log(`  ✔ Blood request created with ID: ${createdRequestId}.`);

    console.log('  6. View requester dashboard requests...');
    const myRequestsRes = await fetch(`${baseUrl}/requests/my`, {
      headers: { Authorization: `Bearer ${requesterToken}` },
    }).then((r) => r.json());
    assert.equal(myRequestsRes.success, true);
    assert.ok(myRequestsRes.data.length >= 1);
    console.log('  ✔ Requester requests retrieved.');

    // -------------------------------------------------------------
    // WORKFLOW C: HOSPITAL WORKFLOW
    // -------------------------------------------------------------
    console.log('\n[Workflow C: Hospital]');
    console.log('  7. Login verified hospital account...');
    const hospLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bloodbank@bagmatiteaching.demo.np',
        password: 'demoPassword123',
      }),
    }).then((r) => r.json());
    assert.equal(hospLoginRes.success, true);
    assert.equal(hospLoginRes.data.user.role, 'HOSPITAL');
    const hospitalToken = hospLoginRes.data.accessToken;
    console.log('  ✔ Hospital staff authorized.');

    console.log('  8. Verify inpatient requisition slip...');
    const verifyReqRes = await fetch(`${baseUrl}/requests/${createdRequestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hospitalToken}`,
      },
      body: JSON.stringify({
        status: 'VERIFIED',
        note: 'Inpatient requisition confirmed against Emergency Ward Record #ER-891.',
      }),
    }).then((r) => r.json());
    assert.equal(verifyReqRes.success, true);
    assert.equal(verifyReqRes.data.status, 'Verified');
    console.log('  ✔ Request status updated to VERIFIED.');

    // -------------------------------------------------------------
    // WORKFLOW D: ADMIN WORKFLOW
    // -------------------------------------------------------------
    console.log('\n[Workflow D: Admin]');
    console.log('  9. Login admin account...');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aarav.khadka@demo.bloodbridge.np',
        password: 'demoPassword123',
      }),
    }).then((r) => r.json());
    assert.equal(adminLoginRes.success, true);
    assert.equal(adminLoginRes.data.user.role, 'ADMIN');
    const adminToken = adminLoginRes.data.accessToken;
    console.log('  ✔ Admin console authorized.');

    console.log('  10. Query admin dashboard metrics...');
    const metricsRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    assert.equal(metricsRes.success, true);
    assert.ok(metricsRes.data.totalRegisteredDonors > 0);
    console.log('  ✔ National dashboard metrics verified.');

    console.log('  11. Submit and review suspicious activity report...');
    const reportSubmit = await fetch(`${baseUrl}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requesterToken}`,
      },
      body: JSON.stringify({
        targetType: 'BLOOD_REQUEST',
        targetId: createdRequestId,
        reason: 'Duplicate check investigation',
        details: 'Testing trust and abuse reporting pipeline for safety auditing.',
      }),
    }).then((r) => r.json());
    assert.equal(reportSubmit.success, true);
    const reportId = reportSubmit.data.id;

    const reportReview = await fetch(`${baseUrl}/reports/${reportId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'RESOLVED',
        actionTaken: 'Inspected and verified inpatient requisition details.',
      }),
    }).then((r) => r.json());
    assert.equal(reportReview.success, true);
    console.log('  ✔ Trust report submitted and marked RESOLVED.');

    // -------------------------------------------------------------
    // WORKFLOW E: SECURITY & PRIVACY WORKFLOW
    // -------------------------------------------------------------
    console.log('\n[Workflow E: Security]');
    console.log('  12. Unauthorized request blocked (401)...');
    const unauthRes = await fetch(`${baseUrl}/admin/dashboard`);
    assert.equal(unauthRes.status, 401);
    console.log('  ✔ Unauthenticated access rejected with HTTP 401.');

    console.log('  13. Invalid JWT rejected (401)...');
    const invalidJwtRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: 'Bearer invalid-token-123' },
    });
    assert.equal(invalidJwtRes.status, 401);
    console.log('  ✔ Tampered/invalid JWT rejected.');

    console.log('  14. Role-based access control enforced (403)...');
    const rbacDeniedRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    assert.equal(rbacDeniedRes.status, 403);
    console.log('  ✔ Donor forbidden from Admin API with HTTP 403.');

    console.log('  15. Public donor privacy projection (no phone/email)...');
    const donorSearchRes = await fetch(`${baseUrl}/donors?bloodGroup=B%2B`).then((r) =>
      r.json()
    );
    assert.equal(donorSearchRes.success, true);
    donorSearchRes.data.forEach((d) => {
      assert.equal(d.phone, undefined, 'Phone must NEVER be present in public donor search');
      assert.equal(d.email, undefined, 'Email must NEVER be present in public donor search');
    });
    console.log('  ✔ Donor directory strictly masks contact credentials.');

    console.log('  16. Duplicate request protection (409)...');
    const dupRes = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requesterToken}`,
      },
      body: JSON.stringify({
        patientName: 'Sushmita Shrestha',
        contactPhone: '+977 9851088777',
        bloodGroup: 'O+',
        unitsRequired: 2,
        urgency: 'Emergency (Immediate)',
        hospitalName: 'Bagmati Valley Teaching Hospital (Demo Institution)',
        province: 'Bagmati Province',
        district: 'Kathmandu',
        municipality: 'Kathmandu Metropolitan City',
        requiredDate: '2026-11-25',
        requestDetails: 'Exact duplicate test submission.',
      }),
    });
    assert.equal(dupRes.status, 409);
    console.log('  ✔ Duplicate active request safely rejected with HTTP 409.');

    console.log('\n======================================================');
    console.log('🎉 ALL 16 COMPREHENSIVE INTEGRATION & SECURITY TESTS PASSED (16/16)');
    console.log('======================================================');
  } finally {
    server.close();
  }
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
