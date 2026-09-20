import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default async function RentalSuccessPage({ params }: { params: { bookingId: string } }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const userId = (session.user as any).id;

  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId, guestId: userId },
    include: {
      property: { select: { title: true } },
      conversation: { select: { id: true } }
    }
  });

  if (!booking) notFound();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Request Sent Successfully</h1>
        
        <p className="text-slate-600 mb-6 leading-relaxed">
          Thank you for your rental request. Your request has been successfully sent to the host.
          The host will review your request and respond accordingly.
        </p>
        
        <div className="bg-slate-50 p-4 rounded-lg text-left mb-8 space-y-2 border">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Rental ID:</span>
            <span className="font-mono text-sm font-medium">{booking.id.slice(0,8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Property:</span>
            <span className="text-sm font-medium">{booking.property.title}</span>
          </div>
        </div>

        <div className="space-y-3">
          {booking.conversation && (
            <Link href={`/messages/${booking.conversation.id}`}>
              <Button className="w-full" size="lg">Message Host</Button>
            </Link>
          )}
          <Link href="/guest/trips">
            <Button variant="outline" className="w-full" size="lg">View My Rentals</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
