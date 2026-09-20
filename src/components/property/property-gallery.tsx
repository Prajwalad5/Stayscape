'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Grid, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyGalleryProps {
  images: { id: string; url: string; caption?: string | null }[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [showAll, setShowAll] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayImages = images.slice(0, 5);

  return (
    <>
      {/* Grid Layout */}
      <div className="relative overflow-hidden rounded-xl">
        {displayImages.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:grid-rows-2 md:h-[400px]">
            {/* Main image */}
            <div
              className="relative md:col-span-2 md:row-span-2 cursor-pointer aspect-square md:aspect-auto"
              onClick={() => { setCurrentIndex(0); setShowAll(true); }}
            >
              <Image
                src={displayImages[0].url}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Secondary images */}
            {displayImages.slice(1, 5).map((img, i) => (
              <div
                key={img.id}
                className={cn(
                  'relative hidden md:block cursor-pointer',
                  i === 1 && 'rounded-tr-xl',
                  i === 3 && 'rounded-br-xl'
                )}
                onClick={() => { setCurrentIndex(i + 1); setShowAll(true); }}
              >
                <Image
                  src={img.url}
                  alt={`${title} ${i + 2}`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[400px] items-center justify-center bg-muted rounded-xl">
            <MapPin className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}

        {/* Show all button */}
        {images.length > 5 && (
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-4 right-4"
            onClick={() => setShowAll(true)}
          >
            <Grid className="mr-2 h-4 w-4" />
            Show all {images.length} photos
          </Button>
        )}
      </div>

      {/* Fullscreen Gallery */}
      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-5xl h-[90vh] p-0">
          <div className="relative h-full flex items-center justify-center bg-black">
            {images[currentIndex] && (
              <Image
                src={images[currentIndex].url}
                alt={`${title} ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            )}

            {/* Navigation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
              onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
              onClick={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
