import { useNavigate } from 'react-router-dom';
import { PLATFORM_IMAGES } from '../../assets/images';
import { Button, SmartImage, Surface } from '../../components/common/ui';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-[90rem] space-y-12 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <p className="text-sm font-semibold text-primary">
            Connecting Lives, One Donation at a Time.
          </p>
          <h1 className="mt-2 text-display text-foreground">
            Built to modernize voluntary blood coordination across Nepal
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Across Kathmandu Valley, provincial referral centers, and highway trauma hospitals,
            patient families frequently spend critical hours calling unverified phone lists or
            posting personal mobile numbers on public social feeds when blood bank reserves run low.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted">
            BLOODBRIDGE bridges four essential participants—voluntary blood donors, patient
            families, hospital transfusion desks, and platform compliance administrators—into one
            structured, privacy-safe workflow.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => navigate('/become-a-donor')}>Become a Donor</Button>
            <Button tone="quiet" onClick={() => navigate('/how-it-works')}>
              Explore clinical workflow
            </Button>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5">
          <SmartImage
            src={PLATFORM_IMAGES.communityDrive}
            alt="Community health center courtyard prepared for voluntary blood donation in Nepal"
            fallbackTitle="BLOODBRIDGE Nepal Mission"
            className="aspect-[4/3] w-full rounded-card border border-border/70 object-cover"
          />
        </div>
      </div>

      <Surface className="grid grid-cols-1 divide-y divide-border/60 md:grid-cols-3 md:divide-x md:divide-y-0">
        {[
          {
            title: 'Strictly non-remunerated ethos',
            body: 'Voluntary blood donation is never bought or sold. BLOODBRIDGE enforces NPR 0 donor matching while clearly separating government-regulated hospital cross-match laboratory fees.',
          },
          {
            title: 'Privacy by default for Nepalese donors',
            body: 'Public donor directories never expose mobile numbers, email addresses, or exact residential coordinates. Donors can pause request notifications with one toggle.',
          },
          {
            title: 'Hospital requisition accountability',
            body: 'Every critical request is linked to a named hospital ward and reviewed by authorized hospital blood bank staff before priority donor outreach begins.',
          },
        ].map((pillar) => (
          <div key={pillar.title} className="p-6">
            <h2 className="text-base font-semibold text-foreground">{pillar.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{pillar.body}</p>
          </div>
        ))}
      </Surface>

      <Surface className="divide-y divide-border/60 p-6 sm:p-8">
        <div className="pb-4">
          <h2 className="text-title text-foreground">Who BLOODBRIDGE serves</h2>
          <p className="mt-1 text-sm text-muted">
            Dedicated role workspaces designed around real responsibilities in Nepal’s transfusion
            ecosystem.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              role: 'Voluntary Donors',
              summary:
                'Maintain availability preferences, respond to verified requests in your district, and keep a personal archive of donation history.',
            },
            {
              role: 'Patients & Families',
              summary:
                'Submit structured inpatient blood requests and track verification progress from Pending through Fulfilled without sharing phone numbers publicly.',
            },
            {
              role: 'Hospitals & Blood Banks',
              summary:
                'Verify inpatient ward slips, manage indicative unit stock across all eight ABO/Rh groups, and coordinate incoming voluntary donors.',
            },
            {
              role: 'Platform Administrators',
              summary:
                'Verify hospital operating permits, audit platform activity across all seven provinces, and safeguard ethical compliance.',
            },
          ].map((entry) => (
            <div key={entry.role} className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">{entry.role}</h3>
              <p className="mt-1.5 text-sm text-muted">{entry.summary}</p>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
