import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Field, SelectField, Surface } from '../../components/common/ui';
import DonorRegistrationForm from '../../components/forms/DonorRegistrationForm';
import HospitalRegistrationForm from '../../components/forms/HospitalRegistrationForm';
import { getDistrictsByProvince, getProvinceNames } from '../../data/locations';
import { useAuth } from '../../hooks/useAuth';
import { usePlatformData } from '../../hooks/usePlatformData';
import { useToast } from '../../hooks/useToast';
import { requesterRegistrationSchema } from '../../validation/schemas';

function RequesterSignupForm({ onSuccess }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(requesterRegistrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '+977 ',
      province: 'Bagmati Province',
      district: 'Kathmandu',
      password: '',
      consentTerms: false,
    },
  });

  const selectedProvince = watch('province');
  const provinces = getProvinceNames();
  const districts = getDistrictsByProvince(selectedProvince);

  return (
    <form onSubmit={handleSubmit(onSuccess)} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Full name"
          required
          placeholder="e.g. Ramesh Adhikari"
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
          label="Phone number (+977)"
          type="tel"
          required
          placeholder="+977 9851023456"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Field
          label="Password"
          type="password"
          required
          placeholder="Minimum 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <SelectField
          label="Province"
          required
          options={provinces}
          error={errors.province?.message}
          {...register('province', {
            onChange: (e) => {
              const nextDist = getDistrictsByProvince(e.target.value);
              setValue('district', nextDist[0] || '');
            },
          })}
        />
        <SelectField
          label="District"
          required
          options={districts}
          error={errors.district?.message}
          {...register('district')}
        />
      </div>

      <div className="border-t border-border/50 pt-4 text-sm">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border accent-primary"
            {...register('consentTerms')}
          />
          <span className="text-foreground">
            I agree to the BLOODBRIDGE Terms & Privacy Policy for submitting and tracking hospital
            blood requests. <span className="text-primary">*</span>
          </span>
        </label>
        {errors.consentTerms && (
          <p role="alert" className="mt-1 pl-7 text-xs font-medium text-danger">
            {errors.consentTerms.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
        <p className="text-xs text-subtle">
          Creates a Patient / Requester demo account in local preview storage.
        </p>
        <Button type="submit" disabled={isSubmitting}>
          Create requester account
        </Button>
      </div>
    </form>
  );
}

export default function RegisterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'donor';

  const navigate = useNavigate();
  const {
    registerDonorAccount,
    registerRequesterAccount,
    registerHospitalAccount,
  } = usePlatformData();
  const { setAuthenticatedUser } = useAuth();
  const { showToast } = useToast();

  const handleDonorSuccess = async (values) => {
    const { user } = await registerDonorAccount(values);
    setAuthenticatedUser(user);
    showToast({
      tone: 'success',
      title: 'Donor registration complete (Demo Mode)',
      description: 'Redirected to your Voluntary Donor Dashboard.',
    });
    navigate('/dashboard/donor');
  };

  const handleRequesterSuccess = async (values) => {
    const user = await registerRequesterAccount(values);
    setAuthenticatedUser(user);
    showToast({
      tone: 'success',
      title: 'Requester account created (Demo Mode)',
      description: 'Redirected to your Patient / Requester Workspace.',
    });
    navigate('/dashboard/requester');
  };

  const handleHospitalSuccess = async (values) => {
    const { user } = await registerHospitalAccount(values);
    setAuthenticatedUser(user);
    showToast({
      tone: 'success',
      title: 'Hospital application submitted (Pending Verification)',
      description: 'Redirected to your Hospital Workspace.',
    });
    navigate('/dashboard/hospital');
  };

  const tabs = [
    { key: 'donor', label: 'Voluntary Donor' },
    { key: 'requester', label: 'Patient / Requester' },
    { key: 'hospital', label: 'Hospital / Blood Bank' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display text-foreground">Create a BLOODBRIDGE account</h1>
          <p className="mt-2 text-sm text-muted">
            Choose your role below to register in demonstration mode. Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in here
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Role switcher segmented control */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSearchParams({ tab: tab.key })}
              className={`min-h-11 whitespace-nowrap rounded-control border px-4 text-sm font-medium transition-colors ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface text-foreground hover:bg-background'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <Surface className="p-6 sm:p-8">
        {activeTab === 'donor' && <DonorRegistrationForm onSuccess={handleDonorSuccess} />}
        {activeTab === 'requester' && (
          <RequesterSignupForm onSuccess={handleRequesterSuccess} />
        )}
        {activeTab === 'hospital' && (
          <HospitalRegistrationForm onSuccess={handleHospitalSuccess} />
        )}
      </Surface>
    </div>
  );
}
