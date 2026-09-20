'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Ban, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function AdminUnlistButton({ propertyId, currentStatus }: { propertyId: string, currentStatus: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (currentStatus !== 'PUBLISHED') {
    return (
      <Button variant="outline" size="sm" disabled className="text-xs h-8 opacity-50">
        <Ban className="h-3 w-3 mr-1" />
        Unlisted
      </Button>
    );
  }

  const handleUnlist = async () => {
    if (!confirm('Are you sure you want to forcibly unlist this property? It will immediately be hidden from search results and public view.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/listings/${propertyId}/unlist`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unlist property');
      }

      toast.success('Property successfully unlisted');
      // Trigger Next.js cache refresh
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleUnlist} 
      disabled={isLoading}
      className="text-xs h-8"
    >
      <Trash2 className="h-3 w-3 mr-1" />
      {isLoading ? 'Wait...' : 'Unlist'}
    </Button>
  );
}
