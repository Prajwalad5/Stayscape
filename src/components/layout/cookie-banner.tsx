'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pb-20 sm:pb-6 pointer-events-none">
      <div className="mx-auto max-w-4xl bg-background border shadow-lg rounded-lg p-6 pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground flex-1">
          We use essential cookies to make our platform work (like keeping you logged in). We do not currently use non-essential marketing trackers. By continuing to use our site, you acknowledge our use of essential cookies as described in our{' '}
          <Link href="/privacy" className="underline font-medium hover:text-foreground">
            Privacy Policy
          </Link>.
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={decline} className="flex-1 sm:flex-none">
            Decline Non-Essential
          </Button>
          <Button onClick={accept} className="flex-1 sm:flex-none">
            Acknowledge
          </Button>
        </div>
      </div>
    </div>
  );
}
