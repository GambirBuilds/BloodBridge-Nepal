import { useState } from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import {
  BloodGroupMark,
  Button,
  ConfirmDialog,
  EmptyState,
  StatusText,
  Surface,
} from '../../components/common/ui';
import StatStrip from '../../components/dashboard/StatStrip';
import BloodRequestForm from '../../components/forms/BloodRequestForm';
import RequestCard from '../../components/requests/RequestCard';
import RequestStatusTimeline from '../../components/requests/RequestStatusTimeline';
import { REQUEST_STATUSES } from '../../data/requests';
import { useAuth } from '../../hooks/useAuth';
import { usePlatformData } from '../../hooks/usePlatformData';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { formatDisplayDate } from '../../utils/formatters';

const CANCELLABLE_STATUSES = ['Pending', 'Under Verification', 'Verified'];

export default function RequesterDashboard() {
  const { currentUser } = useAuth();
  const {
    requests,
    notifications,
    createBloodRequest,
    updateBloodRequestStatus,
    markNotificationRead,
    markAllNotificationsRead,
  } = usePlatformData();
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRequestId, setSelectedRequestId] = useState(requests[0]?.id || '');
  const [cancelTarget, setCancelTarget] = useState(null);

  const myRequests = requests.filter(
    (r) =>
      r.requesterId === currentUser?.id ||
      r.requesterName.toLowerCase() === (currentUser?.name || '').toLowerCase() ||
      currentUser?.id === 'USR-REQ-01'
  );

  const visibleRequests =
    statusFilter === 'All'
      ? myRequests
      : myRequests.filter((r) => r.status === statusFilter);

  const activeTrackedRequest =
    requests.find((r) => r.id === selectedRequestId) || myRequests[0] || requests[0];

  const requesterNotifications = notifications.filter((n) => n.targetRole === 'requester');

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    await updateBloodRequestStatus(
      cancelTarget.id,
      'Cancelled',
      `Cancelled by requester ${currentUser?.name || cancelTarget.requesterName} via Requester Workspace.`,
      currentUser?.name || 'Requester'
    );
    showToast({
      tone: 'success',
      title: `Request ${cancelTarget.id} cancelled`,
      description: 'Hospital desk and donor alert queue updated (Demo Mode).',
    });
    setCancelTarget(null);
  };

  return (
    <DashboardLayout
      role="requester"
      title="Patient & requester workspace"
      subtitle={`Coordination tracking for ${currentUser?.name || 'Ramesh Adhikari'}`}
    >
      {({ activeTab, setActiveTab }) => (
        <div className="space-y-6">
          <ConfirmDialog
            open={Boolean(cancelTarget)}
            title={`Cancel blood request ${cancelTarget?.id}?`}
            description="Cancelling stops hospital verification and voluntary donor outreach for this request. You can submit a new request anytime if clinical needs change."
            confirmLabel="Cancel blood request"
            cancelLabel="Keep request active"
            onConfirm={handleConfirmCancel}
            onClose={() => setCancelTarget(null)}
          />

          {activeTab === 'overview' && (
            <>
              <StatStrip
                leadMetric={{
                  label: 'Submitted blood requests',
                  value: myRequests.length,
                  caption: 'Tracked across inpatient verification stages (Demo records)',
                }}
                secondaryMetrics={[
                  {
                    label: 'Hospital verified',
                    value: myRequests.filter((r) =>
                      ['Verified', 'Donor Coordination'].includes(r.status)
                    ).length,
                    highlight: true,
                    caption: 'Outreach active',
                  },
                  {
                    label: 'Awaiting hospital check',
                    value: myRequests.filter((r) =>
                      ['Pending', 'Under Verification'].includes(r.status)
                    ).length,
                    caption: 'In hospital queue',
                  },
                  {
                    label: 'Fulfilled',
                    value: myRequests.filter((r) => r.status === 'Fulfilled').length,
                    caption: 'Completed units',
                  },
                  {
                    label: 'Unread updates',
                    value: requesterNotifications.filter((n) => !n.read).length,
                    caption: 'Status notifications',
                  },
                ]}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {['All', ...REQUEST_STATUSES].map((st) => {
                    const active = statusFilter === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`min-h-9 rounded-control border px-3 text-xs font-medium transition-colors ${
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-surface text-foreground hover:bg-background'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>

                <Button size="sm" onClick={() => setActiveTab('new')}>
                  <Plus className="h-4 w-4" />
                  Submit new request
                </Button>
              </div>

              {visibleRequests.length === 0 ? (
                <Surface className="p-6">
                  <EmptyState
                    title="No requests in this status filter"
                    description="Switch back to All statuses or submit a new inpatient blood request."
                    actionLabel="Show all requests"
                    onAction={() => setStatusFilter('All')}
                  />
                </Surface>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {visibleRequests.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      onSelectRequest={(r) => {
                        setSelectedRequestId(r.id);
                        setActiveTab('track');
                      }}
                      secondaryActionLabel={
                        CANCELLABLE_STATUSES.includes(req.status)
                          ? 'Cancel request'
                          : undefined
                      }
                      onSecondaryAction={
                        CANCELLABLE_STATUSES.includes(req.status)
                          ? (r) => setCancelTarget(r)
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'new' && (
            <Surface className="p-6 sm:p-8">
              <div className="mb-6 border-b border-border/60 pb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Submit new hospital blood request
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Enter patient blood group, units required, and treating hospital details for
                  verification.
                </p>
              </div>
              <BloodRequestForm
                defaultRequesterName={currentUser?.name || 'Ramesh Adhikari'}
                defaultPhone={currentUser?.phone || '+977 9851023456'}
                onSuccess={async (values) => {
                  const created = await createBloodRequest(values, currentUser?.id || 'USR-REQ-01');
                  setSelectedRequestId(created.id);
                  showToast({
                    tone: 'success',
                    title: `Submitted request ${created.id}`,
                    description: 'Queued for hospital blood bank verification (Demo Mode).',
                  });
                  setActiveTab('track');
                }}
              />
            </Surface>
          )}

          {activeTab === 'track' && activeTrackedRequest && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted">Select request to inspect:</span>
                {myRequests.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRequestId(r.id)}
                    className={`min-h-9 rounded-control border px-3 font-mono text-xs font-medium ${
                      activeTrackedRequest.id === r.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-surface text-foreground hover:bg-background'
                    }`}
                  >
                    {r.id} ({r.bloodGroup})
                  </button>
                ))}
              </div>

              <Surface className="divide-y divide-border/60 p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
                  <div>
                    <p className="font-mono text-xs font-medium text-primary">
                      {activeTrackedRequest.id} · Created {formatDisplayDate(activeTrackedRequest.createdAt)}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-foreground">
                      {activeTrackedRequest.unitsRequired} unit(s) {activeTrackedRequest.bloodGroup} ·{' '}
                      {activeTrackedRequest.hospitalName}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Patient: {activeTrackedRequest.patientName || activeTrackedRequest.requesterName} ·
                      Required by {formatDisplayDate(activeTrackedRequest.requiredDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusText status={activeTrackedRequest.status} />
                    <BloodGroupMark group={activeTrackedRequest.bloodGroup} size="lg" />
                  </div>
                </div>

                <div className="py-5">
                  <RequestStatusTimeline
                    status={activeTrackedRequest.status}
                    verificationNote={activeTrackedRequest.hospitalVerificationNote}
                  />
                </div>

                <dl className="grid grid-cols-1 gap-4 py-5 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted">Hospital location</dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {activeTrackedRequest.municipality}, {activeTrackedRequest.district}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Urgency tier</dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {activeTrackedRequest.urgency}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Voluntary donor responses</dt>
                    <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                      {(activeTrackedRequest.pledgedDonors || []).length} donor(s) coordinated
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-5">
                  <p className="max-w-xl text-sm text-muted">
                    <strong className="text-foreground">Ward context: </strong>
                    {activeTrackedRequest.requestDetails}
                  </p>
                  {CANCELLABLE_STATUSES.includes(activeTrackedRequest.status) && (
                    <Button
                      tone="danger"
                      size="sm"
                      onClick={() => setCancelTarget(activeTrackedRequest)}
                    >
                      Cancel this request
                    </Button>
                  )}
                </div>
              </Surface>
            </div>
          )}

          {activeTab === 'notifications' && (
            <Surface className="divide-y divide-border/60 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Notification history</h2>
                  <p className="text-sm text-muted">
                    Hospital verification logs and donor coordination updates
                  </p>
                </div>
                <Button
                  tone="quiet"
                  size="sm"
                  onClick={() => markAllNotificationsRead('requester')}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark all read
                </Button>
              </div>

              <div className="divide-y divide-border/50">
                {requesterNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex flex-wrap items-start justify-between gap-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      <p className="mt-1 text-sm text-muted">{n.message}</p>
                      <p className="mt-1 text-xs text-subtle">
                        {n.category} · {n.createdAt}
                      </p>
                    </div>
                    {!n.read && (
                      <Button
                        tone="quiet"
                        size="sm"
                        onClick={() => markNotificationRead(n.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Surface>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
