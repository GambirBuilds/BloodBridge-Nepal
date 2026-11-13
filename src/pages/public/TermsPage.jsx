import { Surface } from '../../components/common/ui';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-display text-foreground">Terms and conditions</h1>
        <p className="mt-2 text-sm text-muted">
          Last updated: 11 November 2026 · Platform governance rules for voluntary donors,
          requesters, and healthcare institutions.
        </p>
      </div>

      <Surface className="divide-y divide-border/60 p-6 sm:p-8">
        {[
          {
            heading: '1. Strictly voluntary, non-remunerated donation',
            body: 'Soliciting, offering, or accepting financial payment or commercial brokerage in exchange for blood donation is strictly prohibited on BLOODBRIDGE and violates national blood transfusion policy in Nepal. Immediate account suspension applies to any violation.',
          },
          {
            heading: '2. Clinical responsibility & medical screening',
            body: 'BLOODBRIDGE is a discovery and hospital coordination platform, not a clinical provider or emergency ambulance dispatch service. All medical eligibility screening, infectious disease testing, ABO/Rh cross-matching, and transfusion administration remain the sole responsibility of licensed hospitals and blood banks.',
          },
          {
            heading: '3. Accurate inpatient blood requests',
            body: 'Requesters agree to submit truthful patient and hospital ward details and promptly cancel a request if blood units are arranged through internal hospital stock or alternative sources.',
          },
          {
            heading: '4. Institutional verification requirement',
            body: 'Hospital and blood bank accounts must submit valid MoHP / NPHL registration credentials and authorized focal officer details. Verification privileges activate only after administrator review.',
          },
          {
            heading: '5. Demonstration data & preview disclaimer',
            body: 'All pre-populated people, hospitals, blood requests, unit counts, and testimonials in this Part 1 application are demonstration records created for frontend evaluation and must not be relied upon as real-time clinical inventory.',
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
