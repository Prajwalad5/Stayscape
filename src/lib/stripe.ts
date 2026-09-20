import Stripe from 'stripe';

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  : null;

export function getStripe() {
  if (!stripe) {
    console.warn('Stripe is not configured. Set STRIPE_SECRET_KEY to enable payments.');
    return null;
  }
  return stripe;
}

export const STRIPE_CONFIG = {
  platformFeePercent: 0.12, // 12%
  currency: 'usd',
  paymentMethods: ['card'],
  statementDescriptor: 'STAYSCAPE',
} as const;
