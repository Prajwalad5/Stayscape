import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms and Conditions for StayScape.',
};

export default function TermsAndConditions() {
  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
      <div className="prose prose-blue max-w-none">
        <p className="text-sm text-muted-foreground mb-8">
          Last Updated: [DATE REQUIRED]
          <br />
          <strong>[LEGAL REVIEW REQUIRED]</strong> The following outlines the operational rules of the platform based on current technical constraints. Must be reviewed by legal counsel.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Platform Role</h2>
          <p>StayScape is an online accommodation marketplace. We facilitate transactions between Guests and Hosts but do not own, manage, or endorse any properties listed on the platform.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Account Responsibilities</h2>
          <p>Users must provide accurate information during registration. You are responsible for maintaining the security of your account credentials.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Rental Workflow</h2>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>REQUESTED:</strong> Submitting a request does not guarantee a booking. It alerts the host for approval.</li>
            <li><strong>PENDING PAYMENT / APPROVED:</strong> Once a host approves, the guest must complete the payment to finalize the reservation.</li>
            <li><strong>CONFIRMED:</strong> Only bookings marked as CONFIRMED in the system are guaranteed.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Reviews & Content Integrity</h2>
          <p>All reviews must represent a genuine stay. Fake reviews, manipulation of ratings, or posting prohibited content will result in account suspension. StayScape reserves the right to moderate and remove content that violates our safety policies.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
          <p>By uploading property or profile images, you grant StayScape a license to display them. You must own the copyright or have explicit permission for any uploaded assets.</p>
        </section>
      </div>
    </div>
  );
}
