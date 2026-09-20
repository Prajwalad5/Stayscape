'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';

export function ApproveRentButton({ bookingId }: { bookingId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this rental request?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      if (!response.ok || !data.success) {
        toast.error(data.error?.message || 'Failed to approve rental');
      } else {
        toast.success('Rental approved successfully!');
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
      variant="default" 
      size="sm" 
      onClick={handleApprove} 
      disabled={isLoading}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
      Approve Rent
    </Button>
  );
}
