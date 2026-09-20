'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function CheckoutClient({ booking, methods }: { booking: any, methods: any[] }) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string>(methods[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Initialize payment (using existing booking)
      const initRes = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          paymentMethodId: selectedMethod
        }),
      });

      const initData = await initRes.json();
      
      // If it's a demo, we simulate success
      if (selectedMethod === 'demo') {
        setTimeout(async () => {
          // 2. Verify payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              providerPaymentId: initData.data?.providerPaymentId || `mock_pi_${Date.now()}`,
              metadata: { action: 'success' }
            }),
          });
          
          if (verifyRes.ok) {
            setPaymentStatus('success');
            toast.success('Payment successful!');
            setTimeout(() => {
              router.push('/guest/trips');
            }, 2000);
          } else {
            setPaymentStatus('failed');
            toast.error('Payment failed to verify.');
          }
          setIsProcessing(false);
        }, 1500);
      } else {
        toast.info('Redirecting to payment provider...');
        // In real flow, redirect to Stripe/eSewa URL here
        setIsProcessing(false);
      }
    } catch (error) {
      console.error(error);
      setPaymentStatus('failed');
      toast.error('An error occurred during payment');
      setIsProcessing(false);
    }
  };

  const property = booking.property;
  const image = property.images?.[0]?.url;

  if (paymentStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-bold">Payment Successful!</h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Your rental at {property.title} is confirmed. Pack your bags!
        </p>
        <p className="text-sm text-muted-foreground">Redirecting to your rentals...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Left Column - Payment Form */}
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Pay with</h2>
          <Card>
            <CardContent className="pt-6">
              <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-4">
                {methods.map((method) => (
                  <div key={method.id} className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                    <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={method.id} className="font-medium flex items-center gap-2 text-base">
                        {method.displayName}
                        {method.isDemo && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-semibold">
                            DEMO
                          </span>
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </section>

        <Separator />

        <section>
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-semibold">Cancellation policy</p>
              <p className="text-sm text-muted-foreground mt-1">
                Review the host's cancellation policy before booking.
              </p>
            </div>
          </div>
        </section>

        <Separator />

        <div className="flex flex-col space-y-4">
          <Button 
            size="lg" 
            className="w-full text-lg" 
            onClick={handlePayment} 
            disabled={isProcessing || !selectedMethod}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              `Confirm and pay`
            )}
          </Button>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span>Payments are securely processed.</span>
          </div>
        </div>
      </div>

      {/* Right Column - Rental Summary */}
      <div>
        <Card className="sticky top-24">
          <CardHeader className="flex flex-row gap-4 border-b pb-6">
            <div className="relative h-24 w-32 rounded-md overflow-hidden bg-muted flex-shrink-0">
              {image ? (
                <Image src={image} alt={property.title} fill className="object-cover" />
              ) : null}
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Rental Property</p>
                <CardTitle className="text-base">{property.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{property.city}, {property.country}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Rental Period</h3>
              <div className="flex justify-between text-sm">
                <span>Move-in</span>
                <span>{formatDate(booking.checkIn)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Move-out</span>
                <span>{formatDate(booking.checkOut)}</span>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-4">Price details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>
                    Base Rent ({booking.rentalType === 'MONTHLY' ? `${booking.durationMonths || 1} months` : booking.rentalType === 'WEEKLY' ? `${booking.totalNights / 7} weeks` : `${booking.totalNights} nights`})
                  </span>
                  <span>{formatCurrency(booking.subtotal / 100, booking.currency)}</span>
                </div>
                {booking.cleaningFee > 0 && (
                  <div className="flex justify-between">
                    <span>Cleaning fee</span>
                    <span>{formatCurrency(booking.cleaningFee / 100, booking.currency)}</span>
                  </div>
                )}
                {booking.serviceFee > 0 && (
                  <div className="flex justify-between">
                    <span>StayScape service fee</span>
                    <span>{formatCurrency(booking.serviceFee / 100, booking.currency)}</span>
                  </div>
                )}
                {booking.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Taxes</span>
                    <span>{formatCurrency(booking.taxAmount / 100, booking.currency)}</span>
                  </div>
                )}
                {booking.securityDepositAmount > 0 && (
                  <div className="flex justify-between text-amber-600 font-medium">
                    <span>Security Deposit (Refundable)</span>
                    <span>{formatCurrency(booking.securityDepositAmount / 100, booking.currency)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total (USD)</span>
              <span>{formatCurrency(booking.totalPrice / 100, booking.currency)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
