import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Search } from 'lucide-react';
import { PLATFORM_IMAGES } from '../../assets/images';
import DonorCard from '../../components/donors/DonorCard';
import HospitalCard from '../../components/hospitals/HospitalCard';
import RequestCard from '../../components/requests/RequestCard';
import {
  BloodGroupMark,
  Button,
  SelectField,
  SmartImage,
  Surface,
} from '../../components/common/ui';
import { getDistrictsByProvince, getProvinceNames } from '../../data/locations';
import { DEMO_TESTIMONIALS, PLATFORM_FAQS } from '../../data/statistics';
import { usePlatformData } from '../../hooks/usePlatformData';
import { BLOOD_COMPATIBILITY, BLOOD_GROUPS } from '../../utils/bloodCompatibility';
import { formatCount } from '../../utils/formatters';

export default function HomePage() {
  const navigate = useNavigate();
  const { donors, requests, hospitals } = usePlatformData();

  const [quickBloodGroup, setQuickBloodGroup] = useState('O+');
  const [quickProvince, setQuickProvince] = useState('Bagmati Province');
  const [quickDistrict, setQuickDistrict] = useState('Kathmandu');
  const [compatibilityGroup, setCompatibilityGroup] = useState('O-');
  const [openFaqId, setOpenFaqId] = useState(PLATFORM_FAQS[0]?.id || '');

  const provinces = getProvinceNames();
  const districts = getDistrictsByProvince(quickProvince);

  const activeDonorsCount = donors.filter(
    (d) => !d.notificationsPaused && d.availabilityPreference !== 'Temporarily Paused'
  ).length;
  const verifiedHospitals = hospitals.filter((h) => h.verificationStatus === 'Verified');
  const activeRequests = requests.filter((r) =>
    ['Verified', 'Donor Coordination', 'Under Verification', 'Pending'].includes(r.status)
  );

  const selectedCompatibility = BLOOD_COMPATIBILITY[compatibilityGroup];

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (quickBloodGroup) params.set('bloodGroup', quickBloodGroup);
    if (quickProvince) params.set('province', quickProvince);
    if (quickDistrict) params.set('district', quickDistrict);
    navigate(`/find-donors?${params.toString()}`);
  };

  return (
    <div className="divide-y divide-border/70">
      {/* 1. Hero + Live Blood Group Search */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-6">
              <p className="text-sm font-semibold text-primary">
                Connecting Lives, One Donation at a Time.
              </p>
              <h1 className="mt-2 text-display tracking-tight text-foreground">
                Voluntary blood donor discovery and hospital coordination across Nepal
              </h1>
              <p className="mt-4 max-w-[38em] text-base leading-relaxed text-muted">
                BLOODBRIDGE links registered voluntary donors, patient families, and hospital blood
                bank desks across all seven provinces—replacing unverified social media panic posts
                with privacy-protected, requisition-verified coordination.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={() => navigate('/find-donors')}>
                  Find Blood Donors
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button tone="quiet" size="lg" onClick={() => navigate('/become-a-donor')}>
                  Become a Donor
                </Button>
              </div>

              {/* Platform Statistics Strip (rule-parted, zero nested boxes) */}
              <div className="mt-9 grid grid-cols-2 gap-4 border-t border-border/60 pt-6 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-border/60">
                <div className="sm:pr-5">
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    {formatCount(donors.length)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">Demo voluntary donors</p>
                </div>
                <div className="sm:px-5">
                  <p className="text-2xl font-bold tabular-nums text-primary">
                    {formatCount(activeDonorsCount)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">Available for alerts</p>
                </div>
                <div className="sm:px-5">
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    {formatCount(verifiedHospitals.length)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">Demo verified desks</p>
                </div>
                <div className="sm:pl-5">
                  <p className="text-2xl font-bold tabular-nums text-foreground">7</p>
                  <p className="mt-0.5 text-xs text-muted">Provinces covered</p>
                </div>
              </div>
            </div>

            <div className="min-w-0 lg:col-span-6">
              <div className="overflow-hidden rounded-card border border-border/70 bg-background">
                <SmartImage
                  src={PLATFORM_IMAGES.heroClinic}
                  alt="Morning donor care and sterile blood collection ward in Kathmandu Valley"
                  fallbackTitle="Kathmandu Valley Transfusion Coordination"
                  className="aspect-[16/9] w-full object-cover"
                />
                {/* Live Blood Group Search Component integrated cleanly beneath hero image */}
                <form
                  onSubmit={handleQuickSearch}
                  className="space-y-4 border-t border-border/70 bg-surface p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-base font-semibold text-foreground">
                      Quick donor lookup by blood group & district
                    </h2>
                    <span className="text-xs text-subtle">All 8 ABO/Rh groups</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
                    {BLOOD_GROUPS.map((group) => {
                      const active = quickBloodGroup === group;
                      return (
                        <button
                          key={group}
                          type="button"
                          onClick={() => setQuickBloodGroup(group)}
                          className={`min-h-10 rounded-control border text-xs font-semibold tabular-nums transition-colors ${
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

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <SelectField
                      label="Province"
                      value={quickProvince}
                      onChange={(e) => {
                        const prov = e.target.value;
                        setQuickProvince(prov);
                        const nextDist = getDistrictsByProvince(prov);
                        setQuickDistrict(nextDist[0] || '');
                      }}
                      placeholder="All provinces"
                      options={provinces}
                    />
                    <SelectField
                      label="District"
                      value={quickDistrict}
                      onChange={(e) => setQuickDistrict(e.target.value)}
                      placeholder="All districts"
                      options={districts}
                    />
                    <div className="flex items-end">
                      <Button type="submit" className="w-full">
                        <Search className="h-4 w-4" />
                        Search directory
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How BLOODBRIDGE Works */}
      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-title text-foreground">
                How hospital-coordinated blood discovery works
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm text-muted">
                Every request follows a four-step verification chain so voluntary donors respond to
                authentic inpatient needs.
              </p>
            </div>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Read full workflow guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Surface className="mt-8 grid grid-cols-1 divide-y divide-border/60 p-0 md:grid-cols-4 md:divide-x md:divide-y-0">
            {[
              {
                step: '01',
                title: 'Patient family submits request',
                body: 'An attendant enters required blood group, units, date, and treating hospital ward details.',
              },
              {
                step: '02',
                title: 'Hospital blood bank verifies slip',
                body: 'Authorized transfusion staff confirm the inpatient requisition and check internal stock first.',
              },
              {
                step: '03',
                title: 'Compatible local donors alerted',
                body: 'Available donors in the district receive an opt-in notification without exposing personal phone numbers.',
              },
              {
                step: '04',
                title: 'In-person clinical screening & care',
                body: 'Donors visit the hospital desk for licensed medical screening, cross-matching, and safe donation.',
              },
            ].map((item) => (
              <div key={item.step} className="p-6">
                <span className="font-mono text-xs font-medium text-primary">STEP {item.step}</span>
                <h3 className="mt-2 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </Surface>
        </div>
      </section>

      {/* 3. Blood Group Information & Compatibility Matrix */}
      <section className="bg-surface py-14 sm:py-16">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-5">
              <h2 className="text-title text-foreground">
                Packed red-cell blood group reference
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Select any ABO and Rh group to inspect compatible donor and recipient pairings
                before submitting or responding to a hospital request. Final cross-match testing is
                always performed by hospital pathology staff.
              </p>

              <div className="mt-5 grid grid-cols-4 gap-2">
                {BLOOD_GROUPS.map((group) => {
                  const active = compatibilityGroup === group;
                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setCompatibilityGroup(group)}
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

            <div className="min-w-0 lg:col-span-7">
              <Surface className="divide-y divide-border/60 p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4">
                  <div>
                    <p className="text-xs font-medium text-muted">Selected blood type</p>
                    <h3 className="mt-0.5 text-lg font-semibold text-foreground">
                      Group {selectedCompatibility.group} · {selectedCompatibility.label}
                    </h3>
                  </div>
                  <BloodGroupMark group={selectedCompatibility.group} size="lg" />
                </div>

                <div className="grid grid-cols-1 gap-6 py-4 sm:grid-cols-2 sm:divide-x sm:divide-border/60">
                  <div>
                    <p className="text-xs font-medium text-muted">
                      Can receive packed red cells from
                    </p>
                    <p className="mt-2 text-base font-semibold tabular-nums text-foreground">
                      {selectedCompatibility.canReceiveFrom.join('  ·  ')}
                    </p>
                  </div>
                  <div className="sm:pl-6">
                    <p className="text-xs font-medium text-muted">
                      Can donate packed red cells to
                    </p>
                    <p className="mt-2 text-base font-semibold tabular-nums text-primary">
                      {selectedCompatibility.canDonateTo.join('  ·  ')}
                    </p>
                  </div>
                </div>

                <div className="pt-4 text-sm text-muted">
                  <span className="font-medium text-foreground">Clinical context: </span>
                  {selectedCompatibility.clinicalNote}
                </div>
              </Surface>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Recent Blood Requests & Privacy-Safe Donors */}
      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-title text-foreground">
                Recent hospital blood requests (Demonstration feed)
              </h2>
              <p className="mt-1 text-sm text-muted">
                Active and recently coordinated blood requests across Nepalese districts.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button tone="quiet" size="sm" onClick={() => navigate('/blood-requests')}>
                View all requests ({activeRequests.length})
              </Button>
              <Button size="sm" onClick={() => navigate('/blood-requests?submit=1')}>
                Submit blood request
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {requests.slice(0, 3).map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onSelectRequest={() => navigate(`/blood-requests?highlight=${req.id}`)}
              />
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-end justify-between gap-4 border-t border-border/60 pt-10">
            <div>
              <h2 className="text-title text-foreground">
                Available voluntary donors in directory
              </h2>
              <p className="mt-1 text-sm text-muted">
                Public cards strictly protect phone numbers, email addresses, and home coordinates.
              </p>
            </div>
            <Link
              to="/find-donors"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Browse full donor directory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {donors.slice(0, 4).map((donor) => (
              <DonorCard
                key={donor.id}
                donor={donor}
                onCoordinateRequest={(d) =>
                  navigate(`/blood-requests?submit=1&bloodGroup=${encodeURIComponent(d.bloodGroup)}`)
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Donate Blood + Featured Hospital Coordination */}
      <section className="bg-surface py-14 sm:py-16">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-5">
              <h2 className="text-title text-foreground">
                Why voluntary blood donation matters in Nepal
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Seasonal shortages during Dashain–Tihar holidays, monsoon highway disruptions, and
                rising surgical volume often leave patient families searching ward-to-ward for
                replacement donors.
              </p>

              <div className="mt-6 divide-y divide-border/60 border-t border-border/60">
                {[
                  {
                    title: 'Maternal & obstetric emergencies',
                    detail:
                      'Post-partum hemorrhage remains one of the most time-critical transfusion needs in provincial referral hospitals.',
                  },
                  {
                    title: 'Thalassemia, dialysis & oncology care',
                    detail:
                      'Patients on recurring transfusion schedules depend on predictable voluntary donors every 3–4 weeks.',
                  },
                  {
                    title: 'Zero paid brokerage, regulated clinical care',
                    detail:
                      'Voluntary donation ensures safer blood screening while keeping donor participation completely free of coercion.',
                  },
                ].map((point) => (
                  <div key={point.title} className="py-4">
                    <h3 className="text-sm font-semibold text-foreground">{point.title}</h3>
                    <p className="mt-1 text-sm text-muted">{point.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <SmartImage
                  src={PLATFORM_IMAGES.bloodBankLab}
                  alt="Hospital blood bank cross-matching laboratory and temperature-controlled unit storage"
                  fallbackTitle="Hospital Blood Bank Verification Desk"
                  className="aspect-[4/3] w-full rounded-card border border-border/70 object-cover"
                />
              </div>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-title text-foreground">
                    Featured hospital & blood bank desks (Demo)
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Demonstration institutions illustrating verified stock and cross-match workflows.
                  </p>
                </div>
                <Link
                  to="/hospitals"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  All hospitals & blood banks
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 space-y-5">
                {verifiedHospitals.slice(0, 2).map((hospital) => (
                  <HospitalCard key={hospital.id} hospital={hospital} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials (Demonstration Perspectives) */}
      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-title text-foreground">
              Voices from the coordination workflow (Demonstration perspectives)
            </h2>
            <p className="mt-1 text-sm text-muted">
              Illustrative feedback representing donor, family attendant, and hospital transfusion
              perspectives.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {DEMO_TESTIMONIALS.map((item) => (
              <Surface key={item.id} className="flex flex-col justify-between p-6">
                <p className="text-sm leading-relaxed text-foreground">“{item.quote}”</p>
                <div className="mt-5 border-t border-border/50 pt-3.5">
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted">{item.role}</p>
                </div>
              </Surface>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="bg-surface py-14 sm:py-16">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-4">
              <h2 className="text-title text-foreground">Frequently asked questions</h2>
              <p className="mt-2 text-sm text-muted">
                Key answers on donor privacy, hospital verification, and non-remunerated voluntary
                donation across Nepal.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button tone="quiet" size="sm" onClick={() => navigate('/faq')}>
                  Open full FAQ page
                </Button>
                <Button size="sm" onClick={() => navigate('/contact')}>
                  Contact coordination desk
                </Button>
              </div>
            </div>

            <div className="min-w-0 lg:col-span-8">
              <Surface className="divide-y divide-border/60">
                {PLATFORM_FAQS.slice(0, 5).map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div key={faq.id} className="p-5">
                      <button
                        type="button"
                        onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold text-foreground"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-muted transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
                      )}
                    </div>
                  );
                })}
              </Surface>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
