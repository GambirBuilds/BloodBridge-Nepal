import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Button, EmptyState, SelectField, Surface } from '../../components/common/ui';
import HospitalCard from '../../components/hospitals/HospitalCard';
import { getProvinceNames } from '../../data/locations';
import { usePlatformData } from '../../hooks/usePlatformData';

export default function HospitalsPage() {
  const navigate = useNavigate();
  const { hospitals } = usePlatformData();

  const [provinceFilter, setProvinceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Verified');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      if (provinceFilter && h.province !== provinceFilter) return false;
      if (statusFilter && h.verificationStatus !== statusFilter) return false;
      if (typeFilter && h.institutionType !== typeFilter) return false;
      return true;
    });
  }, [hospitals, provinceFilter, statusFilter, typeFilter]);

  return (
    <div className="mx-auto max-w-[90rem] space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display text-foreground">
            Hospitals and blood banks (Demonstration directory)
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Sample Nepalese healthcare institutions demonstrating verified, pending, and rejected
            verification states, regulated NPR laboratory cross-match fees, and indicative unit
            inventories. None of these demonstration entries represent live verified hospitals.
          </p>
        </div>

        <Button onClick={() => navigate('/register?tab=hospital')}>
          <Building2 className="h-4 w-4" />
          Register hospital / blood bank
        </Button>
      </div>

      <Surface className="p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <SelectField
            label="Province"
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            placeholder="All 7 provinces"
            options={getProvinceNames()}
          />
          <SelectField
            label="Verification status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All verification states' },
              { value: 'Verified', label: 'Verified institutions' },
              { value: 'Pending', label: 'Pending verification' },
              { value: 'Rejected', label: 'Rejected credentials' },
            ]}
          />
          <SelectField
            label="Institution category"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            placeholder="All categories"
            options={[
              'Teaching Hospital',
              'Public Hospital',
              'Community Blood Bank',
              'Specialty Hospital',
            ]}
          />
          <div className="flex items-end">
            <Button
              tone="quiet"
              className="w-full"
              onClick={() => {
                setProvinceFilter('');
                setStatusFilter('');
                setTypeFilter('');
              }}
            >
              Show all records ({hospitals.length})
            </Button>
          </div>
        </div>
      </Surface>

      {filteredHospitals.length === 0 ? (
        <Surface className="p-6">
          <EmptyState
            title="No demonstration institutions match these filters"
            description="Switch Verification Status to 'All verification states' to inspect pending and rejected hospital onboarding examples."
            actionLabel="Show all hospital states"
            onAction={() => {
              setProvinceFilter('');
              setStatusFilter('');
              setTypeFilter('');
            }}
          />
        </Surface>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredHospitals.map((hospital) => (
            <HospitalCard key={hospital.id} hospital={hospital} />
          ))}
        </div>
      )}
    </div>
  );
}
