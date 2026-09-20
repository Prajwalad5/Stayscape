'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';

export function HostDeleteListingButton({ propertyId }: { propertyId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (!response.ok || !data.success) {
        toast.error(data.error?.message || 'Failed to delete listing');
      } else {
        toast.success('Listing deleted successfully');
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
      size="icon" 
      onClick={handleDelete} 
      disabled={isLoading}
      title="Delete Listing"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
