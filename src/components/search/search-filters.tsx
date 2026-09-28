'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { PROPERTY_TYPES, ROOM_TYPES } from '@/lib/constants';

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get('minPrice') || '0'),
    parseInt(searchParams.get('maxPrice') || '1000'),
  ]);

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('minPrice', priceRange[0].toString());
    params.set('maxPrice', priceRange[1].toString());
    params.delete('page');
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    const location = searchParams.get('location');
    if (location) params.set('location', location);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear all
        </Button>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-4">
        <Label className="font-medium">Price range</Label>
        <Slider
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          min={0}
          max={1000}
          step={10}
          className="mt-2"
        />
        <div className="flex items-center justify-between text-sm">
          <span>NPR ${priceRange[0]}</span>
          <span>${priceRange[1]}+</span>
        </div>
        <Button variant="outline" size="sm" onClick={applyPriceFilter} className="w-full">
          Apply price
        </Button>
      </div>

      <Separator />

      {/* Property Type */}
      <div className="space-y-3">
        <Label className="font-medium">Property type</Label>
        {PROPERTY_TYPES.slice(0, 6).map((type) => (
          <div key={type.value} className="flex items-center space-x-2">
            <Checkbox
              id={`type-${type.value}`}
              checked={searchParams.get('propertyType') === type.value}
              onCheckedChange={(checked) =>
                updateFilter('propertyType', checked ? type.value : null)
              }
            />
            <label htmlFor={`type-${type.value}`} className="text-sm cursor-pointer">
              {type.label}
            </label>
          </div>
        ))}
      </div>

      <Separator />

      {/* Room Type */}
      <div className="space-y-3">
        <Label className="font-medium">Room type</Label>
        {ROOM_TYPES.map((type) => (
          <div key={type.value} className="flex items-center space-x-2">
            <Checkbox
              id={`room-${type.value}`}
              checked={searchParams.get('roomType') === type.value}
              onCheckedChange={(checked) =>
                updateFilter('roomType', checked ? type.value : null)
              }
            />
            <label htmlFor={`room-${type.value}`} className="text-sm cursor-pointer">
              {type.label}
            </label>
          </div>
        ))}
      </div>

      <Separator />

      {/* Bedrooms */}
      <div className="space-y-3">
        <Label className="font-medium">Bedrooms</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <Button
              key={num}
              variant={searchParams.get('bedrooms') === num.toString() ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                updateFilter('bedrooms', searchParams.get('bedrooms') === num.toString() ? null : num.toString())
              }
            >
              {num}+
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Instant Book */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="instant-book"
          checked={searchParams.get('instantBook') === 'true'}
          onCheckedChange={(checked) =>
            updateFilter('instantBook', checked ? 'true' : null)
          }
        />
        <label htmlFor="instant-book" className="text-sm cursor-pointer">
          Instant Book only
        </label>
      </div>
    </div>
  );
}
