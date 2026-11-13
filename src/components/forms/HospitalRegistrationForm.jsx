import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  getDistrictsByProvince,
  getMunicipalitiesByDistrict,
  getProvinceNames,
} from '../../data/locations';
import { hospitalRegistrationSchema } from '../../validation/schemas';
import { Button, Field, SelectField, Surface } from '../common/ui';

export default function HospitalRegistrationForm({ onSuccess }) {
  const [selectedFileName, setSelectedFileName] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(hospitalRegistrationSchema),
    defaultValues: {
      hospitalName: '',
      institutionType: 'Public Hospital',
      registrationNumber: '',
      address: '',
      province: 'Bagmati Province',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      officialEmail: '',
      contactNumber: '+977 ',
      authorizedRepresentative: '',
      representativeDesignation: 'Blood Bank Focal Officer',
      password: '',
      verificationDocReference: '',
      consentVerification: false,
    },
  });

  const selectedProvince = watch('province');
  const selectedDistrict = watch('district');
  const provinces = getProvinceNames();
  const districts = getDistrictsByProvince(selectedProvince);
  const municipalities = getMunicipalitiesByDistrict(selectedProvince, selectedDistrict);

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      if (!watch('verificationDocReference')) {
        setValue('verificationDocReference', `DOC-${file.name}`, { shouldValidate: true });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSuccess)} noValidate className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Hospital or blood bank name"
          required
          placeholder="e.g. Valley Community Teaching Hospital"
          error={errors.hospitalName?.message}
          {...register('hospitalName')}
        />
        <SelectField
          label="Institution category"
          required
          options={[
            'Public Hospital',
            'Teaching Hospital',
            'Community Blood Bank',
            'Specialty Hospital',
          ]}
          error={errors.institutionType?.message}
          {...register('institutionType')}
        />
        <Field
          label="MoHP / NPHL registration details"
          required
          placeholder="e.g. MOHP-REG-2082-044"
          error={errors.registrationNumber?.message}
          {...register('registrationNumber')}
        />
        <Field
          label="Street & ward address"
          required
          placeholder="e.g. Ward 4, Hospital Road"
          error={errors.address?.message}
          {...register('address')}
        />
      </div>

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

      <div className="grid grid-cols-1 gap-4 border-t border-border/50 pt-5 sm:grid-cols-2">
        <Field
          label="Official institutional email"
          type="email"
          required
          placeholder="bloodbank@institution.org.np"
          error={errors.officialEmail?.message}
          {...register('officialEmail')}
        />
        <Field
          label="Hospital desk phone (+977)"
          type="tel"
          required
          placeholder="+977 01-4412345"
          error={errors.contactNumber?.message}
          {...register('contactNumber')}
        />
        <Field
          label="Authorized representative name"
          required
          placeholder="e.g. Dr. Bikash Poudel"
          error={errors.authorizedRepresentative?.message}
          {...register('authorizedRepresentative')}
        />
        <Field
          label="Representative designation"
          required
          placeholder="e.g. Chief Transfusion Officer"
          error={errors.representativeDesignation?.message}
          {...register('representativeDesignation')}
        />
      </div>

      {/* Recessed interactive dropzone allowed by Surface inset rule */}
      <div className="grid grid-cols-1 gap-4 border-t border-border/50 pt-5 sm:grid-cols-2">
        <Field
          label="Verification permit / license reference"
          required
          placeholder="e.g. NPHL-BB-PERMIT-2082-19"
          error={errors.verificationDocReference?.message}
          {...register('verificationDocReference')}
        />
        <Field
          label="Portal password"
          type="password"
          required
          placeholder="Minimum 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <Surface inset className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              Verification documents upload (Part 2 storage hook)
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {selectedFileName
                ? `Selected credential packet: ${selectedFileName}`
                : 'Attach MoHP operating permit & NPHL blood bank authorization letter (PDF/JPG)'}
            </p>
          </div>
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-control border border-border bg-surface px-3.5 text-xs font-medium text-foreground hover:bg-background">
            <FileUp className="h-4 w-4 text-primary" />
            <span>Choose credential file</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFilePick}
              className="sr-only"
            />
          </label>
        </div>
      </Surface>

      <div className="border-t border-border/50 pt-4 text-sm">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border accent-primary"
            {...register('consentVerification')}
          />
          <span className="text-foreground">
            I confirm that I am authorized to represent this institution and understand new hospital
            accounts start in Pending Verification state until reviewed by platform administrators.{' '}
            <span className="text-primary">*</span>
          </span>
        </label>
        {errors.consentVerification && (
          <p role="alert" className="mt-1 pl-7 text-xs font-medium text-danger">
            {errors.consentVerification.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
        <p className="text-xs text-subtle">
          Demo onboarding: marks institution clearly as a demonstration record pending admin review.
        </p>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting onboarding...' : 'Submit hospital application'}
        </Button>
      </div>
    </form>
  );
}
