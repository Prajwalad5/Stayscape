import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Shield, Home } from "lucide-react";
import { PropertyCard } from "@/components/property/property-card";
import { format } from "date-fns";

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      properties: {
        where: { status: 'PUBLISHED', deletedAt: null },
        include: {
          images: { where: { isCover: true }, take: 1 },
          host: { select: { name: true, image: true, id: true } },
          reviews: { select: { overallRating: true } }
        }
      },
      reviewsReceived: {
        where: { property: { hostId: params.id } }
      }
    }
  });

  if (!user) notFound();

  const totalReviews = user.reviewsReceived.length;
  const avgRating = totalReviews > 0 ? (user.reviewsReceived.reduce((acc, r) => acc + r.overallRating, 0) / totalReviews).toFixed(1) : "New";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Sidebar Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-8 flex flex-col items-center text-center bg-slate-50 border-b">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-white shadow-sm border">
                {user.image ? (
                  <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300 font-bold text-4xl">
                    {(user.name || "U")[0]}
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</p>
            </CardContent>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm"><Star className="w-4 h-4 text-muted-foreground" /> Reviews</span>
                <span className="font-semibold">{totalReviews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm"><Shield className="w-4 h-4 text-muted-foreground" /> Identity</span>
                <span className="font-semibold">{user.phoneVerified ? 'Verified' : 'Unverified'}</span>
              </div>
              {user.isHost && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><Home className="w-4 h-4 text-muted-foreground" /> Properties</span>
                  <span className="font-semibold">{(user as any).properties.length}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">About {user.name}</h2>
            {user.bio ? (
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{user.bio}</p>
            ) : (
              <p className="text-muted-foreground italic">No information provided yet.</p>
            )}
          </div>

          <div className="w-full h-px bg-border my-8" />

          {user.isHost && (
            <div>
              <h2 className="text-2xl font-bold mb-6">{user.name}&apos;s Listings</h2>
              {(user as any).properties.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {(user as any).properties.map((property: any) => (
                    <PropertyCard key={property.id} property={property as any} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No published listings yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
