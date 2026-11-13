import { Check } from 'lucide-react';

const WORKFLOW_STEPS = [
  'Pending',
  'Under Verification',
  'Verified',
  'Donor Coordination',
  'Fulfilled',
];

export default function RequestStatusTimeline({ status, verificationNote }) {
  const isTerminalNegative = status === 'Cancelled' || status === 'Rejected';
  const currentIndex = WORKFLOW_STEPS.indexOf(status);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
        {WORKFLOW_STEPS.map((step, idx) => {
          const completed = !isTerminalNegative && currentIndex >= idx;
          const isCurrent = !isTerminalNegative && currentIndex === idx;
          return (
            <div
              key={step}
              className={`flex items-center gap-2 border-t-2 pt-2 text-xs ${
                completed ? 'border-primary text-foreground' : 'border-border/70 text-subtle'
              }`}
            >
              <span
                className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${
                  completed
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-subtle'
                }`}
              >
                {completed && !isCurrent ? <Check className="h-3 w-3" /> : idx + 1}
              </span>
              <span className={isCurrent ? 'font-semibold text-primary' : 'font-medium'}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {isTerminalNegative && (
        <p className="text-xs font-medium text-danger">
          Workflow closed as {status}.
        </p>
      )}

      {verificationNote && (
        <p className="text-xs text-muted">
          <span className="font-medium text-foreground">Hospital verification log: </span>
          {verificationNote}
        </p>
      )}
    </div>
  );
}
