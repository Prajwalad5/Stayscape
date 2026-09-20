'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Loader2, Sparkles, Shield, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function GetStartedPage() {
  const router = useRouter();
  const { user, update } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleBecomeHost = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHost: true }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        // Update the NextAuth JWT session with the new role
        await update({ role: 'HOST', isHost: true });
        toast.success('Welcome! You are now a host.');
        // Hard redirect to force session refresh across the app
        window.location.href = '/host/dashboard';
      } else {
        toast.error(result.error?.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      toast.error('Could not process request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          It&apos;s easy to become a host on StayScape
        </h1>
        <p className="text-xl text-muted-foreground">
          Join thousands of hosts earning extra income by sharing their space.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 my-12">
        <Card>
          <CardHeader>
            <Home className="h-8 w-8 text-primary mb-2" />
            <CardTitle>List your space</CardTitle>
            <CardDescription>Share any space, from a spare room to a private island.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Host with confidence</CardTitle>
            <CardDescription>Our platform provides secure payments and guest verification.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <DollarSign className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Earn money</CardTitle>
            <CardDescription>Set your own price and availability. Get paid quickly after each stay.</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col md:flex-row items-center justify-between p-8 gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Ready to start earning?
            </h2>
            <p className="text-muted-foreground">
              Unlock the host dashboard and create your first listing today.
            </p>
          </div>
          <Button size="lg" className="w-full md:w-auto" onClick={handleBecomeHost} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Become a Host
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
