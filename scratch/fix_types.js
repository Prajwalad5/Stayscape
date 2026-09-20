const fs = require('fs');
let c = fs.readFileSync('src/lib/payments/types.ts', 'utf8');

c = c.replace(/export interface CreatePaymentInput \{[\s\S]*?\}/, `export interface CreatePaymentInput {
  bookingId: string;
  amount: number;
  currency: string;
  returnUrl?: string;
  description?: string;
}`);

c = c.replace(/export interface PaymentIntentResult \{[\s\S]*?\}/, `export interface PaymentIntentResult {
  success: boolean;
  paymentId?: string;
  clientSecret?: string;
  redirectUrl?: string;
  error?: string;
  providerPaymentId?: string;
  status?: string;
  isDemo?: boolean;
}`);

c = c.replace(/export interface PaymentVerificationResult \{[\s\S]*?\}/, `export interface PaymentVerificationResult {
  success: boolean;
  status: string;
  amount?: number;
  providerPaymentId?: string;
  error?: string;
  verified?: boolean;
}`);

c = c.replace(/export interface VerificationResponse \{[\s\S]*?\}/, `export interface VerificationResponse {
  success: boolean;
  amount: number;
  currency: string;
  providerTransactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'SUCCEEDED';
  error?: string;
  verified?: boolean;
}`);

c = c.replace(/export interface RefundResult \{[\s\S]*?\}/, `export interface RefundResult { success: boolean; refundId?: string; error?: string; providerRefundId?: string; }`);
c = c.replace(/export interface PayoutResult \{[\s\S]*?\}/, `export interface PayoutResult { success: boolean; payoutId?: string; error?: string; providerPayoutId?: string; }`);
c = c.replace(/export interface PaymentStatusResult \{[\s\S]*?\}/, `export interface PaymentStatusResult { status: string; providerPaymentId?: string; }`);
c = c.replace(/export interface WebhookEvent \{[\s\S]*?\}/, `export interface WebhookEvent { type: string; data: any; eventType?: string; }`);

fs.writeFileSync('src/lib/payments/types.ts', c);
