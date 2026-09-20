'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, CalendarDays, MessageSquare, User } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-session';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/search', icon: Search, label: 'Explore' },
  { href: '/guest/favorites', icon: Heart, label: 'Saved', auth: true },
  { href: '/guest/trips', icon: CalendarDays, label: 'Trips', auth: true },
  { href: '/messages', icon: MessageSquare, label: 'Messages', auth: true },
  { href: '/guest/profile', icon: User, label: 'Profile', auth: false },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useCurrentUser();

  // Don't show on host or admin dashboards
  if (pathname?.startsWith('/host') || pathname?.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          if (item.auth && !isAuthenticated) {
            return (
              <Link
                key={item.href}
                href="/login"
                className="flex flex-col items-center gap-1 px-3 py-1 text-muted-foreground"
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          }

          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'fill-primary/20')} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
