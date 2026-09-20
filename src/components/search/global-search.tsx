'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Suggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface GlobalSearchProps {
  initialValue?: string;
  compact?: boolean;
}

export function GlobalSearch({ initialValue = '', compact = false }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/locations/autocomplete?input=${encodeURIComponent(input)}`);
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.data);
        setIsOpen(true);
      }
    } catch {
      // Silently fail, user can still type a manual location
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (suggestion: Suggestion) => {
    setQuery(suggestion.mainText);
    setIsOpen(false);
    setSuggestions([]);

    // Geocode the selected place to get lat/lng
    try {
      const res = await fetch(`/api/locations/geocode?placeId=${suggestion.placeId}`);
      const data = await res.json();
      if (data.success && data.data.bounds) {
        const b = data.data.bounds;
        router.push(`/search?location=${encodeURIComponent(suggestion.mainText)}&north=${b.northeast.lat}&south=${b.southwest.lat}&east=${b.northeast.lng}&west=${b.southwest.lng}`);
      } else {
        router.push(`/search?location=${encodeURIComponent(suggestion.mainText)}`);
      }
    } catch {
      router.push(`/search?location=${encodeURIComponent(suggestion.mainText)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?location=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search destinations worldwide..."
            className={`pl-9 pr-10 ${compact ? 'h-9' : 'h-11'} rounded-full border-border bg-background`}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); setIsOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </form>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-2 w-full bg-background border rounded-xl shadow-lg overflow-hidden max-h-72 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li
              key={s.placeId}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                i === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
              onMouseEnter={() => setSelectedIndex(i)}
              onClick={() => handleSelect(s)}
            >
              <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="font-medium truncate">{s.mainText}</p>
                <p className="text-xs text-muted-foreground truncate">{s.secondaryText}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
