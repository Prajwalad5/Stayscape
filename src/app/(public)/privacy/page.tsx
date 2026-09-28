import type { Metadata } from 'next';

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
          <strong>[LEGAL REVIEW REQUIRED]</strong> The following is a structural representation of our privacy practices based on our application&apos;s technical architecture. It must be reviewed by qualified legal counsel before official business operation.
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
