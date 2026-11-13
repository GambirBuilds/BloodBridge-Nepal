import { MapPin, Shield } from 'lucide-react';
import { formatPublicDonorName } from '../../utils/formatters';
import { BloodGroupMark, Button, StatusText, Surface } from '../common/ui';

export default function DonorCard({ donor, onCoordinateRequest }) {
  const displayName = formatPublicDonorName(donor.fullName, donor.publicDisplayMode);
  const publicMunicipality = donor.shareMunicipalityPublicly
    ? donor.municipality
    : 'Municipality private';

  const isPaused =
    donor.notificationsPaused || donor.availabilityPreference === 'Temporarily Paused';

  return (
    <Surface className="flex flex-col justify-between p-5">
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground">{displayName}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-subtle" />
              <span>
                {donor.district} · {publicMunicipality}
              </span>
            </p>
          </div>
          <BloodGroupMark group={donor.bloodGroup} size="lg" />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3.5 text-xs text-muted">
          <StatusText
            status={isPaused ? 'Temporarily Paused' : donor.availabilityPreference}
          />
          <span>{donor.province.replace(' Province', '')}</span>
        </div>

        <p className="mt-2.5 flex items-center gap-1.5 text-xs text-subtle">
          <Shield className="h-3.5 w-3.5 shrink-0" />
          <span>Direct phone & address protected · Demo donor record</span>
        </p>
      </div>

      {onCoordinateRequest && (
        <div className="mt-4 border-t border-border/50 pt-3.5">
          <Button
            tone="quiet"
            size="sm"
            disabled={isPaused}
            onClick={() => onCoordinateRequest(donor)}
            className="w-full"
          >
            {isPaused
              ? 'Alerts paused by donor'
              : `Submit hospital request (${donor.bloodGroup})`}
          </Button>
        </div>
      )}
    </Surface>
  );
}
