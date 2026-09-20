import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, formatDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface Review {
  id: string;
  overallRating: number;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location: number;
  checkIn: number;
  value: number;
  comment: string;
  hostResponse: string | null;
  createdAt: Date;
  author: { id: string; name: string | null; image: string | null };
}

interface PropertyReviewsProps {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

const RATING_CATEGORIES = [
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'communication', label: 'Communication' },
  { key: 'location', label: 'Location' },
  { key: 'checkIn', label: 'Check-in' },
  { key: 'value', label: 'Value' },
];

export function PropertyReviews({ reviews, averageRating, reviewCount }: PropertyReviewsProps) {
  if (reviews.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold">Reviews</h3>
        <p className="mt-2 text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  // Calculate average per category
  const categoryAverages = RATING_CATEGORIES.map((cat) => {
    const avg = reviews.reduce((sum, r) => sum + (r as any)[cat.key], 0) / reviews.length;
    return { ...cat, average: avg };
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Star className="h-5 w-5 fill-foreground" />
        <span className="text-xl font-semibold">{averageRating.toFixed(1)}</span>
        <span className="text-muted-foreground">· {reviewCount} reviews</span>
      </div>

      {/* Category Ratings */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
        {categoryAverages.map((cat) => (
          <div key={cat.key} className="flex items-center justify-between">
            <span className="text-sm">{cat.label}</span>
            <div className="flex items-center gap-2">
              <div className="h-1 w-24 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full"
                  style={{ width: `${(cat.average / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-6">{cat.average.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Individual Reviews */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {reviews.map((review) => (
          <div key={review.id}>
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.author.image || undefined} />
                <AvatarFallback>{getInitials(review.author.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{review.author.name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < review.overallRating ? 'fill-foreground text-foreground' : 'text-muted'}`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
            {review.hostResponse && (
              <div className="mt-3 rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium mb-1">Host response:</p>
                <p className="text-xs text-muted-foreground">{review.hostResponse}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
