import type { Metadata } from 'next';

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
            <li><strong>CONFIRMED:</strong> Cancellations will be subject to the property&apos;s stated refund percentages and timing constraints. Service fees may be non-refundable.</li>
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
