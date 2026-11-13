import { useNavigate } from 'react-router-dom';
import { Button, Surface } from '../../components/common/ui';
import { REQUEST_STATUSES } from '../../data/requests';

const LIFECYCLE_DESCRIPTIONS = {
  Pending: 'Submitted by patient or family attendant; queued for hospital blood bank review.',
  'Under Verification': 'Hospital blood bank officer is checking ward admission and requisition slip.',
  Verified: 'Inpatient clinical need confirmed; compatible voluntary donors in the district notified.',
  'Donor Coordination': 'One or more voluntary donors confirmed readiness to visit the hospital desk.',
  Fulfilled: 'Required blood units cross-matched and issued for patient care.',
  Cancelled: 'Closed by requester (for example, when hospital internal inventory covered the need).',
  Rejected: 'Declined by hospital desk due to missing inpatient admission or invalid requisition.',
};

export default function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-[90rem] space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-display text-foreground">How BLOODBRIDGE works</h1>
        <p className="mt-2 max-w-3xl text-base text-muted">
          From inpatient blood requisition to safe in-person hospital donation, every step keeps
          clinical verification with licensed healthcare institutions and privacy control with
          voluntary donors.
        </p>
      </div>

      {/* Role-by-role operational steps */}
      <Surface className="divide-y divide-border/60">
        {[
          {
            step: 'Stage 1 · Voluntary Donor Onboarding',
            heading: 'Donors register location & availability preferences',
            detail:
              'Donors choose their blood group, province, district, and municipality, set their preferred contact channel, and opt into verified request notifications. BLOODBRIDGE does not evaluate medical eligibility online—clinical screening always takes place in person at the hospital or blood bank.',
          },
          {
            step: 'Stage 2 · Structured Inpatient Request',
            heading: 'Families submit ward-linked blood requests',
            detail:
              'When a hospital blood bank requires replacement or rare-group donors, the patient attendant submits the blood group, units required (1–10), date needed, treating hospital, and requisition details.',
          },
          {
            step: 'Stage 3 · Hospital Transfusion Desk Verification',
            heading: 'Authorized hospital staff verify clinical authenticity',
            detail:
              'The treating hospital’s blood bank desk reviews the submission against ward records and marks the request Verified, Under Verification, or Rejected.',
          },
          {
            step: 'Stage 4 · Privacy-Protected Coordination & Screening',
            heading: 'Compatible donors visit the hospital desk for screening',
            detail:
              'Matching voluntary donors confirm readiness via their workspace and report directly to the hospital transfusion counter for hemoglobin testing, vitals check, cross-matching, and donation.',
          },
        ].map((stage) => (
          <div key={stage.step} className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="font-mono text-xs font-medium text-primary">{stage.step}</p>
              <h2 className="mt-1 text-base font-semibold text-foreground">{stage.heading}</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted lg:col-span-8">{stage.detail}</p>
          </div>
        ))}
      </Surface>

      {/* Request status dictionary */}
      <Surface className="divide-y divide-border/60 p-6">
        <div className="pb-4">
          <h2 className="text-title text-foreground">Seven-status blood request lifecycle</h2>
          <p className="mt-1 text-sm text-muted">
            Every blood request displays a transparent status across Requester, Donor, Hospital, and
            Administrator dashboards.
          </p>
        </div>

        <div className="divide-y divide-border/50">
          {REQUEST_STATUSES.map((st) => (
            <div
              key={st}
              className="flex flex-col justify-between gap-1 py-3.5 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span className="w-48 shrink-0 text-sm font-semibold text-foreground">{st}</span>
              <span className="flex-1 text-sm text-muted">{LIFECYCLE_DESCRIPTIONS[st]}</span>
            </div>
          ))}
        </div>
      </Surface>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-4">
        <p className="text-sm text-muted">
          Ready to explore the live demonstration workspaces across all four roles?
        </p>
        <div className="flex flex-wrap gap-3">
          <Button tone="quiet" onClick={() => navigate('/login')}>
            Try demo role workspaces
          </Button>
          <Button onClick={() => navigate('/find-donors')}>Browse donor directory</Button>
        </div>
      </div>
    </div>
  );
}
