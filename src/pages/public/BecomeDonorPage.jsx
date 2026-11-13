import { useNavigate } from 'react-router-dom';
import { PLATFORM_IMAGES } from '../../assets/images';
import { SmartImage, Surface } from '../../components/common/ui';
import DonorRegistrationForm from '../../components/forms/DonorRegistrationForm';
import { useAuth } from '../../hooks/useAuth';
import { usePlatformData } from '../../hooks/usePlatformData';
import { useToast } from '../../hooks/useToast';

export default function BecomeDonorPage() {
  const navigate = useNavigate();
  const { registerDonorAccount } = usePlatformData();
  const { setAuthenticatedUser } = useAuth();
  const { showToast } = useToast();

  const handleRegisterDonor = async (values) => {
    const { user } = await registerDonorAccount(values);
    setAuthenticatedUser(user);
    showToast({
      tone: 'success',
      title: 'Voluntary donor account created (Demo Mode)',
      description: 'You are now signed in to your Donor Workspace.',
    });
    navigate('/dashboard/donor');
  };

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <div className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:col-span-5">
          <div>
            <h1 className="text-display text-foreground">Become a voluntary blood donor</h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Join Nepal’s privacy-first donor network. Control when you are available, pause
              notifications anytime after donating, and respond only to hospital-verified blood
              requests.
            </p>
          </div>

          <SmartImage
            src={PLATFORM_IMAGES.communityDrive}
            alt="Voluntary community blood donation courtyard setup in Nepal"
            fallbackTitle="Voluntary Community Blood Coordination"
            className="aspect-[4/3] w-full rounded-card border border-border/70 object-cover"
          />

          <Surface className="divide-y divide-border/60 p-5">
            <div className="pb-3.5">
              <h2 className="text-sm font-semibold text-foreground">
                How your donor privacy & clinical safety are protected
              </h2>
            </div>
            <div className="py-3 text-sm text-muted">
              <strong className="text-foreground">No public phone numbers:</strong> Directory cards
              show only your approved display name, blood group, district, and availability.
            </div>
            <div className="py-3 text-sm text-muted">
              <strong className="text-foreground">One-click notification pause:</strong> Pause
              incoming request alerts anytime during recovery, travel, or exams.
            </div>
            <div className="pt-3 text-sm text-muted">
              <strong className="text-foreground">Clinical screening at the hospital:</strong>{' '}
              BLOODBRIDGE never makes automated medical eligibility decisions. Licensed staff check
              hemoglobin, vitals, and medical history in person before donation.
            </div>
          </Surface>
        </div>

        <div className="min-w-0 lg:col-span-7">
          <Surface className="p-6 sm:p-8">
            <div className="mb-6 border-b border-border/60 pb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Voluntary donor registration
              </h2>
              <p className="mt-1 text-sm text-muted">
                All fields marked with * are required. Nepalese administrative boundaries follow
                the seven-province federal structure.
              </p>
            </div>

            <DonorRegistrationForm onSuccess={handleRegisterDonor} />
          </Surface>
        </div>
      </div>
    </div>
  );
}
