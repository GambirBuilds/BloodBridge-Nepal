export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BLOOD_COMPATIBILITY = {
  'O-': {
    group: 'O-',
    label: 'Universal red-cell donor',
    canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
    clinicalNote: 'Essential for emergency trauma care before cross-type verification completes.',
  },
  'O+': {
    group: 'O+',
    label: 'High-demand positive group',
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O+', 'O-'],
    clinicalNote: 'Most frequently requested group in obstetric and surgical wards across Nepal.',
  },
  'A-': {
    group: 'A-',
    label: 'Rh-negative A donor',
    canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['A-', 'O-'],
    clinicalNote: 'Low population prevalence in Nepal; advance hospital coordination recommended.',
  },
  'A+': {
    group: 'A+',
    label: 'Second most common group',
    canDonateTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    clinicalNote: 'Steady hospital demand for scheduled surgeries and hematology support.',
  },
  'B-': {
    group: 'B-',
    label: 'Rh-negative B donor',
    canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['B-', 'O-'],
    clinicalNote: 'Rare donor pool; regional blood bank cross-coordination often needed.',
  },
  'B+': {
    group: 'B+',
    label: 'Common South Asian group',
    canDonateTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    clinicalNote: 'Widely distributed across Terai and Hill districts; strong voluntary network.',
  },
  'AB-': {
    group: 'AB-',
    label: 'Rare plasma & red-cell group',
    canDonateTo: ['AB-', 'AB+'],
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    clinicalNote: 'Rarest red-cell group; plasma is universally compatible across blood types.',
  },
  'AB+': {
    group: 'AB+',
    label: 'Universal red-cell recipient',
    canDonateTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    clinicalNote: 'Patients with AB+ can receive packed red cells from any compatible Rh group.',
  },
};

// Invariant check: O- donates to all 8 groups; AB+ receives from all 8 groups
export function getCompatibleDonorGroups(recipientBloodGroup) {
  const entry = BLOOD_COMPATIBILITY[recipientBloodGroup];
  return entry ? entry.canReceiveFrom : [];
}
