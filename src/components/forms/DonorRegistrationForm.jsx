import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  getDistrictsByProvince,
  getMunicipalitiesByDistrict,
  getProvinceNames,
} from '../../data/locations';
import { BLOOD_GROUPS } from '../../utils/bloodCompatibility';
import { donorRegistrationSchema } from '../../validation/schemas';
import { Button, Field, SelectField } from '../common/ui';

export default function DonorRegistrationForm({ onSuccess, isSubmittingExternal = false }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(donorRegistrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '+977 ',
      password: '',
      bloodGroup: 'O+',
      province: 'Bagmati Province',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      approximateLocation: '',
      preferredContactMethod: 'Platform Notification',
      availabilityPreference: 'Available Now',
      shareMunicipalityPublicly: true,
      consentDonorRequests: false,
      consentPrivacy: false,
    },
  });

  const selectedProvince = watch('province');
  const selectedDistrict = watch('district');
  const selectedBloodGroup = watch('bloodGroup');

  const provinces = getProvinceNames();
  const districts = getDistrictsByProvince(selectedProvince);
  const municipalities = getMunicipalitiesByDistrict(selectedProvince, selectedDistrict);

  const busy = isSubmitting || isSubmittingExternal;

  return (
    <form onSubmit={handleSubmit(onSuccess)} noValidate className="space-y-6">
      {/* Personal & Contact Credentials */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Full name"
          required
          placeholder="e.g. Suman Thapa"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Field
          label="Email address"
          type="email"
          required
          placeholder="name@example.com.np"
          error={errors.email?.message}
          {...register('email')}
        />
        <Field
          label="Phone number (Nepalese format)"
          type="tel"
          required
          placeholder="+977 9841234567"
          hint="Never shown publicly in donor search cards"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Field
          label="Account password"
          type="password"
          required
          placeholder="Minimum 8 characters with letters & numbers"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      {/* Blood Group Selector */}
      <div className="border-t border-border/50 pt-5">
        <label className="block text-sm font-medium text-foreground">
          Blood group <span className="text-primary">*</span>
        </label>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {BLOOD_GROUPS.map((group) => {
            const active = selectedBloodGroup === group;
            return (
              <button
                key={group}
                type="button"
                onClick={() => setValue('bloodGroup', group, { shouldValidate: true })}
                className={`min-h-11 rounded-control border text-sm font-semibold tabular-nums transition-colors ${
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-foreground hover:bg-background'
                }`}
              >
                {group}
              </button>
            );
          })}
        </div>
        {errors.bloodGroup && (
          <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
            {errors.bloodGroup.message}
          </p>
        )}
      </div>

      {/* Nepal Administrative Hierarchy */}
      <div className="grid grid-cols-1 gap-4 border-t border-border/50 pt-5 sm:grid-cols-3">
        <SelectField
          label="Province"
          required
          options={provinces}
          error={errors.province?.message}
          {...register('province', {
            onChange: (e) => {
              const nextProv = e.target.value;
              const nextDistricts = getDistrictsByProvince(nextProv);
              const firstDist = nextDistricts[0] || '';
              const nextMunis = getMunicipalitiesByDistrict(nextProv, firstDist);
              setValue('district', firstDist);
              setValue('municipality', nextMunis[0] || '');
            },
          })}
        />

        <SelectField
          label="District"
          required
          options={districts}
          error={errors.district?.message}
          {...register('district', {
            onChange: (e) => {
              const nextDist = e.target.value;
              const nextMunis = getMunicipalitiesByDistrict(selectedProvince, nextDist);
              setValue('municipality', nextMunis[0] || '');
            },
          })}
        />

        <SelectField
          label="Municipality"
          required
          options={municipalities}
          error={errors.municipality?.message}
          {...register('municipality')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field
          label="Approximate area (Optional)"
          placeholder="e.g. Maharajgunj Chowk, Ward 3"
          hint="Used for internal hospital proximity matching only"
          error={errors.approximateLocation?.message}
          {...register('approximateLocation')}
        />

        <SelectField
          label="Preferred contact method"
          required
          options={['Platform Notification', 'Hospital Desk Call', 'SMS Alert']}
          error={errors.preferredContactMethod?.message}
          {...register('preferredContactMethod')}
        />

        <SelectField
          label="Availability preference"
          required
          options={[
            'Available Now',
            'Weekends & Evenings',
            'Emergency Only',
            'Temporarily Paused',
          ]}
          error={errors.availabilityPreference?.message}
          {...register('availabilityPreference')}
        />
      </div>

      {/* Privacy & Informed Consents */}
      <div className="space-y-3 border-t border-border/50 pt-5 text-sm">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border accent-primary"
            {...register('shareMunicipalityPublicly')}
          />
          <span className="text-muted">
            Display my municipality alongside my district on public donor search cards (optional;
            phone and email always stay private).
          </span>
        </label>

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border accent-primary"
              {...register('consentDonorRequests')}
            />
            <span className="text-foreground">
              I consent to receive voluntary blood request notifications coordinated through
              BLOODBRIDGE. <span className="text-primary">*</span>
            </span>
          </label>
          {errors.consentDonorRequests && (
            <p role="alert" className="mt-1 pl-7 text-xs font-medium text-danger">
              {errors.consentDonorRequests.message}
            </p>
          )}
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border accent-primary"
              {...register('consentPrivacy')}
            />
            <span className="text-foreground">
              I agree to the BLOODBRIDGE Privacy Policy and Terms, and understand that medical
              donation eligibility is assessed solely in person by licensed hospital or blood bank
              clinicians. <span className="text-primary">*</span>
            </span>
          </label>
          {errors.consentPrivacy && (
            <p role="alert" className="mt-1 pl-7 text-xs font-medium text-danger">
              {errors.consentPrivacy.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-5">
        <p className="text-xs text-subtle">
          Demo registration mode: creates an interactive donor profile in local preview storage.
        </p>
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? 'Creating donor profile...' : 'Complete donor registration'}
        </Button>
      </div>
    </form>
  );
}
