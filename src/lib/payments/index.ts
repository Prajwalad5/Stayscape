import { PaymentProvider, PaymentMethodConfig } from './types';
import { DemoPaymentProvider } from './providers/demo';

// Registry of all available providers
const providers: Record<string, () => PaymentProvider> = {
  demo: () => new DemoPaymentProvider(),
  // Future providers:
  // stripe: () => new StripeProvider(),
  // esewa: () => new EsewaProvider(),
  // khalti: () => new KhaltiProvider(),
  // fonepay: () => new FonepayProvider(),
  // bank_transfer: () => new BankTransferProvider(),
};

let cachedProvider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (cachedProvider) return cachedProvider;
  
  const providerName = process.env.PAYMENT_PROVIDER || 'demo';
  const factory = providers[providerName];
  
  if (!factory) {
    console.warn(`Payment provider "${providerName}" not found, falling back to demo`);
    cachedProvider = new DemoPaymentProvider();
    return cachedProvider;
  }

  cachedProvider = factory();
  return cachedProvider;
}

export function getAvailablePaymentMethods(): PaymentMethodConfig[] {
  const provider = process.env.PAYMENT_PROVIDER || 'demo';
  const mode = process.env.PAYMENT_MODE || 'test';
  
  const methods: PaymentMethodConfig[] = [];

  if (provider === 'demo' || mode === 'test') {
    methods.push({
      id: 'demo',
      provider: 'demo',
      displayName: 'Demo Payment',
      description: 'Simulate a payment for testing (no real money)',
      enabled: true,
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'NPR', 'INR', 'AUD', 'CAD', 'JPY', 'AED'],
      supportsRefunds: true,
      supportsPayouts: true,
      isDemo: true,
    });
  }

  if (provider === 'stripe' || process.env.STRIPE_SECRET_KEY) {
    methods.push({
      id: 'stripe_card',
      provider: 'stripe',
      displayName: 'Credit or Debit Card',
      description: 'Pay securely with Visa, Mastercard, or other cards',
      enabled: !!process.env.STRIPE_SECRET_KEY,
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY'],
      supportsRefunds: true,
      supportsPayouts: true,
      isDemo: false,
    });
  }

  if (provider === 'esewa' || process.env.ESEWA_MERCHANT_ID) {
    methods.push({
      id: 'esewa',
      provider: 'esewa',
      displayName: 'eSewa',
      description: 'Pay using your eSewa digital wallet',
      enabled: !!process.env.ESEWA_MERCHANT_ID,
      supportedCurrencies: ['NPR'],
      supportsRefunds: false,
      supportsPayouts: false,
      isDemo: false,
    });
  }

  if (provider === 'khalti' || process.env.KHALTI_SECRET_KEY) {
    methods.push({
      id: 'khalti',
      provider: 'khalti',
      displayName: 'Khalti',
      description: 'Pay using your Khalti digital wallet',
      enabled: !!process.env.KHALTI_SECRET_KEY,
      supportedCurrencies: ['NPR'],
      supportsRefunds: false,
      supportsPayouts: false,
      isDemo: false,
    });
  }

  return methods.filter(m => m.enabled);
}

// Re-export types
export * from './types';
