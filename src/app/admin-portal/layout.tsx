import Link from "next/link"
import { Users, Building, DollarSign, LayoutDashboard, Settings, Megaphone, LogOut, BookOpen, BarChart3, ShieldAlert } from "lucide-react"
import { RealTimeListener } from "@/components/admin/real-time-listener"
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions';

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  const sessionUser = session?.user as any;
  
  // Fetch fresh user data from DB (not stale JWT)
  let user: any = sessionUser;
  if (sessionUser?.id) {
    const freshUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, role: true, adminRole: true, permissions: true, status: true },
    });
    if (freshUser) {
      user = { ...sessionUser, ...freshUser };
    }
  }

  const isSuperAdmin = user?.adminRole === 'SUPER_ADMIN';
  const canViewBookings = hasPermission(user, PERMISSIONS.BOOKINGS_VIEW);
  const canViewListings = hasPermission(user, PERMISSIONS.LISTINGS_VIEW);
  const canViewFinance = hasPermission(user, PERMISSIONS.PAYMENTS_VIEW);

  return (
    <RealTimeListener>
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <aside className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-6">
            <h2 className="text-2xl font-bold tracking-tight">StayScape</h2>
            <p className="text-slate-400 text-sm">Control Portal</p>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {isSuperAdmin && (
              <Link href="/admin-portal/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800">
                <LayoutDashboard className="h-5 w-5 text-slate-400" /> Dashboard
              </Link>
            )}
            {isSuperAdmin && (
              <Link href="/admin-portal/users" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800">
                <Users className="h-5 w-5 text-slate-400" /> Users & Hosts
              </Link>
            )}
            {canViewBookings && (
              <Link href="/admin-portal/bookings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800">
                <BookOpen className="h-5 w-5 text-slate-400" /> Rental Management
              </Link>
            )}
            {canViewListings && (
              <Link href="/admin-portal/listings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800">
                <Building className="h-5 w-5 text-slate-400" /> Listings
              </Link>
            )}
            {canViewFinance && (
              <Link href="/admin-portal/finance" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800">
                <DollarSign className="h-5 w-5 text-slate-400" /> Finance & Payouts
              </Link>
            )}
            {isSuperAdmin && (
              <>
                <Link href="/admin-portal/advertisements" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800">
                  <Megaphone className="h-5 w-5 text-slate-400" /> Advertisements
                </Link>
                <Link href="/admin-portal/analytics" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800">
                  <BarChart3 className="h-5 w-5 text-slate-400" /> Analytics
                </Link>
                <Link href="/admin-portal/role-management" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800">
                  <ShieldAlert className="h-5 w-5 text-slate-400" /> Role Management
                </Link>
                <Link href="/admin-portal/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800">
                  <Settings className="h-5 w-5 text-slate-400" /> Settings
                </Link>
              </>
            )}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800 text-red-400">
                <LogOut className="h-5 w-5" /> Sign Out
              </button>
            </form>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </RealTimeListener>
  )
}
