const fs = require('fs');
let c = fs.readFileSync('src/lib/payments/types.ts', 'utf8');

c += `\nexport interface PaymentMethodConfig {
  id: string;
  provider: string;
  displayName: string;
  description: string;
  enabled: boolean;
  supportedCurrencies: string[];
  supportsRefunds: boolean;
  supportsPayouts: boolean;
  isDemo?: boolean;
}`;

fs.writeFileSync('src/lib/payments/types.ts', c);
