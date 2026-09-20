'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DollarSign, Rocket } from 'lucide-react';
import { toast } from 'sonner';

export function HostPublishButton({ propertyId }: { propertyId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePublishAndPay = async () => {
    if (!confirm('Publishing requires a one-time listing commission fee of $49.00. This is charged by the platform admin. Do you agree to pay this fee?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/host/listings/${propertyId}/pay-publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment failed');
      }

      toast.success('Payment successful! Your property is now PUBLISHED.');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      size="sm" 
      onClick={handlePublishAndPay} 
      disabled={isLoading}
      className="bg-emerald-600 hover:bg-emerald-700 text-white"
    >
      <Rocket className="h-4 w-4 mr-2" />
      {isLoading ? 'Processing...' : 'Pay $49 & Publish'}
    </Button>
  );
}
