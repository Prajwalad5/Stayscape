import { Skeleton } from '@/components/ui/skeleton';

export default function PropertyLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Skeleton className="h-8 w-2/3 mb-2" />
      <Skeleton className="h-4 w-1/3 mb-6" />
      <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-14 w-14 rounded-full" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
        <div>
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
