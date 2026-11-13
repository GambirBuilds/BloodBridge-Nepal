import { Building2, Clock, MapPin, Phone } from 'lucide-react';
import { BLOOD_GROUPS } from '../../utils/bloodCompatibility';
import { formatNPR } from '../../utils/formatters';
import { StatusText, Surface } from '../common/ui';

export default function HospitalCard({ hospital }) {
  const units = hospital.availableBloodUnits || {};

  return (
    <Surface className="flex flex-col justify-between p-5 sm:p-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">
              {hospital.institutionType} · <span className="font-mono">{hospital.registrationNumber}</span>
            </p>
            <h3 className="mt-1 text-base font-semibold text-foreground">
              {hospital.hospitalName}
            </h3>
          </div>
          <StatusText status={hospital.verificationStatus} />
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-muted">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-subtle" />
            <span>
              {hospital.address}, {hospital.municipality}, {hospital.district}
            </span>
          </p>
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-subtle" />
            <span>{hospital.operatingHours}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 shrink-0 text-subtle" />
            <span>
              Desk: {hospital.contactNumber} · Focal: {hospital.authorizedRepresentative}
            </span>
          </p>
          <p className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-subtle" />
            <span>
              Regulated lab cross-match fee: {formatNPR(hospital.regulatedCrossMatchFeeNPR)} (Voluntary blood: NPR 0)
            </span>
          </p>
        </div>

        {hospital.verificationStatus === 'Rejected' && hospital.rejectionReason && (
          <p className="mt-3 border-t border-border/50 pt-2.5 text-xs text-danger">
            Verification note: {hospital.rejectionReason}
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-border/50 pt-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Indicative blood bank unit stock (Demo units)</span>
          <span className="tabular-nums font-medium text-foreground">
            {Object.values(units).reduce((sum, n) => sum + Number(n || 0), 0)} total
          </span>
        </div>
        <div className="mt-2.5 grid grid-cols-4 divide-x divide-y divide-border/50 border-t border-border/50 pt-2 text-center sm:grid-cols-8 sm:divide-y-0">
          {BLOOD_GROUPS.map((group) => (
            <div key={group} className="px-1.5 py-2">
              <p className="text-[11px] font-semibold text-primary">{group}</p>
              <p className="mt-0.5 text-xs font-medium tabular-nums text-foreground">
                {units[group] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Surface>
  );
}
