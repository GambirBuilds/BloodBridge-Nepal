import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Field, SelectField, Surface } from '../../components/common/ui';
import { useAuth } from '../../hooks/useAuth';
import { usePlatformData } from '../../hooks/usePlatformData';
import { useToast } from '../../hooks/useToast';
import { loginSchema } from '../../validation/schemas';

const DEMO_ROLE_CARDS = [
  {
    role: 'donor',
    title: 'Donor Workspace',
    person: 'Suman Thapa (O+ · Kathmandu)',
    email: 'suman.thapa@demo.bloodbridge.np',
    summary: 'Availability toggle, pause alerts, incoming verified requests, donation history.',
  },
  {
    role: 'requester',
    title: 'Patient / Requester Workspace',
    person: 'Ramesh Adhikari (Kathmandu)',
    email: 'ramesh.adhikari@demo.bloodbridge.np',
    summary: 'Submit blood requests, track hospital verification status, cancel eligible requests.',
  },
  {
    role: 'hospital',
    title: 'Hospital / Blood Bank Workspace',
    person: 'Dr. Bikash Poudel (Demo Teaching Hospital)',
    email: 'bloodbank@bagmatiteaching.demo.np',
    summary: 'Verify ward requisitions, coordinate donors, manage ABO/Rh stock & staff.',
  },
  {
    role: 'admin',
    title: 'Administrator Console',
    person: 'Aarav Khadka (Platform Admin)',
    email: 'aarav.khadka@demo.bloodbridge.np',
    summary: 'Approve hospital permits, inspect Nepal regional analytics, manage users & requests.',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithDemoRole, loginWithCredentials, getDashboardPathForRole } = useAuth();
  const { users } = usePlatformData();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'suman.thapa@demo.bloodbridge.np',
      password: 'demoPassword123',
      role: 'donor',
    },
  });

  const handleFormLogin = async (values) => {
    try {
      const session = await loginWithCredentials(values);
      showToast({
        tone: 'success',
        title: `Signed in as ${session.name}`,
        description: `Opened ${session.roleLabel} dashboard.`,
      });
      navigate(getDashboardPathForRole(session.role));
    } catch (err) {
      showToast({
        tone: 'danger',
        title: 'Authentication Failed',
        description: err.response?.data?.message || err.message || 'Invalid credentials',
      });
    }
  };

  const handleInstantDemoRole = async (roleItem) => {
    setValue('email', roleItem.email);
    setValue('role', roleItem.role);
    try {
      const session = await loginWithDemoRole(roleItem.role);
      showToast({
        tone: 'success',
        title: `Entered ${roleItem.title}`,
        description: `Active demonstration account: ${session.name}`,
      });
      navigate(getDashboardPathForRole(roleItem.role));
    } catch (err) {
      showToast({
        tone: 'danger',
        title: 'Demo Sign-In Failed',
        description: err.response?.data?.message || err.message || 'Could not sign in with demo credentials.',
      });
    }
  };

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Standard Sign-In Form */}
        <div className="min-w-0 lg:col-span-5">
          <Surface className="p-6 sm:p-8">
            <div>
              <h1 className="text-title text-foreground">Sign in to BLOODBRIDGE</h1>
              <p className="mt-1 text-sm text-muted">
                Part 1 Frontend Preview uses local demonstration authentication. Real JWT &
                server-side session validation connect in Part 2.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(handleFormLogin)}
              noValidate
              className="mt-6 space-y-4 border-t border-border/60 pt-5"
            >
              <SelectField
                label="Account role"
                options={[
                  { value: 'donor', label: 'Voluntary Donor' },
                  { value: 'requester', label: 'Patient / Requester' },
                  { value: 'hospital', label: 'Hospital / Blood Bank' },
                  { value: 'admin', label: 'Platform Administrator' },
                ]}
                error={errors.role?.message}
                {...register('role')}
              />

              <Field
                label="Email address"
                type="email"
                required
                placeholder="name@demo.bloodbridge.np"
                error={errors.email?.message}
                {...register('email')}
              />

              <Field
                label="Password"
                type="password"
                required
                placeholder="Enter password"
                error={errors.password?.message}
                {...register('password')}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <KeyRound className="h-4 w-4" />
                Sign in (Demo Session)
              </Button>
            </form>

            <div className="mt-6 border-t border-border/60 pt-4 text-sm text-muted">
              New to BLOODBRIDGE?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Create a Donor, Requester, or Hospital account
              </Link>
            </div>
          </Surface>
        </div>

        {/* One-Click Demo Role Explorer */}
        <div className="min-w-0 lg:col-span-7">
          <Surface className="divide-y divide-border/60 p-6 sm:p-8">
            <div className="pb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Instant demonstration role workspaces
              </h2>
              <p className="mt-1 text-sm text-muted">
                Select any of the four pre-configured Nepalese demonstration accounts below to
                inspect role-specific dashboards, workflows, and permissions immediately.
              </p>
            </div>

            <div className="divide-y divide-border/50">
              {DEMO_ROLE_CARDS.map((card) => (
                <div
                  key={card.role}
                  className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                    <p className="mt-0.5 text-xs font-medium text-primary">{card.person}</p>
                    <p className="mt-1 text-xs text-muted">{card.summary}</p>
                  </div>
                  <Button
                    tone="quiet"
                    size="sm"
                    onClick={() => handleInstantDemoRole(card)}
                    className="shrink-0"
                  >
                    Open {card.role} dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
