'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  Calendar,
  BookOpen,
  DollarSign,
  Star,
  MessageSquare,
  Settings,
  Plus,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const HOST_NAV_ITEMS = [
  { href: '/host/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/host/listings', icon: Home, label: 'Listings' },
  { href: '/host/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/host/reservations', icon: BookOpen, label: 'Rentals' },
  { href: '/host/earnings', icon: DollarSign, label: 'Earnings' },
  { href: '/host/reviews', icon: Star, label: 'Reviews' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/host/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/host/settings', icon: Settings, label: 'Settings' },
];

export function HostSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r bg-muted/30">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">
            Stay<span className="text-primary">Scape</span>
          </span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="mb-4">
          <Link href="/host/listings/new">
            <Button className="w-full" size="sm">
              <Plus className="mr-2 h-4 w-4" /> New Listing
            </Button>
          </Link>
        </div>

        <nav className="space-y-1">
          {HOST_NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4" />

        <Link
          href="/guest/trips"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Guest Dashboard
        </Link>
      </ScrollArea>
    </aside>
  );
}
