import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import {
  BloodGroupMark,
  Button,
  EmptyState,
  SelectField,
  StatusText,
  Surface,
} from '../../components/common/ui';
import BloodRequestForm from '../../components/forms/BloodRequestForm';
import ReportDialog from '../../components/common/ReportDialog';
import RequestCard from '../../components/requests/RequestCard';
import RequestStatusTimeline from '../../components/requests/RequestStatusTimeline';
import { getProvinceNames } from '../../data/locations';
import { REQUEST_STATUSES } from '../../data/requests';
import { useAuth } from '../../hooks/useAuth';
import { usePagination } from '../../hooks/usePagination';
import { usePlatformData } from '../../hooks/usePlatformData';
import { useToast } from '../../hooks/useToast';
import { BLOOD_GROUPS, getCompatibleDonorGroups } from '../../utils/bloodCompatibility';
import { formatDisplayDate } from '../../utils/formatters';

export default function BloodRequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { requests, createBloodRequest, pledgeDonorToRequest, donors } = usePlatformData();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [reportingTarget, setReportingTarget] = useState(null);
  const [showSubmitPanel, setShowSubmitPanel] = useState(
    searchParams.get('submit') === '1'
  );
  const [bloodGroupFilter, setBloodGroupFilter] = useState(
    searchParams.get('bloodGroup') || ''
  );
  const [statusFilter, setStatusFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState(
    searchParams.get('province') || ''
  );
  const [selectedRequest, setSelectedRequest] = useState(() => {
    const highlightId = searchParams.get('highlight');
    return requests.find((r) => r.id === highlightId) || null;
  });

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (bloodGroupFilter && req.bloodGroup !== bloodGroupFilter) return false;
      if (statusFilter && req.status !== statusFilter) return false;
      if (provinceFilter && req.province !== provinceFilter) return false;
      return true;
    });
  }, [requests, bloodGroupFilter, statusFilter, provinceFilter]);

  const {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    setCurrentPage,
  } = usePagination(filteredRequests, 6);

  const handleCreateRequest = async (values) => {
    const created = await createBloodRequest(
      values,
      currentUser?.role === 'requester' ? currentUser.id : 'USR-REQ-01'
    );
    setShowSubmitPanel(false);
    setSelectedRequest(created);
    setSearchParams({});
    showToast({
      tone: 'success',
      title: `Blood request ${created.id} submitted`,
      description: 'Sent to hospital blood bank desk queue for ward verification (Demo Mode).',
    });
  };

  const handleDonorPledge = async (req) => {
    const donorRecord =
      donors.find((d) => d.id === currentUser?.linkedRecordId) || donors[0];
    await pledgeDonorToRequest(req.id, donorRecord.id, donorRecord.fullName);
    showToast({
      tone: 'success',
      title: `Readiness sent to ${req.hospitalName}`,
      description: `Hospital transfusion desk notified for ${req.id} (Demo Mode).`,
    });
  };

  return (
    <div className="mx-auto max-w-[90rem] space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display text-foreground">Hospital blood requests</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Browse active demonstration blood requests across Nepal or submit a hospital blood
            request for requisition verification and compatible donor outreach.
          </p>
        </div>

        <Button onClick={() => setShowSubmitPanel((v) => !v)}>
          {showSubmitPanel ? (
            <>
              <X className="h-4 w-4" />
              Close request form
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Submit blood request
            </>
          )}
        </Button>
      </div>

      {showSubmitPanel && (
        <Surface className="p-6 sm:p-8">
          <div className="mb-6 border-b border-border/60 pb-4">
            <h2 className="text-lg font-semibold text-foreground">
              New inpatient blood request submission
            </h2>
            <p className="mt-1 text-sm text-muted">
              Provide accurate ward and treating hospital details so the hospital blood bank desk
              can verify your requisition promptly.
            </p>
          </div>
          <BloodRequestForm
            defaultBloodGroup={bloodGroupFilter || 'O+'}
            defaultRequesterName={currentUser?.name || ''}
            defaultPhone={currentUser?.phone || '+977 '}
            onSuccess={handleCreateRequest}
          />
        </Surface>
      )}

      {/* Selected Request Inspection Drawer / Panel */}
      {selectedRequest && (
        <Surface className="divide-y divide-border/60 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="font-mono font-medium text-foreground">
                  {selectedRequest.id}
                </span>
                <span>·</span>
                <span>{selectedRequest.urgency}</span>
                <span>·</span>
                <span>Required {formatDisplayDate(selectedRequest.requiredDate)}</span>
              </div>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                {selectedRequest.unitsRequired} unit(s) {selectedRequest.bloodGroup} at{' '}
                {selectedRequest.hospitalName}
              </h2>
              <p className="mt-1 text-sm text-muted">{selectedRequest.requestDetails}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusText status={selectedRequest.status} />
              <BloodGroupMark group={selectedRequest.bloodGroup} size="lg" />
              <Button tone="quiet" size="sm" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </div>
          </div>

          <div className="py-4">
            <RequestStatusTimeline
              status={selectedRequest.status}
              verificationNote={selectedRequest.hospitalVerificationNote}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs text-muted">
            <span>
              Compatible donor groups:{' '}
              <strong className="text-foreground">
                {getCompatibleDonorGroups(selectedRequest.bloodGroup).join(', ')}
              </strong>
            </span>
            {['Verified', 'Donor Coordination'].includes(selectedRequest.status) && (
              <Button size="sm" onClick={() => handleDonorPledge(selectedRequest)}>
                Volunteer to visit hospital desk (Demo)
              </Button>
            )}
            <Button
              tone="ghost"
              size="sm"
              onClick={() => setReportingTarget(selectedRequest)}
            >
              Report suspicious details
            </Button>
          </div>
        </Surface>
      )}

      <ReportDialog
        open={Boolean(reportingTarget)}
        onClose={() => setReportingTarget(null)}
        targetType="BLOOD_REQUEST"
        targetId={reportingTarget?.id}
        targetTitle={`${reportingTarget?.patientName} at ${reportingTarget?.hospitalName}`}
        onReportSubmitted={() => {
          showToast({
            tone: 'success',
            title: 'Report submitted for review',
            description: 'Platform administrators and hospital coordinators will investigate.',
          });
        }}
      />

      {/* Filters */}
      <Surface className="p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <SelectField
            label="Blood group"
            value={bloodGroupFilter}
            onChange={(e) => {
              setBloodGroupFilter(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="All blood groups"
            options={BLOOD_GROUPS}
          />
          <SelectField
            label="Verification status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="All workflow statuses"
            options={REQUEST_STATUSES}
          />
          <SelectField
            label="Province"
            value={provinceFilter}
            onChange={(e) => {
              setProvinceFilter(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="All 7 provinces"
            options={getProvinceNames()}
          />
          <div className="flex items-end">
            <Button
              tone="quiet"
              className="w-full"
              onClick={() => {
                setBloodGroupFilter('');
                setStatusFilter('');
                setProvinceFilter('');
                setCurrentPage(1);
              }}
            >
              Reset filters
            </Button>
          </div>
        </div>
      </Surface>

      {paginatedItems.length === 0 ? (
        <Surface className="p-6">
          <EmptyState
            title="No blood requests match the selected criteria"
            description="Reset filters to view all active and historical demonstration blood requests."
            actionLabel="Show all requests"
            onAction={() => {
              setBloodGroupFilter('');
              setStatusFilter('');
              setProvinceFilter('');
            }}
          />
        </Surface>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onSelectRequest={(r) => setSelectedRequest(r)}
                primaryActionLabel={
                  ['Verified', 'Donor Coordination'].includes(req.status)
                    ? 'Offer donor response'
                    : undefined
                }
                onPrimaryAction={
                  ['Verified', 'Donor Coordination'].includes(req.status)
                    ? handleDonorPledge
                    : undefined
                }
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
