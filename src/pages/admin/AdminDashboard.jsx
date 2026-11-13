import { useState } from 'react';
import { Download, RotateCcw, Search } from 'lucide-react';
import {
  Button,
  ConfirmDialog,
  Field,
  SelectField,
  StatusText,
  Surface,
  Switch,
} from '../../components/common/ui';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import {
  BloodGroupDistributionChart,
  MonthlyRequestTrendsChart,
  RegionalActivityChart,
} from '../../components/dashboard/ChartsPanel';
import StatStrip from '../../components/dashboard/StatStrip';
import { REQUEST_STATUSES } from '../../data/requests';
import {
  BLOOD_GROUP_DISTRIBUTION,
  MONTHLY_REQUEST_TRENDS,
  PROVINCIAL_ACTIVITY_SERIES,
} from '../../data/statistics';
import { useAuth } from '../../hooks/useAuth';
import { usePlatformData } from '../../hooks/usePlatformData';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { formatCount, formatDisplayDate } from '../../utils/formatters';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const {
    donors,
    requests,
    hospitals,
    users,
    activities,
    platformSettings,
    updateHospitalVerification,
    updateBloodRequestStatus,
    toggleUserStatus,
    savePlatformSettings,
    resetDemonstrationData,
  } = usePlatformData();
  const { showToast } = useToast();

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [donorSearch, setDonorSearch] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState({});
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const activeDonorsCount = donors.filter(
    (d) => !d.notificationsPaused && d.availabilityPreference !== 'Temporarily Paused'
  ).length;
  const verifiedRequestsCount = requests.filter((r) =>
    ['Verified', 'Donor Coordination', 'Fulfilled'].includes(r.status)
  ).length;
  const pendingRequestsCount = requests.filter((r) =>
    ['Pending', 'Under Verification'].includes(r.status)
  ).length;
  const verifiedHospitalsCount = hospitals.filter(
    (h) => h.verificationStatus === 'Verified'
  ).length;
  const pendingHospitalsCount = hospitals.filter(
    (h) => h.verificationStatus === 'Pending'
  ).length;

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.trim().toLowerCase();
      return `${u.name} ${u.email} ${u.district}`.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredDonors = donors.filter((d) => {
    if (!donorSearch.trim()) return true;
    const q = donorSearch.trim().toLowerCase();
    return `${d.fullName} ${d.bloodGroup} ${d.district} ${d.province}`
      .toLowerCase()
      .includes(q);
  });

  const handleExportSummaryCsv = () => {
    const header = 'Province,Demo Donors,Demo Requests,Demo Hospitals\n';
    const rows = PROVINCIAL_ACTIVITY_SERIES.map(
      (r) => `${r.province},${r.donors},${r.requests},${r.hospitals}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bloodbridge-nepal-demo-summary.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast({
      tone: 'success',
      title: 'Provincial CSV report downloaded',
      description: 'Exported demonstration regional metrics.',
    });
  };

  return (
    <DashboardLayout
      role="admin"
      title="Platform administration console"
      subtitle={`National oversight across 7 provinces · ${currentUser?.name || 'Aarav Khadka'}`}
      primaryAction={
        <Button tone="quiet" size="sm" onClick={handleExportSummaryCsv}>
          <Download className="h-4 w-4" />
          Export CSV report
        </Button>
      }
    >
      {({ activeTab, setActiveTab }) => (
        <div className="space-y-6">
          <ConfirmDialog
            open={confirmResetOpen}
            title="Reset all demonstration data to initial seed?"
            description="This clears local preview registrations, blood requests, and status edits, restoring the original Nepalese demonstration dataset."
            confirmLabel="Reset demo dataset"
            onConfirm={() => {
              resetDemonstrationData();
              showToast({
                tone: 'success',
                title: 'Demonstration dataset restored',
              });
            }}
            onClose={() => setConfirmResetOpen(false)}
          />

          {activeTab === 'overview' && (
            <>
              <StatStrip
                leadMetric={{
                  label: 'Total registered donors (Demo)',
                  value: donors.length,
                  caption: `${activeDonorsCount} active for notifications · ${
                    donors.length - activeDonorsCount
                  } paused`,
                }}
                secondaryMetrics={[
                  {
                    label: 'Total requests',
                    value: requests.length,
                    caption: `${verifiedRequestsCount} verified · ${pendingRequestsCount} pending`,
                  },
                  {
                    label: 'Pending requests',
                    value: pendingRequestsCount,
                    highlight: pendingRequestsCount > 0,
                    caption: 'Awaiting hospital desk',
                  },
                  {
                    label: 'Verified hospitals',
                    value: verifiedHospitalsCount,
                    caption: `Of ${hospitals.length} total institutions`,
                  },
                  {
                    label: 'Pending hospital review',
                    value: pendingHospitalsCount,
                    highlight: pendingHospitalsCount > 0,
                    caption: 'Permit verification queue',
                  },
                ]}
              />

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <BloodGroupDistributionChart data={BLOOD_GROUP_DISTRIBUTION} />
                <MonthlyRequestTrendsChart data={MONTHLY_REQUEST_TRENDS} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <RegionalActivityChart data={PROVINCIAL_ACTIVITY_SERIES} />
                </div>
                <div className="lg:col-span-5">
                  <ActivityFeed activities={activities} />
                </div>
              </div>
            </>
          )}

          {activeTab === 'verifications' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Hospital & blood bank verification queue
                </h2>
                <p className="text-sm text-muted">
                  Review MoHP / NPHL permit references before granting blood request verification
                  privileges.
                </p>
              </div>

              <div className="space-y-4">
                {hospitals.map((h) => (
                  <Surface key={h.id} className="divide-y divide-border/60 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-4">
                      <div>
                        <p className="font-mono text-xs text-muted">
                          {h.id} · Reg: {h.registrationNumber} · Permit: {h.verificationDocReference}
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-foreground">
                          {h.hospitalName}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted">
                          {h.institutionType} · {h.municipality}, {h.district}, {h.province}
                        </p>
                        <p className="mt-1 text-xs text-subtle">
                          Focal person: {h.authorizedRepresentative} ({h.representativeDesignation}) ·{' '}
                          {h.officialEmail}
                        </p>
                      </div>
                      <StatusText status={h.verificationStatus} />
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-3 pt-4">
                      <Field
                        label="Compliance / rejection note (if declining)"
                        placeholder="Reason if rejecting credentials..."
                        className="flex-1"
                        value={rejectionNotes[h.id] || ''}
                        onChange={(e) =>
                          setRejectionNotes((p) => ({ ...p, [h.id]: e.target.value }))
                        }
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          tone="quiet"
                          size="sm"
                          onClick={() => {
                            updateHospitalVerification(
                              h.id,
                              'Pending',
                              '',
                              currentUser?.name || 'Admin'
                            );
                            showToast({ title: `${h.hospitalName} moved to Pending` });
                          }}
                        >
                          Set Pending
                        </Button>
                        <Button
                          tone="danger"
                          size="sm"
                          onClick={() => {
                            updateHospitalVerification(
                              h.id,
                              'Rejected',
                              rejectionNotes[h.id] ||
                                'Permit calibration documentation incomplete.',
                              currentUser?.name || 'Admin'
                            );
                            showToast({ title: `${h.hospitalName} marked Rejected` });
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          tone="success"
                          size="sm"
                          onClick={() => {
                            updateHospitalVerification(
                              h.id,
                              'Verified',
                              '',
                              currentUser?.name || 'Admin'
                            );
                            showToast({
                              tone: 'success',
                              title: `${h.hospitalName} verified`,
                            });
                          }}
                        >
                          Verify institution
                        </Button>
                      </div>
                    </div>
                  </Surface>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hospitals' && (
            <Surface className="divide-y divide-border/60 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Hospital management</h2>
                  <p className="text-sm text-muted">
                    All {hospitals.length} demonstration healthcare institutions across Nepal
                  </p>
                </div>
                <Button tone="quiet" size="sm" onClick={() => setActiveTab('verifications')}>
                  Open permit queue ({pendingHospitalsCount} pending)
                </Button>
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-xs font-semibold tracking-wider text-muted uppercase">
                      <th className="py-3 pr-4">Institution</th>
                      <th className="py-3 pr-4">District & Province</th>
                      <th className="py-3 pr-4">Focal Officer</th>
                      <th className="py-3 pr-4">Permit Ref</th>
                      <th className="py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {hospitals.map((h) => (
                      <tr key={h.id}>
                        <td className="py-3.5 pr-4 font-medium text-foreground">
                          {h.hospitalName}
                        </td>
                        <td className="py-3.5 pr-4 text-muted">
                          {h.district}, {h.province.replace(' Province', '')}
                        </td>
                        <td className="py-3.5 pr-4 text-muted">{h.authorizedRepresentative}</td>
                        <td className="py-3.5 pr-4 font-mono text-xs text-subtle">
                          {h.verificationDocReference}
                        </td>
                        <td className="py-3.5">
                          <StatusText status={h.verificationStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Surface>
          )}

          {activeTab === 'requests' && (
            <Surface className="divide-y divide-border/60 p-6">
              <div className="pb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  National blood request governance
                </h2>
                <p className="text-sm text-muted">
                  Inspect and audit all {requests.length} demonstration blood requests
                </p>
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-xs font-semibold tracking-wider text-muted uppercase">
                      <th className="py-3 pr-4">ID</th>
                      <th className="py-3 pr-4">Requester</th>
                      <th className="py-3 pr-4">Group</th>
                      <th className="py-3 pr-4">Hospital & District</th>
                      <th className="py-3 pr-4">Required</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 text-right">Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td className="py-3.5 pr-4 font-mono text-xs text-foreground">{r.id}</td>
                        <td className="py-3.5 pr-4 font-medium text-foreground">
                          {r.requesterName}
                        </td>
                        <td className="py-3.5 pr-4 font-semibold tabular-nums text-primary">
                          {r.bloodGroup} ({r.unitsRequired}u)
                        </td>
                        <td className="py-3.5 pr-4 text-muted">
                          {r.hospitalName} · {r.district}
                        </td>
                        <td className="py-3.5 pr-4 whitespace-nowrap tabular-nums text-muted">
                          {formatDisplayDate(r.requiredDate)}
                        </td>
                        <td className="py-3.5 pr-4">
                          <StatusText status={r.status} />
                        </td>
                        <td className="py-3.5 text-right">
                          <select
                            aria-label={`Change status for ${r.id}`}
                            value={r.status}
                            onChange={(e) => {
                              updateBloodRequestStatus(
                                r.id,
                                e.target.value,
                                `Administrative status update by ${currentUser?.name || 'Admin'}.`,
                                currentUser?.name || 'Admin'
                              );
                              showToast({
                                tone: 'success',
                                title: `${r.id} updated to ${e.target.value}`,
                              });
                            }}
                            className="rounded-control border border-border bg-surface px-2.5 py-1 text-xs text-foreground"
                          >
                            {REQUEST_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Surface>
          )}

          {activeTab === 'donors' && (
            <Surface className="divide-y divide-border/60 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Voluntary donor registry ({donors.length})
                  </h2>
                  <p className="text-sm text-muted">
                    Administrative view of demonstration voluntary donors across Nepal
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-subtle" />
                  <input
                    type="search"
                    value={donorSearch}
                    onChange={(e) => setDonorSearch(e.target.value)}
                    placeholder="Filter donors by name, group, district..."
                    className="min-h-10 w-full rounded-control border border-border bg-surface pr-3 pl-9 text-sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-xs font-semibold tracking-wider text-muted uppercase">
                      <th className="py-3 pr-4">ID</th>
                      <th className="py-3 pr-4">Donor Name</th>
                      <th className="py-3 pr-4">Blood Group</th>
                      <th className="py-3 pr-4">Location</th>
                      <th className="py-3 pr-4">Availability</th>
                      <th className="py-3 text-right">Donations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredDonors.map((d) => (
                      <tr key={d.id}>
                        <td className="py-3.5 pr-4 font-mono text-xs text-subtle">{d.id}</td>
                        <td className="py-3.5 pr-4 font-medium text-foreground">{d.fullName}</td>
                        <td className="py-3.5 pr-4 font-semibold tabular-nums text-primary">
                          {d.bloodGroup}
                        </td>
                        <td className="py-3.5 pr-4 text-muted">
                          {d.district}, {d.province.replace(' Province', '')}
                        </td>
                        <td className="py-3.5 pr-4">
                          <StatusText
                            status={
                              d.notificationsPaused
                                ? 'Temporarily Paused'
                                : d.availabilityPreference
                            }
                          />
                        </td>
                        <td className="py-3.5 text-right tabular-nums text-foreground">
                          {d.totalDonationsRecorded || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Surface>
          )}

          {activeTab === 'users' && (
            <Surface className="divide-y divide-border/60 p-6">
              <div className="flex flex-wrap items-end justify-between gap-4 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Role-based user management
                  </h2>
                  <p className="text-sm text-muted">
                    Manage Donor, Requester, Hospital, and Administrator accounts
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Field
                    placeholder="Search user or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  <SelectField
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    placeholder="All roles"
                    options={[
                      { value: 'donor', label: 'Donors' },
                      { value: 'requester', label: 'Requesters' },
                      { value: 'hospital', label: 'Hospitals' },
                      { value: 'admin', label: 'Administrators' },
                    ]}
                  />
                </div>
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-xs font-semibold tracking-wider text-muted uppercase">
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Role</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">District</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3.5 pr-4 font-medium text-foreground">{u.name}</td>
                        <td className="py-3.5 pr-4 text-muted">{u.roleLabel}</td>
                        <td className="py-3.5 pr-4 text-xs text-muted">{u.email}</td>
                        <td className="py-3.5 pr-4 text-muted">{u.district}</td>
                        <td className="py-3.5 pr-4">
                          <StatusText status={u.status} />
                        </td>
                        <td className="py-3.5 text-right">
                          {u.role !== 'admin' && (
                            <Button
                              tone="quiet"
                              size="sm"
                              onClick={() => {
                                toggleUserStatus(u.id);
                                showToast({
                                  title: `Updated account state for ${u.name}`,
                                });
                              }}
                            >
                              {u.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Surface>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <MonthlyRequestTrendsChart data={MONTHLY_REQUEST_TRENDS} />
                <RegionalActivityChart data={PROVINCIAL_ACTIVITY_SERIES} />
              </div>

              <Surface className="divide-y divide-border/60 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Seven-province operational summary (Demonstration figures)
                    </h2>
                    <p className="text-sm text-muted">
                      Aggregated voluntary donor pool, blood requests, and participating desks
                    </p>
                  </div>
                  <Button tone="quiet" size="sm" onClick={handleExportSummaryCsv}>
                    <Download className="h-4 w-4" />
                    Download CSV
                  </Button>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border/70 text-xs font-semibold tracking-wider text-muted uppercase">
                        <th className="py-3 pr-4">Province</th>
                        <th className="py-3 pr-4 text-right">Demo Donors</th>
                        <th className="py-3 pr-4 text-right">Demo Requests</th>
                        <th className="py-3 text-right">Demo Hospitals</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {PROVINCIAL_ACTIVITY_SERIES.map((row) => (
                        <tr key={row.province}>
                          <td className="py-3 pr-4 font-medium text-foreground">
                            {row.province} Province
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums text-foreground">
                            {formatCount(row.donors)}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums text-primary">
                            {formatCount(row.requests)}
                          </td>
                          <td className="py-3 text-right tabular-nums text-muted">
                            {formatCount(row.hospitals)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Surface>
            </div>
          )}

          {activeTab === 'settings' && (
            <Surface className="divide-y divide-border/60 p-6 sm:p-8">
              <div className="pb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Platform governance & demonstration settings
                </h2>
                <p className="text-sm text-muted">
                  Configure national workflow defaults and manage local preview storage.
                </p>
              </div>

              <div className="space-y-5 py-5">
                <Switch
                  checked={Boolean(platformSettings.requireHospitalSlipForCritical)}
                  onChange={(val) => {
                    savePlatformSettings({ requireHospitalSlipForCritical: val });
                    showToast({ tone: 'success', title: 'Governance setting updated' });
                  }}
                  label="Require hospital requisition verification before critical SMS/push outreach"
                  description="Prevents unverified requests from triggering district-wide emergency alerts."
                />

                <Switch
                  checked={Boolean(platformSettings.allowMunicipalityPublicOptIn)}
                  onChange={(val) => {
                    savePlatformSettings({ allowMunicipalityPublicOptIn: val });
                    showToast({ tone: 'success', title: 'Directory privacy rule updated' });
                  }}
                  label="Allow voluntary donors to opt into municipality display on public cards"
                  description="Phone numbers and exact street addresses remain blocked at all times."
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Post-donation rest reminder window (days)"
                    type="number"
                    min={56}
                    max={120}
                    value={platformSettings.donorCooldownReminderDays}
                    onChange={(e) =>
                      savePlatformSettings({
                        donorCooldownReminderDays: Number(e.target.value) || 90,
                      })
                    }
                  />
                  <Field
                    label="Coordination desk hotline display"
                    value={platformSettings.emergencyDeskHotline}
                    onChange={(e) =>
                      savePlatformSettings({ emergencyDeskHotline: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Reset demonstration dataset
                  </p>
                  <p className="text-xs text-muted">
                    Restores all seeded donors, hospitals, blood requests, and notifications to
                    their default Part 1 state.
                  </p>
                </div>
                <Button tone="danger" onClick={() => setConfirmResetOpen(true)}>
                  <RotateCcw className="h-4 w-4" />
                  Reset all demo data
                </Button>
              </div>
            </Surface>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
