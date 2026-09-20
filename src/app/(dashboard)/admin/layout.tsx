import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Navbar } from '@/components/layout/navbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Users,
  Home,
  BookOpen,
  CreditCard,
  AlertTriangle,
  BarChart3,
  Settings,
  Shield,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { RealTimeListener } from '@/components/admin/real-time-listener';

const ADMIN_NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin-portal/listings', icon: Home, label: 'Listings' },
  { href: '/admin-portal/bookings', icon: BookOpen, label: 'Bookings' },
  { href: '/admin-portal/payments', icon: CreditCard, label: 'Payments' },
  { href: '/admin-portal/disputes', icon: AlertTriangle, label: 'Disputes' },
  { href: '/admin-portal/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin-portal/role-management', icon: ShieldAlert, label: 'Role Management' },
  { href: '/admin-portal/settings', icon: Settings, label: 'Settings' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <RealTimeListener>
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r bg-muted/30">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold">Admin Panel</span>
          </div>
          <ScrollArea className="flex-1 px-4 py-4">
            <nav className="space-y-1">
              {ADMIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-8">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to site
              </Link>
            </div>
          </ScrollArea>
        </aside>
        <div className="flex flex-1 flex-col">
          <div className="lg:hidden"><Navbar /></div>
          <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </RealTimeListener>
  );
}
