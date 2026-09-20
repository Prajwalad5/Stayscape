'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Key, ShieldAlert, CheckCircle, Edit, Trash2 } from 'lucide-react';

export function EmployeeActions({ employee, isSuperAdmin }: { employee: any, isSuperAdmin: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!isSuperAdmin) {
    return <span className="text-muted-foreground text-xs">View Only</span>;
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/employees/${employee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update');
      toast.success(`Employee status updated to ${newStatus}`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm(`Are you sure you want to completely reset the password for ${employee.name}?`)) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/employees/${employee.id}/reset-password`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset');
      
      // We show the generated password via alert so the super admin can copy it!
      prompt(
        `SUCCESS! Password for ${employee.name} reset.\n\nPlease copy this temporary password IMMEDIATELY. It will not be shown again:`,
        data.data.tempPassword
      );
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {employee.status === 'ACTIVE' ? (
          <DropdownMenuItem onClick={() => handleStatusChange('SUSPENDED')} className="text-orange-600">
            <ShieldAlert className="mr-2 h-4 w-4" /> Suspend Account
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => handleStatusChange('ACTIVE')} className="text-green-600">
            <CheckCircle className="mr-2 h-4 w-4" /> Activate Account
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleResetPassword} className="text-red-600">
          <Key className="mr-2 h-4 w-4" /> Reset Password
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
