import { PaymentProvider } from './types';
import { EsewaProvider } from './providers/esewa';
import { KhaltiProvider } from './providers/khalti';

export class PaymentService {
  private providers: Map<string, PaymentProvider> = new Map();

  constructor() {
    this.providers.set('ESEWA', new EsewaProvider());
    this.providers.set('KHALTI', new KhaltiProvider());
    // Register IME, Bank Transfer, Cash here as needed
  }

  getProvider(name: string): PaymentProvider {
    const provider = this.providers.get(name.toUpperCase());
    if (!provider) {
      throw new Error(`Payment provider ${name} not supported`);
    }
    return provider;
  }
}

export const paymentService = new PaymentService();
