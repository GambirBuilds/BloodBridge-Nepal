// Demonstration Platform Analytics, Monthly Trends, Testimonials, and FAQs
export const MONTHLY_REQUEST_TRENDS = [
  { month: 'Jun 2026', submitted: 68, verified: 61, fulfilled: 54 },
  { month: 'Jul 2026', submitted: 74, verified: 66, fulfilled: 59 },
  { month: 'Aug 2026', submitted: 89, verified: 80, fulfilled: 73 },
  { month: 'Sep 2026', submitted: 82, verified: 75, fulfilled: 68 },
  { month: 'Oct 2026', submitted: 96, verified: 88, fulfilled: 81 },
  { month: 'Nov 2026', submitted: 104, verified: 94, fulfilled: 86 },
];

export const PROVINCIAL_ACTIVITY_SERIES = [
  { province: 'Bagmati', shortName: 'Bagmati', donors: 412, requests: 148, hospitals: 14 },
  { province: 'Koshi', shortName: 'Koshi', donors: 196, requests: 64, hospitals: 7 },
  { province: 'Gandaki', shortName: 'Gandaki', donors: 168, requests: 52, hospitals: 6 },
  { province: 'Lumbini', shortName: 'Lumbini', donors: 184, requests: 61, hospitals: 6 },
  { province: 'Madhesh', shortName: 'Madhesh', donors: 142, requests: 57, hospitals: 5 },
  { province: 'Sudurpashchim', shortName: 'Sudurpashchim', donors: 94, requests: 33, hospitals: 3 },
  { province: 'Karnali', shortName: 'Karnali', donors: 64, requests: 21, hospitals: 2 },
];

export const BLOOD_GROUP_DISTRIBUTION = [
  { group: 'O+', donors: 398, requests: 142 },
  { group: 'B+', donors: 356, requests: 124 },
  { group: 'A+', donors: 284, requests: 96 },
  { group: 'AB+', donors: 118, requests: 38 },
  { group: 'O-', donors: 42, requests: 16 },
  { group: 'B-', donors: 28, requests: 9 },
  { group: 'A-', donors: 22, requests: 7 },
  { group: 'AB-', donors: 12, requests: 4 },
];

export const DEMO_TESTIMONIALS = [
  {
    id: 'TST-01',
    isDemonstrationRecord: true,
    quote:
      'When my father needed two Rh-negative O units before valve surgery in Kathmandu, hospital verification meant donors trusted the alert immediately instead of questioning social media forwards.',
    name: 'Ramesh Adhikari',
    role: 'Patient Attendant · Kathmandu (Demonstration Account)',
  },
  {
    id: 'TST-02',
    isDemonstrationRecord: true,
    quote:
      'I used to get random late-night calls months after donating. Being able to pause notifications after a donation and keep my personal phone number private makes voluntary giving sustainable.',
    name: 'Anisha Gurung',
    role: 'Voluntary A- Donor · Pokhara, Kaski (Demonstration Account)',
  },
  {
    id: 'TST-03',
    isDemonstrationRecord: true,
    quote:
      'Verifying the ward requisition slip before notifying compatible donors cuts duplicate family panic calls at our cross-match window by more than half.',
    name: 'Dr. Bikash Poudel',
    role: 'Transfusion Officer · Demonstration Teaching Hospital',
  },
];

export const PLATFORM_FAQS = [
  {
    id: 'FAQ-01',
    category: 'Privacy & Safety',
    question: 'Are donor phone numbers or home addresses visible to the public?',
    answer:
      'No. Public donor cards only show an approved display name (such as first name and surname initial), blood group, district, municipality if explicitly consented, and availability preference. Contact coordination happens through verified hospital desks or opt-in platform notifications.',
  },
  {
    id: 'FAQ-02',
    category: 'Donation Process',
    question: 'Does BLOODBRIDGE determine if I am medically eligible to donate blood?',
    answer:
      'No. Registration on BLOODBRIDGE only records your voluntary willingness, blood group, and location preference. Medical screening—including hemoglobin check, blood pressure, weight, and clinical history—is always performed in person by licensed medical staff at the hospital or blood bank prior to any donation.',
  },
  {
    id: 'FAQ-03',
    category: 'Blood Requests',
    question: 'How does hospital verification work when a family submits a blood request?',
    answer:
      'Once a patient or attendant submits a blood request naming the treating hospital, the hospital blood bank desk reviews the inpatient ward and requisition slip. Verified requests receive priority visibility and trigger notifications to compatible voluntary donors in the same district.',
  },
  {
    id: 'FAQ-04',
    category: 'Costs & Ethics',
    question: 'Is there any charge for finding voluntary donors on BLOODBRIDGE?',
    answer:
      'Never. Voluntary blood donation in Nepal is strictly non-remunerated. BLOODBRIDGE charges NPR 0 to patients and donors. Hospitals or blood banks may still charge government-regulated laboratory cross-matching and blood bag screening fees directly at their counter.',
  },
  {
    id: 'FAQ-05',
    category: 'Donor Controls',
    question: 'How do I pause request alerts after donating or while traveling?',
    answer:
      'Sign in to your Donor Dashboard and toggle "Pause request notifications" or switch your availability status to "Temporarily Paused". You can resume notifications whenever you are ready.',
  },
  {
    id: 'FAQ-06',
    category: 'Hospitals',
    question: 'How can a hospital or blood bank in Nepal join the network?',
    answer:
      'Authorized hospital representatives can submit an institutional onboarding form with their MoHP / NPHL registration reference and focal person details. Platform administrators verify credentials before activating request verification privileges.',
  },
];

export const RECENT_ADMIN_ACTIVITIES = [
  {
    id: 'ACT-01',
    timestamp: '11 Nov 2026 · 09:02',
    actor: 'Dr. Bikash Poudel',
    role: 'Hospital',
    summary: 'Verified inpatient requisition #CT-892 for request REQ-NP-2083 (2 units O-).',
  },
  {
    id: 'ACT-02',
    timestamp: '11 Nov 2026 · 07:30',
    actor: 'Dr. Rekha Pandey',
    role: 'Hospital Applicant',
    summary: 'Submitted institutional verification credentials for Lumbini Siddhartha Specialty Hospital (Demo).',
  },
  {
    id: 'ACT-03',
    timestamp: '10 Nov 2026 · 16:55',
    actor: 'Ramesh Adhikari',
    role: 'Requester',
    summary: 'Created scheduled surgical reserve request REQ-NP-2081 (1 unit B+).',
  },
  {
    id: 'ACT-04',
    timestamp: '10 Nov 2026 · 11:20',
    actor: 'Pratiksha KC',
    role: 'Administrator',
    summary: 'Flagged expired cold-chain calibration document on Seti Far-West Community Clinic (Demo).',
  },
  {
    id: 'ACT-05',
    timestamp: '09 Nov 2026 · 18:05',
    actor: 'Suman Thapa',
    role: 'Donor',
    summary: 'Confirmed active availability for Kathmandu Metropolitan City alerts.',
  },
];
