export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { PropertySelector } from './property-selector';

export default async function HostCalendarPage({ searchParams }: { searchParams: { propertyId?: string } }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userId = (session.user as any).id;

  const properties = await prisma.property.findMany({
    where: { hostId: userId, deletedAt: null },
    select: { id: true, title: true }
  });

  const selectedPropertyId = searchParams.propertyId || (properties.length > 0 ? properties[0].id : undefined);

  const bookings = selectedPropertyId ? await prisma.booking.findMany({
    where: { 
      propertyId: selectedPropertyId,
      deletedAt: null 
    },
    include: {
      guest: { select: { name: true, image: true } }
    },
    orderBy: { checkIn: 'asc' }
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage availability and view upcoming rentals.</p>
        </div>
        
        {properties.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Property:</span>
            <PropertySelector properties={properties} selectedId={selectedPropertyId} />
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p>No bookings or requests for this property.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.filter(b => b.checkIn && new Date(b.checkIn) >= new Date(new Date().setHours(0,0,0,0))).map(b => (
                  <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="space-y-1 mb-3 sm:mb-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm sm:text-base">
                          {b.checkIn ? format(new Date(b.checkIn), 'MMM d, yyyy') : 'Flexible'} - 
                          {b.checkOut ? format(new Date(b.checkOut), 'MMM d, yyyy') : 'Flexible'}
                        </span>
                        {['PENDING', 'REQUESTED', 'PENDING_APPROVAL'].includes(b.bookingStatus) ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Requested</Badge>
                        ) : (
                          <Badge className="bg-green-600">Occupied / Confirmed</Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Guest: {b.guest?.name || 'Unknown'} � ID: {b.id.substring(0,8)}
                      </p>
                    </div>
                    <div>
                      <a href={`/host/reservations`} className="text-sm text-blue-600 hover:underline">View Details</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-4 h-fit">
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-600"></div>
              <div className="text-sm font-medium">Occupied / Confirmed</div>
            </div>
            <p className="text-xs text-muted-foreground ml-7">Dates are blocked. No other guests can book.</p>
            
            <div className="flex items-center gap-3 mt-4">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              <div className="text-sm font-medium">Requested (Pending)</div>
            </div>
            <p className="text-xs text-muted-foreground ml-7">Dates are still available until you approve the request.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
