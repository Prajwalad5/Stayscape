export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ListingForm } from '@/components/host/listing-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Listing' };

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      amenities: true,
    }
  });

  if (!property) notFound();
  if (property.hostId !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
    redirect('/host/listings');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Edit Listing</h1>
      <p className="text-muted-foreground">Update your property details.</p>
      
      <ListingForm mode="edit" initialData={property} />
    </div>
  );
}
