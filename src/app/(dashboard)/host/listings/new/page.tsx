import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ListingForm } from '@/components/host/listing-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Create New Listing' };

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create New Listing</h1>
      <p className="text-muted-foreground">Fill out the details below to publish your property on StayScape.</p>
      
      <ListingForm mode="create" />
    </div>
  );
}
