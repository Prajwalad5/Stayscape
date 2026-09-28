const fs = require('fs');
const content = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Understand how StayScape uses cookies.',
};

export default function CookiePolicy() {
  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
      <div className="prose prose-blue max-w-none">
        <p className="text-sm text-muted-foreground mb-8">
          Last Updated: [DATE REQUIRED]
          <br />
          <strong>[LEGAL REVIEW REQUIRED]</strong>
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. What are cookies?</h2>
          <p>Cookies are small text files stored on your device when you access most websites on the internet. We use cookies to enhance your experience, ensure platform security, and understand how our services are used.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Essential Cookies</h2>
          <p>These cookies are strictly necessary to provide you with services available through our website. For example:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Authentication:</strong> Keeping you securely logged in between pages.</li>
            <li><strong>Security:</strong> Preventing CSRF attacks and rate-limiting abusive requests.</li>
          </ul>
          <p>You cannot refuse essential cookies without impacting how our platform functions.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Non-Essential Cookies</h2>
          <p>We may use analytics or third-party cookies (e.g., Google Maps API). You can choose to opt-out of these via the cookie consent banner presented on your first visit.</p>
        </section>
      </div>
    </div>
  );
}`;
fs.mkdirSync('src/app/(public)/cookies', { recursive: true });
fs.writeFileSync('src/app/(public)/cookies/page.tsx', content);
