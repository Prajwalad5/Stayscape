export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/auth';
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions';
import { decryptProfileData } from '@/lib/crypto';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default async function AdminGuestProfilePage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user, PERMISSIONS.USERS_VIEW)) {
    redirect('/admin-portal/dashboard?error=unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      bookings: {
        include: { property: { select: { title: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) notFound();

  // Decrypt sensitive info for admin
  const displayEmail = user.encryptedEmail ? decryptProfileData(user.encryptedEmail) : user.email;
  const displayBio = user.encryptedBio ? decryptProfileData(user.encryptedBio) : (user.bio || 'No bio provided');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Guest Profile</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email (Decrypted)</p>
              <p className="font-medium">{displayEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}>{user.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bio (Decrypted)</p>
              <p className="text-sm mt-1 p-3 bg-slate-50 rounded-md border">{displayBio}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="font-medium">{format(new Date(user.createdAt), 'PPP')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Rental History</CardTitle>
          </CardHeader>
          <CardContent>
            {user.bookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">No rental history found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rental ID</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.bookings.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">{b.id.slice(0,8)}</TableCell>
                      <TableCell>{b.property?.title}</TableCell>
                      <TableCell><Badge variant="outline">{b.bookingStatus}</Badge></TableCell>
                      <TableCell className="text-xs">
                        {b.checkIn ? format(new Date(b.checkIn), 'MMM d, yyyy') : 'Flexible'} - 
                        {b.checkOut ? format(new Date(b.checkOut), 'MMM d, yyyy') : 'Flexible'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
