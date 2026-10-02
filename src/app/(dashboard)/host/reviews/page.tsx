export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

export default async function HostReviewsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userId = (session.user as any).id;

  const reviews = await prisma.review.findMany({
    where: { 
      property: { hostId: userId }
    },
    include: {
      author: { select: { name: true, image: true } },
      property: { select: { title: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.overallRating, 0) / totalReviews).toFixed(1) : 0;
  
  const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const rating = Math.round(r.overallRating);
    if (rating >= 1 && rating <= 5) {
      ratingDist[rating as keyof typeof ratingDist]++;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground mt-1">Read what guests are saying about your properties.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-4 h-fit">
          <CardHeader>
            <CardTitle>Overall Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl font-bold">{avgRating}</div>
              <div className="flex flex-col">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-5 w-5 ${s <= parseFloat(avgRating as string) ? 'fill-current' : 'text-slate-200'}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{totalReviews} reviews</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDist[stars as keyof typeof ratingDist];
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <div className="w-12 text-muted-foreground flex items-center">{stars} <Star className="h-3 w-3 ml-1" /></div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className="w-8 text-right text-muted-foreground">{count}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-8 space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Star className="h-10 w-10 text-slate-200 mb-2" />
                <p>No reviews yet. Keep hosting!</p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        {review.author?.image ? (
                          <img src={review.author.image} alt={review.author.name || 'Guest'} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-slate-400 font-bold">{(review.author?.name || 'G')[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{review.author?.name || 'Anonymous Guest'}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(review.createdAt), 'MMMM yyyy')} � {review.property.title}</p>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-4 w-4 ${s <= review.overallRating ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
