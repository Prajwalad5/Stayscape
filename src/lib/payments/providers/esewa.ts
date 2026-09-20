import { PaymentProvider, InitiatePaymentData, PaymentResponse, VerificationResponse } from '../types';

export class EsewaProvider implements PaymentProvider {
  async createPaymentIntent(input: any): Promise<any> { return { success: true }; }
  async verifyPaymentIntent(input: any): Promise<any> { return { success: true, status: 'SUCCESS' }; }
  async refund(input: any): Promise<any> { return { success: true }; }
  async createPayout(input: any): Promise<any> { return { success: true }; }
  async getPaymentStatus(paymentId: string): Promise<any> { return { status: 'SUCCESS' }; }
  async handleWebhook(payload: any, signature: string): Promise<any> { return null; }
  name = 'ESEWA';

  async initiatePayment(data: InitiatePaymentData): Promise<PaymentResponse> {
    // Note: Actual eSewa integration requires server-side secret generation
    // using HMAC SHA256 and submitting to eSewa's standard endpoint.
    return {
      success: true,
      paymentUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
      providerTransactionId: `ESEWA-MOCK-${data.transactionId}`,
    };
  }

  async verifyPayment(verificationData: any): Promise<VerificationResponse> {
    // E.g., validating the signature from eSewa's success callback
    return {
      success: true,
      amount: verificationData.amount || 0,
      currency: 'NPR',
      providerTransactionId: verificationData.refId || 'MOCK_REF',
      status: 'SUCCESS'
    };
  }
}
