import { NextResponse } from 'next/server';
import { getAvailablePaymentMethods } from '@/lib/payments';

export async function GET() {
  try {
    const methods = getAvailablePaymentMethods();
    return NextResponse.json({ success: true, data: methods });
  } catch (error) {
    console.error('Payment methods error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}
