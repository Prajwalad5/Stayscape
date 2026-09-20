import { PaymentProvider, InitiatePaymentData, PaymentResponse, VerificationResponse } from '../types';

export class KhaltiProvider implements PaymentProvider {
  async createPaymentIntent(input: any): Promise<any> { return { success: true }; }
  async verifyPaymentIntent(input: any): Promise<any> { return { success: true, status: 'SUCCESS' }; }
  async refund(input: any): Promise<any> { return { success: true }; }
  async createPayout(input: any): Promise<any> { return { success: true }; }
  async getPaymentStatus(paymentId: string): Promise<any> { return { status: 'SUCCESS' }; }
  async handleWebhook(payload: any, signature: string): Promise<any> { return null; }
  name = 'KHALTI';

  async initiatePayment(data: InitiatePaymentData): Promise<PaymentResponse> {
    return {
      success: true,
      paymentUrl: 'https://khalti.com/api/v2/epayment/initiate/',
      providerTransactionId: `KHALTI-MOCK-${data.transactionId}`,
    };
  }

  async verifyPayment(verificationData: any): Promise<VerificationResponse> {
    return {
      success: true,
      amount: verificationData.amount || 0,
      currency: 'NPR',
      providerTransactionId: verificationData.pidx || 'MOCK_PIDX',
      status: 'SUCCESS'
    };
  }
}
