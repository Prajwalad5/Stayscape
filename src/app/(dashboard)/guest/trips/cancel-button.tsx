'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent triggering the Link wrapper
    
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Guest cancelled from trips page' })
      });
      
      const data = await response.json();
      if (!response.ok || !data.success) {
        toast.error(data.error?.message || 'Failed to cancel booking');
      } else {
        toast.success('Booking cancelled successfully');
        router.refresh();
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleCancel} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
      Cancel Rental
    </Button>
  );
}
