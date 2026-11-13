import { Building2, Calendar, MapPin } from 'lucide-react';
import { formatDisplayDate } from '../../utils/formatters';
import { BloodGroupMark, Button, StatusText, Surface } from '../common/ui';

export default function RequestCard({
  request,
  onSelectRequest,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionDisabled = false,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <Surface className="flex flex-col justify-between p-5">
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="font-mono font-medium text-foreground">{request.id}</span>
              <span>·</span>
              <span>{request.urgency}</span>
            </div>
            <h3 className="mt-1 text-base font-semibold text-foreground">
              {request.unitsRequired} {request.unitsRequired === 1 ? 'unit' : 'units'} required at{' '}
              {request.hospitalName}
            </h3>
          </div>
          <BloodGroupMark group={request.bloodGroup} size="lg" />
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-muted">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-subtle" />
            <span>
              {request.district}, {request.municipality}
            </span>
          </p>
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-subtle" />
            <span>Required by {formatDisplayDate(request.requiredDate)}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-subtle" />
            <span>Requester: {request.requesterName} (Demo record)</span>
          </p>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-muted">{request.requestDetails}</p>
      </div>

      <div className="mt-4 space-y-3 border-t border-border/50 pt-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusText status={request.status} />
          <span className="text-xs tabular-nums text-subtle">
            {(request.pledgedDonors || []).length} donor response
            {(request.pledgedDonors || []).length === 1 ? '' : 's'}
          </span>
        </div>

        {(onSelectRequest || onPrimaryAction || onSecondaryAction) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {onSelectRequest && (
              <Button tone="quiet" size="sm" onClick={() => onSelectRequest(request)}>
                View details
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button tone="danger" size="sm" onClick={() => onSecondaryAction(request)}>
                {secondaryActionLabel}
              </Button>
            )}
            {primaryActionLabel && onPrimaryAction && (
              <Button
                size="sm"
                disabled={primaryActionDisabled}
                onClick={() => onPrimaryAction(request)}
              >
                {primaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </Surface>
  );
}
