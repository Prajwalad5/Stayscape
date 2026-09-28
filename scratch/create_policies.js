const fs = require('fs');
const path = require('path');

const privacyContent = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for StayScape. Learn how we collect, use, and protect your data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-blue max-w-none">
        <p className="text-sm text-muted-foreground mb-8">
          Last Updated: [DATE REQUIRED]
          <br />
          <strong>[LEGAL REVIEW REQUIRED]</strong> The following is a structural representation of our privacy practices based on our application's technical architecture. It must be reviewed by qualified legal counsel before official business operation.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p>We collect information to operate the StayScape platform effectively:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Account Information:</strong> Name, email address, phone number, and profile image when you register.</li>
            <li><strong>Property Information:</strong> Address, location coordinates (latitude/longitude), and images for hosts listing properties.</li>
            <li><strong>Booking Information:</strong> Rental requests, dates, and guest counts.</li>
            <li><strong>Communications:</strong> Messages sent between guests and hosts via our internal messaging system.</li>
            <li><strong>Financial Information:</strong> Processed securely via our third-party payment providers (e.g., eSewa, Khalti). We do not store raw credit card or bank account numbers on our servers.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>To facilitate property listings, searches, and rental bookings.</li>
            <li>To process payments and refunds safely.</li>
            <li>To allow communication between hosts and guests.</li>
            <li>To moderate reviews and maintain trust across the marketplace.</li>
            <li>To send necessary transactional notifications.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Data Sharing and Exposure</h2>
          <p>We practice data minimization. Publicly, we only expose:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>For Hosts: First name, profile image, and platform join date on property listings.</li>
            <li>For Guests: First name and profile image to the host upon booking requests and reviews.</li>
          </ul>
          <p>We do not sell personal data to third-party marketers.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Cookies and Tracking</h2>
          <p>We use essential session cookies for authentication. Analytics and third-party scripts are outlined in our Cookie Policy. [COOKIE CONFIGURATION TO BE REVIEWED]</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
          <p>If you have privacy-related questions, contact our Data Protection Officer at:</p>
          <p><strong>Email:</strong> [SUPPORT EMAIL REQUIRED]</p>
          <p><strong>Address:</strong> [LEGAL BUSINESS ADDRESS REQUIRED]</p>
        </section>
      </div>
    </div>
  );
}
`;

const termsContent = `import type { Metadata } from 'next';

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
`;

const refundContent = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'Understand StayScape refund and cancellation policies.',
};

export default function RefundPolicy() {
  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Refund & Cancellation Policy</h1>
      <div className="prose prose-blue max-w-none">
        <p className="text-sm text-muted-foreground mb-8">
          Last Updated: [DATE REQUIRED]
          <br />
          <strong>[BUSINESS REVIEW REQUIRED]</strong> The following reflects the technical capabilities of the StayScape backend logic.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Guest Cancellations</h2>
          <p>Guests may cancel their booking from their dashboard. Refunds are automatically calculated based on the specific cancellation policy chosen by the Host for that property (e.g., Flexible, Moderate, Strict).</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>REQUESTED / PENDING:</strong> Can be cancelled without charge as payment has not been processed.</li>
            <li><strong>CONFIRMED:</strong> Cancellations will be subject to the property's stated refund percentages and timing constraints. Service fees may be non-refundable.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Host Cancellations</h2>
          <p>If a Host cancels a confirmed booking, the Guest is entitled to a full refund. Hosts who frequently cancel may face platform penalties or suspension.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Payment Processing</h2>
          <p>All transactions are denominated securely in NPR (Nepalese Rupee) where applicable, unless otherwise explicitly stated in the checkout flow. Refunds are processed back to the original method of payment and may take [X-Y BUSINESS DAYS - REQUIRED] depending on the banking provider.</p>
        </section>
      </div>
    </div>
  );
}
`;

fs.mkdirSync('src/app/(public)/privacy', { recursive: true });
fs.writeFileSync('src/app/(public)/privacy/page.tsx', privacyContent);

fs.mkdirSync('src/app/(public)/terms', { recursive: true });
fs.writeFileSync('src/app/(public)/terms/page.tsx', termsContent);

fs.mkdirSync('src/app/(public)/refund-policy', { recursive: true });
fs.writeFileSync('src/app/(public)/refund-policy/page.tsx', refundContent);
