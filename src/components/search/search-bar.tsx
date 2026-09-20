'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, CalendarDays, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="rounded-2xl border bg-background p-2 shadow-lg md:flex md:items-center">
      {/* Location */}
      <div className="flex-1 border-b md:border-b-0 md:border-r px-3 py-2">
        <label className="block text-xs font-semibold text-foreground">Where</label>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            type="text"
            placeholder="Search destinations"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border-0 p-0 h-7 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Check-in */}
      <div className="flex-1 border-b md:border-b-0 md:border-r px-3 py-2">
        <label className="block text-xs font-semibold text-foreground">Check in</label>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="border-0 p-0 h-7 text-sm shadow-none focus-visible:ring-0"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Check-out */}
      <div className="flex-1 border-b md:border-b-0 md:border-r px-3 py-2">
        <label className="block text-xs font-semibold text-foreground">Check out</label>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="border-0 p-0 h-7 text-sm shadow-none focus-visible:ring-0"
            min={checkIn || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Guests */}
      <div className="flex-1 px-3 py-2">
        <label className="block text-xs font-semibold text-foreground">Guests</label>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            type="number"
            placeholder="Add guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="border-0 p-0 h-7 text-sm shadow-none focus-visible:ring-0"
            min={1}
            max={50}
          />
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-2 md:mt-0 md:ml-2">
        <Button onClick={handleSearch} size="lg" className="w-full md:w-auto rounded-xl">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  );
}
