export interface InitiatePaymentData {
  bookingId: string;
  amount: number;
  currency: string;
  returnUrl?: string;
  transactionId: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  providerTransactionId?: string;
  error?: string;
  clientSecret?: string;
}

export interface VerificationResponse {
  success: boolean;
  amount: number;
  currency: string;
  providerTransactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'SUCCEEDED';
  error?: string;
  verified?: boolean;
}

export interface CreatePaymentInput {
  bookingId: string;
  amount: number;
  currency: string;
  returnUrl?: string;
  description?: string;
}
export interface PaymentIntentResult {
  success: boolean;
  paymentId?: string;
  clientSecret?: string;
  redirectUrl?: string;
  error?: string;
  providerPaymentId?: string;
  status?: string;
  isDemo?: boolean;
}
export interface VerifyPaymentInput {
  paymentId: string;
  providerPaymentId?: string;
}
export interface PaymentVerificationResult {
  success: boolean;
  status: string;
  amount?: number;
  providerPaymentId?: string;
  error?: string;
  verified?: boolean;
}
export interface RefundPaymentInput { paymentId: string; amount?: number; reason?: string; }
export interface RefundResult { success: boolean; refundId?: string; error?: string; providerRefundId?: string; }
export interface CreatePayoutInput { hostId: string; amount: number; currency: string; }
export interface PayoutResult { success: boolean; payoutId?: string; error?: string; providerPayoutId?: string; }
export interface PaymentStatusResult { status: string; providerPaymentId?: string; }
export interface WebhookEvent { type: string; data: any; eventType?: string; }

export interface PaymentProvider {
  name: string;
  initiatePayment(paymentData: InitiatePaymentData): Promise<PaymentResponse>;
  verifyPayment(verificationData: any): Promise<VerificationResponse>;
  createPaymentIntent(input: CreatePaymentInput): Promise<PaymentIntentResult>;
  verifyPaymentIntent(input: VerifyPaymentInput): Promise<PaymentVerificationResult>;
  refund(input: RefundPaymentInput): Promise<RefundResult>;
  createPayout(input: CreatePayoutInput): Promise<PayoutResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatusResult>;
  handleWebhook(payload: any, signature: string): Promise<WebhookEvent | null>;
}

export interface PaymentMethodConfig {
  id: string;
  provider: string;
  displayName: string;
  description: string;
  enabled: boolean;
  supportedCurrencies: string[];
  supportsRefunds: boolean;
  supportsPayouts: boolean;
  isDemo?: boolean;
}