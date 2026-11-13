import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  BloodGroupMark,
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  SelectField,
  StatusText,
  Surface,
} from '../../components/common/ui';
import StatStrip from '../../components/dashboard/StatStrip';
import { useAuth } from '../../hooks/useAuth';
import { usePlatformData } from '../../hooks/usePlatformData';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { BLOOD_GROUPS, getCompatibleDonorGroups } from '../../utils/bloodCompatibility';
import { formatDisplayDate, formatNPR, formatPublicDonorName } from '../../utils/formatters';

export default function HospitalDashboard() {
  const { currentUser } = useAuth();
  const {
    hospitals,
    requests,
    donors,
    updateBloodRequestStatus,
    updateHospitalBloodUnits,
    addHospitalStaff,
    removeHospitalStaff,
  } = usePlatformData();
  const { showToast } = useToast();

  // Allow inspecting Verified, Pending, and Rejected demo hospital profiles seamlessly
  const [previewHospitalId, setPreviewHospitalId] = useState(
    currentUser?.linkedRecordId || 'HOSP-NP-101'
  );
  const [verificationNotes, setVerificationNotes] = useState({});
  const [staffForm, setStaffForm] = useState({
    name: '',
    role: 'Blood Bank Technologist',
    email: '',
    shift: 'Day Shift (08:00–16:00)',
  });
  const [staffToRemove, setStaffToRemove] = useState(null);

  const hospital =
    hospitals.find((h) => h.id === previewHospitalId) || hospitals[0];

  const hospitalRequests = requests.filter(
    (r) => r.hospitalId === hospital.id || r.hospitalName === hospital.hospitalName
  );
  const incomingQueue = hospitalRequests.filter((r) =>
    ['Pending', 'Under Verification'].includes(r.status)
  );
  const coordinationQueue = hospitalRequests.filter((r) =>
    ['Verified', 'Donor Coordination'].includes(r.status)
  );
  const historicalQueue = hospitalRequests.filter((r) =>
    ['Fulfilled', 'Cancelled', 'Rejected'].includes(r.status)
  );

  const totalUnitsInStock = Object.values(hospital.availableBloodUnits || {}).reduce(
    (sum, n) => sum + Number(n || 0),
    0
  );

  const stockChartData = BLOOD_GROUPS.map((group) => ({
    group,
    units: Number(hospital.availableBloodUnits?.[group] || 0),
  }));

  const isHospitalVerified = hospital.verificationStatus === 'Verified';

  const handleStatusDecision = async (req, nextStatus) => {
    const note =
      verificationNotes[req.id] ||
      (nextStatus === 'Verified'
        ? `Ward requisition verified by ${hospital.authorizedRepresentative} at ${hospital.hospitalName}.`
        : nextStatus === 'Rejected'
        ? `Declined by ${hospital.hospitalName}: unable to confirm inpatient requisition slip.`
        : `Status updated to ${nextStatus} by ${hospital.authorizedRepresentative}.`);

    await updateBloodRequestStatus(
      req.id,
      nextStatus,
      note,
      hospital.authorizedRepresentative
    );
    showToast({
      tone: 'success',
      title: `${req.id} marked ${nextStatus}`,
      description: 'Requester and compatible donor queues updated (Demo Mode).',
    });
  };

  const handleAdjustStock = async (group, delta) => {
    const current = Number(hospital.availableBloodUnits?.[group] || 0);
    const nextVal = Math.max(0, current + delta);
    await updateHospitalBloodUnits(hospital.id, {
      ...hospital.availableBloodUnits,
      [group]: nextVal,
    });
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.email.trim()) return;
    await addHospitalStaff(hospital.id, staffForm);
    setStaffForm({
      name: '',
      role: 'Blood Bank Technologist',
      email: '',
      shift: 'Day Shift (08:00–16:00)',
    });
    showToast({
      tone: 'success',
      title: 'Staff member added',
      description: 'Transfusion desk roster updated (Demo Mode).',
    });
  };

  return (
    <DashboardLayout
      role="hospital"
      title="Hospital & blood bank workspace"
      subtitle={`${hospital.hospitalName} · ${hospital.district}`}
      secondaryAction={
        <select
          aria-label="Inspect hospital verification state"
          value={hospital.id}
          onChange={(e) => setPreviewHospitalId(e.target.value)}
          className="min-h-10 rounded-control border border-border bg-surface px-3 text-xs font-medium text-foreground"
        >
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>
              {h.verificationStatus}: {h.hospitalName.replace(' (Demo Institution)', '')}
            </option>
          ))}
        </select>
      }
    >
      {({ activeTab, setActiveTab }) => (
        <div className="space-y-6">
          <ConfirmDialog
            open={Boolean(staffToRemove)}
            title={`Remove ${staffToRemove?.name} from transfusion desk?`}
            description="This revokes blood request verification privileges for this staff member in demo mode."
            confirmLabel="Remove staff member"
            onConfirm={() => {
              removeHospitalStaff(hospital.id, staffToRemove.id);
              showToast({
                tone: 'success',
                title: 'Staff member removed',
              });
            }}
            onClose={() => setStaffToRemove(null)}
          />

          {/* Explicit Verification Status Banner for Pending / Rejected / Verified */}
          <Surface className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusText status={hospital.verificationStatus} />
                <span className="text-xs text-subtle">·</span>
                <span className="font-mono text-xs text-muted">
                  Permit: {hospital.verificationDocReference}
                </span>
              </div>
              {hospital.verificationStatus === 'Verified' && (
                <p className="mt-1 text-sm text-muted">
                  Institutional credentials verified on {formatDisplayDate(hospital.verifiedAt)}.
                  Full requisition verification and donor coordination enabled (Demo Institution).
                </p>
              )}
              {hospital.verificationStatus === 'Pending' && (
                <p className="mt-1 text-sm text-warning">
                  Pending Verification: Platform administrators are reviewing your MoHP / NPHL
                  permit credentials. Request verification unlocks upon approval.
                </p>
              )}
              {hospital.verificationStatus === 'Rejected' && (
                <p className="mt-1 text-sm text-danger">
                  Verification Rejected: {hospital.rejectionReason || 'Submitted permit expired.'}{' '}
                  Update credentials with platform administration to reactivate.
                </p>
              )}
            </div>

            <Button tone="quiet" size="sm" onClick={() => setActiveTab('requests')}>
              Review incoming requests ({incomingQueue.length})
            </Button>
          </Surface>

          {activeTab === 'overview' && (
            <>
              <StatStrip
                leadMetric={{
                  label: 'Indicative blood bank stock',
                  value: `${totalUnitsInStock} units`,
                  caption: `Across 8 ABO/Rh groups · Regulated lab fee ${formatNPR(
                    hospital.regulatedCrossMatchFeeNPR
                  )}`,
                }}
                secondaryMetrics={[
                  {
                    label: 'Awaiting verification',
                    value: incomingQueue.length,
                    highlight: incomingQueue.length > 0,
                    caption: 'Ward slip checks',
                  },
                  {
                    label: 'Active donor outreach',
                    value: coordinationQueue.length,
                    caption: 'Verified requests',
                  },
                  {
                    label: 'Completed / closed',
                    value: historicalQueue.length,
                    caption: 'Historical cases',
                  },
                  {
                    label: 'Authorized staff',
                    value: (hospital.staff || []).length,
                    caption: 'Transfusion desk',
                  },
                ]}
              />

              <Surface className="divide-y divide-border/60 p-6">
                <div className="pb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Institutional information (Demonstration record)
                  </h2>
                  <p className="text-sm text-muted">
                    Registered details for {hospital.hospitalName}
                  </p>
                </div>

                <dl className="grid grid-cols-1 gap-5 py-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted">Registration reference</dt>
                    <dd className="mt-0.5 font-mono font-medium text-foreground">
                      {hospital.registrationNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Institution category</dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {hospital.institutionType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Authorized representative</dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {hospital.authorizedRepresentative} ({hospital.representativeDesignation})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Address & municipality</dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {hospital.address}, {hospital.municipality}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">District & province</dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {hospital.district}, {hospital.province}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Desk contact & hours</dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {hospital.contactNumber} · {hospital.operatingHours}
                    </dd>
                  </div>
                </dl>
              </Surface>
            </>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Incoming blood request verification queue
                </h2>
                <p className="text-sm text-muted">
                  Confirm inpatient ward admission and requisition slip before activating district
                  donor notifications.
                </p>
              </div>

              {incomingQueue.length === 0 ? (
                <Surface className="p-6">
                  <EmptyState
                    title="No pending ward verifications for this institution"
                    description="All submitted blood requests naming this hospital have been reviewed."
                    actionLabel="Open donor coordination queue"
                    onAction={() => setActiveTab('coordination')}
                  />
                </Surface>
              ) : (
                <div className="space-y-4">
                  {incomingQueue.map((req) => (
                    <Surface key={req.id} className="divide-y divide-border/60 p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 pb-4">
                        <div>
                          <p className="font-mono text-xs font-medium text-primary">
                            {req.id} · {req.urgency} · Required {formatDisplayDate(req.requiredDate)}
                          </p>
                          <h3 className="mt-1 text-base font-semibold text-foreground">
                            {req.unitsRequired} unit(s) {req.bloodGroup} · Patient:{' '}
                            {req.patientName || req.requesterName}
                          </h3>
                          <p className="mt-1 text-sm text-muted">{req.requestDetails}</p>
                          <p className="mt-1 text-xs text-subtle">
                            Attendant: {req.requesterName} · {req.contactPhone}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusText status={req.status} />
                          <BloodGroupMark group={req.bloodGroup} size="lg" />
                        </div>
                      </div>

                      <div className="space-y-3 pt-4">
                        <Field
                          label="Clinical verification note (logged on request timeline)"
                          placeholder="e.g. Verified against Ortho Ward II slip #OR-412; internal stock 0 units"
                          value={verificationNotes[req.id] || ''}
                          onChange={(e) =>
                            setVerificationNotes((prev) => ({
                              ...prev,
                              [req.id]: e.target.value,
                            }))
                          }
                        />
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          {!isHospitalVerified && (
                            <p className="text-xs text-danger">
                              Verification actions require a Verified hospital account.
                            </p>
                          )}
                          <div className="ml-auto flex flex-wrap gap-2">
                            <Button
                              tone="quiet"
                              size="sm"
                              disabled={!isHospitalVerified}
                              onClick={() =>
                                handleStatusDecision(req, 'Under Verification')
                              }
                            >
                              Mark under verification
                            </Button>
                            <Button
                              tone="danger"
                              size="sm"
                              disabled={!isHospitalVerified}
                              onClick={() => handleStatusDecision(req, 'Rejected')}
                            >
                              Reject slip
                            </Button>
                            <Button
                              tone="success"
                              size="sm"
                              disabled={!isHospitalVerified}
                              onClick={() => handleStatusDecision(req, 'Verified')}
                            >
                              Verify & alert donors
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Surface>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'coordination' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Verified request & voluntary donor coordination
                </h2>
                <p className="text-sm text-muted">
                  Track voluntary donors responding to verified requests and mark cases Fulfilled
                  after cross-matching.
                </p>
              </div>

              {coordinationQueue.length === 0 ? (
                <Surface className="p-6">
                  <EmptyState
                    title="No active donor coordination cases"
                    description="Verify a pending request first to start coordinating voluntary donors."
                    actionLabel="Check incoming verification queue"
                    onAction={() => setActiveTab('requests')}
                  />
                </Surface>
              ) : (
                <div className="space-y-5">
                  {coordinationQueue.map((req) => {
                    const compatibleGroups = getCompatibleDonorGroups(req.bloodGroup);
                    const matchingDistrictDonors = donors.filter(
                      (d) =>
                        d.district === hospital.district &&
                        compatibleGroups.includes(d.bloodGroup) &&
                        !d.notificationsPaused
                    );

                    return (
                      <Surface key={req.id} className="divide-y divide-border/60 p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4 pb-4">
                          <div>
                            <p className="font-mono text-xs text-primary">{req.id}</p>
                            <h3 className="mt-0.5 text-base font-semibold text-foreground">
                              {req.unitsRequired} unit(s) {req.bloodGroup} · Patient:{' '}
                              {req.patientName}
                            </h3>
                            <p className="mt-1 text-xs text-muted">
                              {req.hospitalVerificationNote}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusText status={req.status} />
                            <Button
                              tone="quiet"
                              size="sm"
                              disabled={!isHospitalVerified}
                              onClick={() =>
                                handleStatusDecision(req, 'Donor Coordination')
                              }
                            >
                              Set Donor Coordination
                            </Button>
                            <Button
                              tone="success"
                              size="sm"
                              disabled={!isHospitalVerified}
                              onClick={() => handleStatusDecision(req, 'Fulfilled')}
                            >
                              Mark Fulfilled
                            </Button>
                          </div>
                        </div>

                        <div className="pt-4">
                          <p className="text-xs font-medium text-muted">
                            Compatible active donors in {hospital.district} (
                            {matchingDistrictDonors.length}) · Pledged responses:{' '}
                            {(req.pledgedDonors || []).length}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {matchingDistrictDonors.map((d) => {
                              const pledged = (req.pledgedDonors || []).includes(d.id);
                              return (
                                <span
                                  key={d.id}
                                  className="text-xs text-foreground"
                                >
                                  {formatPublicDonorName(d.fullName, d.publicDisplayMode)} (
                                  <strong className="text-primary">{d.bloodGroup}</strong>
                                  {pledged ? ' · Confirmed visit' : ` · ${d.availabilityPreference}`}
                                  ) ·
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </Surface>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <Surface className="divide-y divide-border/60 p-6">
              <div className="pb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Hospital blood request history
                </h2>
                <p className="text-sm text-muted">
                  Fulfilled, cancelled, and rejected requisitions for {hospital.hospitalName}
                </p>
              </div>

              {historicalQueue.length === 0 ? (
                <EmptyState
                  title="No closed requests recorded yet"
                  description="Fulfilled or rejected requests for this institution appear here."
                />
              ) : (
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border/70 text-xs font-semibold tracking-wider text-muted uppercase">
                        <th className="py-3 pr-4">Request ID</th>
                        <th className="py-3 pr-4">Patient / Requester</th>
                        <th className="py-3 pr-4">Group & Units</th>
                        <th className="py-3 pr-4">Required Date</th>
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3">Verification Log</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {historicalQueue.map((r) => (
                        <tr key={r.id}>
                          <td className="py-3.5 pr-4 font-mono text-xs text-foreground">
                            {r.id}
                          </td>
                          <td className="py-3.5 pr-4 font-medium text-foreground">
                            {r.patientName || r.requesterName}
                          </td>
                          <td className="py-3.5 pr-4 tabular-nums text-foreground">
                            <strong className="text-primary">{r.bloodGroup}</strong> ·{' '}
                            {r.unitsRequired}u
                          </td>
                          <td className="py-3.5 pr-4 whitespace-nowrap tabular-nums text-muted">
                            {formatDisplayDate(r.requiredDate)}
                          </td>
                          <td className="py-3.5 pr-4">
                            <StatusText status={r.status} />
                          </td>
                          <td className="max-w-xs py-3.5 text-xs text-muted">
                            {r.hospitalVerificationNote}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Surface>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <Surface className="divide-y divide-border/60 p-6">
                <div className="pb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Indicative blood unit stock controls (Demo inventory)
                  </h2>
                  <p className="text-sm text-muted">
                    Adjust indicative packed red-cell unit counts across ABO/Rh groups for{' '}
                    {hospital.hospitalName}.
                  </p>
                </div>

                <div className="grid grid-cols-2 divide-x divide-y divide-border/50 pt-5 sm:grid-cols-4 lg:grid-cols-8 lg:divide-y-0">
                  {BLOOD_GROUPS.map((group) => {
                    const count = Number(hospital.availableBloodUnits?.[group] || 0);
                    return (
                      <div key={group} className="space-y-2 p-3 text-center">
                        <BloodGroupMark group={group} />
                        <p className="text-xl font-bold tabular-nums text-foreground">{count}</p>
                        <div className="flex justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(group, -1)}
                            aria-label={`Decrease ${group} units`}
                            className="min-h-8 min-w-8 rounded-control border border-border text-sm font-semibold hover:bg-background"
                          >
                            −
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(group, 1)}
                            aria-label={`Increase ${group} units`}
                            className="min-h-8 min-w-8 rounded-control border border-border text-sm font-semibold hover:bg-background"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Surface>

              <Surface className="p-6">
                <h3 className="text-base font-semibold text-foreground">
                  ABO/Rh blood bank stock profile
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  Available demonstration units by blood group at {hospital.hospitalName}
                </p>
                <div className="mt-4 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockChartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="group" tick={{ fontSize: 12, fill: '#4B5563' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#4B5563' }} domain={[0, 'auto']} />
                      <Tooltip />
                      <Bar dataKey="units" name="Available Units" fill="#DC2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Surface>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <Surface className="divide-y divide-border/60 p-6 lg:col-span-7">
                <div className="pb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Transfusion desk staff roster
                  </h2>
                  <p className="text-sm text-muted">
                    Authorized hospital officers for blood request verification (Demo roster)
                  </p>
                </div>

                {(hospital.staff || []).length === 0 ? (
                  <EmptyState
                    title="No staff members assigned"
                    description="Add an authorized medical officer or technologist using the form."
                  />
                ) : (
                  <div className="divide-y divide-border/50">
                    {hospital.staff.map((member) => (
                      <div
                        key={member.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-4"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{member.name}</p>
                          <p className="text-xs text-muted">
                            {member.role} · {member.shift}
                          </p>
                          <p className="text-xs text-subtle">{member.email}</p>
                        </div>
                        <Button
                          tone="danger"
                          size="sm"
                          onClick={() => setStaffToRemove(member)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Surface>

              <Surface className="p-6 lg:col-span-5">
                <h3 className="text-base font-semibold text-foreground">
                  Add transfusion staff member
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Assign a clinical officer or lab technologist to verify inpatient requisitions.
                </p>

                <form onSubmit={handleAddStaff} className="mt-4 space-y-4 border-t border-border/60 pt-4">
                  <Field
                    label="Staff full name"
                    required
                    placeholder="e.g. Dr. Manisha Shrestha"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm((p) => ({ ...p, name: e.target.value }))}
                  />
                  <SelectField
                    label="Clinical role"
                    options={[
                      'Chief Transfusion Officer',
                      'Hematology Verification Lead',
                      'Blood Bank Technologist',
                      'Emergency Ward Coordinator',
                    ]}
                    value={staffForm.role}
                    onChange={(e) => setStaffForm((p) => ({ ...p, role: e.target.value }))}
                  />
                  <Field
                    label="Institutional email"
                    type="email"
                    required
                    placeholder="officer@hospital.demo.np"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm((p) => ({ ...p, email: e.target.value }))}
                  />
                  <SelectField
                    label="Assigned shift"
                    options={[
                      'Day Shift (08:00–16:00)',
                      'Evening Shift (16:00–00:00)',
                      'Night Emergency Desk',
                      'Morning & Escalation',
                    ]}
                    value={staffForm.shift}
                    onChange={(e) => setStaffForm((p) => ({ ...p, shift: e.target.value }))}
                  />
                  <Button type="submit" className="w-full">
                    Add staff member
                  </Button>
                </form>
              </Surface>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
