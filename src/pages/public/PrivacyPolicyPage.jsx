import { Surface } from '../../components/common/ui';

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-display text-foreground">Privacy policy</h1>
        <p className="mt-2 text-sm text-muted">
          Effective date: 11 November 2026 · Aligned with data minimization principles and Nepal’s
          Individual Privacy Act, 2075 (2018).
        </p>
      </div>

      <Surface className="divide-y divide-border/60 p-6 sm:p-8">
        {[
          {
            heading: '1. Public vs. protected donor information',
            body: 'BLOODBRIDGE strictly separates public discovery metadata from private contact credentials. Public donor directory cards display only an approved display name (first name or surname initial), ABO/Rh blood group, district, municipality only when explicitly consented, and general availability preference. Personal phone numbers (+977), email addresses, and exact home coordinates are never displayed publicly.',
          },
          {
            heading: '2. Purpose-bound blood request processing',
            body: 'Information submitted in a patient blood request (requester name, contact number, required blood group, units, and hospital ward context) is processed solely to enable verification by the named hospital blood bank desk and coordinate voluntary donors.',
          },
          {
            heading: '3. No automated medical profiling',
            body: 'BLOODBRIDGE does not collect clinical pathology results or determine medical eligibility during registration. Pre-donation medical screening is conducted exclusively in person by licensed healthcare personnel at the hospital or blood bank.',
          },
          {
            heading: '4. Donor notification & consent controls',
            body: 'Voluntary donors can pause request notifications, change availability status, hide municipality display, or withdraw consent at any time from the Privacy Settings tab of their Donor Dashboard.',
          },
          {
            heading: '5. Part 1 frontend demonstration storage notice',
            body: 'In this Part 1 frontend preview, demonstration records and session edits are stored locally in your browser storage and are not transmitted to an external medical database.',
          },
        ].map((section) => (
          <section key={section.heading} className="py-5 first:pt-0 last:pb-0">
            <h2 className="text-base font-semibold text-foreground">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>
          </section>
        ))}
      </Surface>
    </div>
  );
}
