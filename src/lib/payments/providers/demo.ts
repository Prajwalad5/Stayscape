import {
  PaymentProvider,
  CreatePaymentInput,
  PaymentIntentResult,
  VerifyPaymentInput,
  PaymentVerificationResult,
  RefundPaymentInput,
  RefundResult,
  CreatePayoutInput,
  PayoutResult,
  PaymentStatusResult,
  WebhookEvent,
} from "../types";

export class DemoPaymentProvider implements PaymentProvider {
  name = 'demo';

  async initiatePayment(data: any): Promise<any> { return { success: true, paymentUrl: 'demo', providerTransactionId: 'demo' }; }
  async verifyPayment(data: any): Promise<any> { return { success: true, status: 'SUCCESS', amount: 0, currency: 'NPR', providerTransactionId: 'demo', verified: true }; }
  
  async createPaymentIntent(input: CreatePaymentInput): Promise<PaymentIntentResult> {
    const demoId = `demo_pi_${Date.now()}`;
    return { success: true, providerPaymentId: demoId, status: 'PENDING', isDemo: true };
  }

  async verifyPaymentIntent(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    return { success: true, status: 'SUCCEEDED', amount: 0, providerPaymentId: input.providerPaymentId, verified: true };
  }

  async refund(input: RefundPaymentInput): Promise<RefundResult> {
    return { success: true, providerRefundId: `demo_rf_${Date.now()}` };
  }

  async createPayout(input: CreatePayoutInput): Promise<PayoutResult> {
    return { success: true, providerPayoutId: `demo_po_${Date.now()}` };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    return { status: 'SUCCEEDED', providerPaymentId: paymentId };
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookEvent | null> {
    return null;
  }
}
