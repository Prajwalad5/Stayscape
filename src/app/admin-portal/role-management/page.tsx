import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, ShieldAlert, CheckCircle, Shield } from 'lucide-react';
import { EmployeeActions } from './employee-actions';
import { CreateEmployeeDialog } from './create-employee-dialog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Role Management | Admin Portal',
};

export default async function RoleManagementPage({ searchParams }: { searchParams: { role?: string } }) {
  const session = await auth();
  const sessionUser = session?.user as any;

  if (!sessionUser) {
    redirect('/login');
  }

  // Fetch fresh user data from DB (not stale JWT)
  const freshUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, role: true, adminRole: true },
  });

  if (!freshUser || (freshUser.role !== 'ADMIN' && !freshUser.adminRole)) {
    redirect('/login');
  }

  const isSuperAdmin = freshUser.adminRole === 'SUPER_ADMIN';

  const roleFilter = searchParams.role;
  const whereClause: any = { role: 'ADMIN' };
  if (roleFilter && roleFilter !== 'ALL') {
    whereClause.adminRole = roleFilter;
  }

  // Fetch employees
  const employees = await prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  const allEmployees = await prisma.user.findMany({
    where: { role: 'ADMIN' },
  });

  const stats = {
    total: allEmployees.length,
    active: allEmployees.filter(e => e.status === 'ACTIVE').length,
    suspended: allEmployees.filter(e => e.status === 'SUSPENDED').length,
    bookingAdmins: allEmployees.filter(e => e.adminRole === 'BOOKING_ADMIN').length,
    listingAdmins: allEmployees.filter(e => e.adminRole === 'LISTING_ADMIN').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage internal employees, roles, and administrative access.
          </p>
        </div>
        <CreateEmployeeDialog isSuperAdmin={isSuperAdmin} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Accounts</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
            <ShieldAlert className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.suspended}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dept. Breakdown</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div>Booking: <span className="font-semibold">{stats.bookingAdmins}</span></div>
              <div>Listing: <span className="font-semibold">{stats.listingAdmins}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Link href="?role=ALL"><Badge variant={!roleFilter || roleFilter === 'ALL' ? 'default' : 'outline'} className="px-3 py-1 cursor-pointer">All</Badge></Link>
        <Link href="?role=SUPER_ADMIN"><Badge variant={roleFilter === 'SUPER_ADMIN' ? 'default' : 'outline'} className="px-3 py-1 cursor-pointer">Super Admin</Badge></Link>
        <Link href="?role=BOOKING_ADMIN"><Badge variant={roleFilter === 'BOOKING_ADMIN' ? 'default' : 'outline'} className="px-3 py-1 cursor-pointer">Booking Admin</Badge></Link>
        <Link href="?role=LISTING_ADMIN"><Badge variant={roleFilter === 'LISTING_ADMIN' ? 'default' : 'outline'} className="px-3 py-1 cursor-pointer">Listing Admin</Badge></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Management Team</CardTitle>
          <CardDescription>All internal employees with administrative access.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={emp.image || ''} />
                          <AvatarFallback>{emp.name?.substring(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-900">{emp.name}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5 px-1 py-0.5 bg-slate-100 rounded inline-block">
                            {emp.managementId || `ID: ${emp.id.substring(0, 8)}`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{emp.email}</div>
                      <div className="text-xs text-slate-500">Login: <span className="font-mono">{emp.loginId || emp.email}</span></div>
                      {emp.phone && <div className="text-xs text-slate-400">{emp.phone}</div>}
                    </TableCell>
                    <TableCell>
                      {emp.department || 'General'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-slate-50">
                        {emp.adminRole?.replace(/_/g, ' ') || 'ADMIN'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={emp.status === 'ACTIVE' ? 'default' : 'destructive'}>
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <EmployeeActions employee={emp} isSuperAdmin={isSuperAdmin} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
