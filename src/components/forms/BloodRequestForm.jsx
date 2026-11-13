import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  getDistrictsByProvince,
  getMunicipalitiesByDistrict,
  getProvinceNames,
} from '../../data/locations';
import { usePlatformData } from '../../hooks/usePlatformData';
import { BLOOD_GROUPS } from '../../utils/bloodCompatibility';
import { bloodRequestSchema } from '../../validation/schemas';
import { Button, Field, SelectField, TextareaField } from '../common/ui';

export default function BloodRequestForm({
  defaultBloodGroup = 'O+',
  defaultRequesterName = '',
  defaultPhone = '+977 ',
  onSuccess,
}) {
  const { hospitals } = usePlatformData();
  const verifiedHospitals = hospitals.filter((h) => h.verificationStatus === 'Verified');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bloodRequestSchema),
    defaultValues: {
      requesterName: defaultRequesterName,
      patientName: '',
      contactPhone: defaultPhone,
      contactEmail: '',
      bloodGroup: defaultBloodGroup,
      unitsRequired: 2,
      urgency: 'Urgent (Within 24 hrs)',
      hospitalName: verifiedHospitals[0]?.hospitalName || '',
      province: verifiedHospitals[0]?.province || 'Bagmati Province',
      district: verifiedHospitals[0]?.district || 'Kathmandu',
      municipality: verifiedHospitals[0]?.municipality || 'Kathmandu Metropolitan City',
      requiredDate: '2026-11-12',
      requestDetails: '',
      consentProcessInfo: false,
    },
  });

  const selectedProvince = watch('province');
  const selectedDistrict = watch('district');
  const selectedBloodGroup = watch('bloodGroup');

  const provinces = getProvinceNames();
  const districts = getDistrictsByProvince(selectedProvince);
  const municipalities = getMunicipalitiesByDistrict(selectedProvince, selectedDistrict);

  const handleHospitalQuickPick = (e) => {
    const chosenName = e.target.value;
    setValue('hospitalName', chosenName, { shouldValidate: true });
    const found = hospitals.find((h) => h.hospitalName === chosenName);
    if (found) {
      setValue('province', found.province, { shouldValidate: true });
      setValue('district', found.district, { shouldValidate: true });
      setValue('municipality', found.municipality, { shouldValidate: true });
    }
  };

  const submitHandler = async (values) => {
    await onSuccess(values);
    reset({
      ...values,
      patientName: '',
      requestDetails: '',
      consentProcessInfo: false,
    });
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Requester / attendant name"
          required
          placeholder="e.g. Ramesh Adhikari"
          error={errors.requesterName?.message}
          {...register('requesterName')}
        />
        <Field
          label="Patient name (Optional)"
          placeholder="e.g. Kamal Khadka"
          error={errors.patientName?.message}
          {...register('patientName')}
        />
        <Field
          label="Contact phone (+977)"
          type="tel"
          required
          placeholder="+977 9851023456"
          error={errors.contactPhone?.message}
          {...register('contactPhone')}
        />
        <Field
          label="Contact email (Optional)"
          type="email"
          placeholder="attendant@example.com.np"
          error={errors.contactEmail?.message}
          {...register('contactEmail')}
        />
      </div>

      {/* Blood Group & Units */}
      <div className="border-t border-border/50 pt-5">
        <label className="block text-sm font-medium text-foreground">
          Blood group required <span className="text-primary">*</span>
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
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field
          label="Units required"
          type="number"
          min={1}
          max={10}
          step={1}
          required
          error={errors.unitsRequired?.message}
          {...register('unitsRequired')}
        />
        <SelectField
          label="Clinical urgency"
          required
          options={['Critical (Within 6 hrs)', 'Urgent (Within 24 hrs)', 'Scheduled Surgery']}
          error={errors.urgency?.message}
          {...register('urgency')}
        />
        <Field
          label="Required date"
          type="date"
          required
          error={errors.requiredDate?.message}
          {...register('requiredDate')}
        />
      </div>

      {/* Treating Hospital & Location */}
      <div className="space-y-4 border-t border-border/50 pt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Quick-select demonstration hospital"
            value={watch('hospitalName')}
            onChange={handleHospitalQuickPick}
            options={[
              ...verifiedHospitals.map((h) => ({
                value: h.hospitalName,
                label: `${h.hospitalName} (${h.district})`,
              })),
              { value: '', label: 'Enter custom hospital below' },
            ]}
          />
          <Field
            label="Treating hospital name"
            required
            placeholder="Official hospital name on ward slip"
            error={errors.hospitalName?.message}
            {...register('hospitalName')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SelectField
            label="Hospital province"
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
            label="Hospital district"
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
            label="Hospital municipality"
            required
            options={municipalities}
            error={errors.municipality?.message}
            {...register('municipality')}
          />
        </div>
      </div>

      <TextareaField
        label="Request & requisition details"
        required
        rows={3}
        placeholder="Include inpatient ward, bed number, requisition slip reference, or procedure context..."
        error={errors.requestDetails?.message}
        {...register('requestDetails')}
      />

      <div className="border-t border-border/50 pt-4 text-sm">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border accent-primary"
            {...register('consentProcessInfo')}
          />
          <span className="text-foreground">
            I consent to BLOODBRIDGE processing this request and sharing details with the named
            hospital blood bank desk for requisition verification. <span className="text-primary">*</span>
          </span>
        </label>
        {errors.consentProcessInfo && (
          <p role="alert" className="mt-1 pl-7 text-xs font-medium text-danger">
            {errors.consentProcessInfo.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
        <p className="text-xs text-subtle">
          Demo mode: creates a trackable blood request in local preview storage.
        </p>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting request...' : 'Submit blood request'}
        </Button>
      </div>
    </form>
  );
}
