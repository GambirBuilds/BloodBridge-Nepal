import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { requestService } from '../../services/requestService';
import { Button, Field, SelectField, Surface } from './ui';

export default function ReportDialog({
  open,
  onClose,
  targetType = 'BLOOD_REQUEST',
  targetId,
  targetTitle,
  onReportSubmitted,
}) {
  const [reason, setReason] = useState('Suspicious requisition details or inpatient status');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('Suspicious requisition details or inpatient status');
      setDetails('');
      setError('');
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (details.trim().length < 6) {
      setError('Please provide at least 6 characters explaining the issue.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await requestService.reportRequest(targetId, reason, details);
      if (onReportSubmitted) {
        onReportSubmitted({ targetId, reason, details });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-dialog-title"
    >
      <Surface className="w-full max-w-lg p-6 shadow-float">
        <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-4">
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <h3 id="report-dialog-title" className="text-base font-semibold text-foreground">
              Report suspicious activity or issue
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-control p-1 text-subtle hover:bg-background hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-xs text-muted">
            Reports are immediately reviewed by authorized hospital coordination leads and platform
            administrators.
          </p>

          {targetTitle && (
            <div className="rounded-control bg-background p-2.5 text-xs">
              <span className="font-semibold text-foreground">Target: </span>
              <span className="text-muted">{targetTitle}</span> ({targetId})
            </div>
          )}

          <SelectField
            label="Report reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={[
              'Suspicious requisition details or inpatient status',
              'Suspected commercial blood selling or fee request',
              'Duplicate request or already fulfilled emergency',
              'Inappropriate or offensive contact attempt',
              'Other trust & safety concern',
            ]}
          />

          <Field
            label="Details & context"
            required
            placeholder="Please specify why this record requires administrative inspection..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            error={error}
          />

          <div className="flex flex-wrap justify-end gap-2.5 border-t border-border/50 pt-4">
            <Button tone="quiet" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button tone="danger" size="sm" type="submit" disabled={submitting}>
              {submitting ? 'Submitting report...' : 'Submit report for investigation'}
            </Button>
          </div>
        </form>
      </Surface>
    </div>
  );
}
