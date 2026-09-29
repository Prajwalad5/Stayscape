export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    // Note: Signature verification should be done here per provider
    
    const bodyText = await request.text();
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = { raw: bodyText };
    }

    const eventType = body?.type || body?.event || 'unknown';

    await prisma.webhookLog.create({
      data: {
        providerName: params.provider,
        eventType,
        payload: body
      }
    });

    // Process based on provider and eventType asynchronously here if needed
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WebhookPOST error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 });
  }
}