const fs = require('fs');
let c = fs.readFileSync('src/lib/payments/providers/demo.ts', 'utf8');

// I will remove the duplicate methods I injected.
c = c.replace(/async initiatePayment\(data: any\): Promise<any> \{ return \{ success: true \}; \}/, '');
c = c.replace(/async verifyPayment\(data: any\): Promise<any> \{ return \{ success: true, status: 'SUCCESS' \}; \}/, '');
c = c.replace(/async createPaymentIntent\(input: any\): Promise<any> \{ return \{ success: true \}; \}/, '');
c = c.replace(/async verifyPaymentIntent\(input: any\): Promise<any> \{ return \{ success: true, status: 'SUCCESS' \}; \}/, '');
c = c.replace(/async refund\(input: any\): Promise<any> \{ return \{ success: true \}; \}/, '');
c = c.replace(/async createPayout\(input: any\): Promise<any> \{ return \{ success: true \}; \}/, '');
c = c.replace(/async getPaymentStatus\(paymentId: string\): Promise<any> \{ return \{ status: 'SUCCESS' \}; \}/, '');
c = c.replace(/async handleWebhook\(payload: any, signature: string\): Promise<any> \{ return null; \}/, '');

// Now I will safely append missing interfaces
c = c.replace(/export class DemoPaymentProvider implements PaymentProvider \{/, `export class DemoPaymentProvider implements PaymentProvider {
  async initiatePayment(data: any): Promise<any> { return { success: true, paymentUrl: 'demo', providerTransactionId: 'demo' }; }
  async verifyPayment(data: any): Promise<any> { return { success: true, status: 'SUCCESS', amount: 0, currency: 'NPR', providerTransactionId: 'demo' }; }
  async handleWebhook(payload: any, signature: string): Promise<any> { return null; }
  async verifyPaymentIntent(input: any): Promise<any> { return { success: true, status: 'SUCCESS', verified: true }; }
  async refund(input: any): Promise<any> { return { success: true }; }
`);

fs.writeFileSync('src/lib/payments/providers/demo.ts', c);
