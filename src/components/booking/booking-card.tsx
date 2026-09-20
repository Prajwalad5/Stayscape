'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Loader2, ChevronDown, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, calculateNights } from "@/lib/utils";

interface BookingCardProps {
  property: any;
  isAuthenticated: boolean;
}

export function BookingCard({
  property,
  isAuthenticated,
}: BookingCardProps) {
  const router = useRouter();
  
  const isRental = property.rentalType === 'MONTHLY' || property.rentalType === 'LONG_TERM' || property.rentalType === 'WEEKLY';
  const rentalPeriodLabel = property.rentalType === 'MONTHLY' || property.rentalType === 'LONG_TERM' ? 'Month' : property.rentalType === 'WEEKLY' ? 'Week' : 'Night';
  
  // Hotel state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  
  // Rental state
  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState<string>('1');
  
  const [guests, setGuests] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return calculateNights(new Date(checkIn), new Date(checkOut));
  }, [checkIn, checkOut]);

  const pricing = useMemo(() => {
    if (!isRental && nights <= 0) return null;
    if (isRental && !durationMonths) return null;
    
    let subtotal = 0;
    let baseRate = 0;
    let duration = 0;
    let durationLabel = '';

    if (isRental) {
      if (property.rentalType === 'MONTHLY' || property.rentalType === 'LONG_TERM') {
        baseRate = property.pricePerMonth || 0;
        duration = parseInt(durationMonths) || 1;
        durationLabel = duration === 1 ? 'month' : 'months';
      } else if (property.rentalType === 'WEEKLY') {
        baseRate = property.pricePerWeek || 0;
        duration = parseInt(durationMonths) || 1;
        durationLabel = duration === 1 ? 'week' : 'weeks';
      }
      
      let initialRent = baseRate;
      let advance = 0;
      
      if (property.advanceRequired) {
        if (property.advanceType === 'MONTHS' && property.advanceAmount) {
          advance = baseRate * property.advanceAmount;
        } else if (property.advanceType === 'FIXED' && property.advanceAmount) {
          advance = property.advanceAmount;
        }
      }
      
      subtotal = initialRent;
      const securityDeposit = property.securityDeposit || 0;
      
      const total = initialRent + advance + securityDeposit;
      
      return { isRental: true, initialRent, advance, securityDeposit, total, baseRate, duration, durationLabel };
    } else {
      duration = nights;
      baseRate = property.pricePerNight;
      durationLabel = duration === 1 ? 'night' : 'nights';
      
      subtotal = baseRate * duration;
      const cleaningFee = property.cleaningFee || 0;
      const serviceFee = Math.round(subtotal * (property.serviceFeePercent || 0.12));
      const securityDeposit = property.securityDeposit || 0;
      
      const total = subtotal + cleaningFee + serviceFee + securityDeposit;
      return { isRental: false, subtotal, cleaningFee, serviceFee, securityDeposit, total, duration, baseRate, durationLabel };
    }
  }, [isRental, nights, startDate, durationMonths, property]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to rent this property');
      router.push('/login');
      return;
    }

    if (!isRental && (!checkIn || !checkOut)) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    
    

    if (!isRental) {
      if (nights < property.minNights) {
        toast.error(`Minimum stay is ${property.minNights} nights`);
        return;
      }
      if (nights > property.maxNights) {
        toast.error(`Maximum stay is ${property.maxNights} nights`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload: any = {
        propertyId: property.id,
        guestCount: guests,
      };
      
      if (isRental) {
        payload.durationMonths = parseInt(durationMonths);
        // Start date is removed, let backend handle it
      } else {
        payload.checkIn = new Date(checkIn).toISOString();
        payload.checkOut = new Date(checkOut).toISOString();
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || 'Rental request failed');
        return;
      }

      toast.success(isRental ? 'Rental request created!' : 'Booking created!');
      if (['PENDING_APPROVAL', 'REQUESTED', 'PENDING'].includes(data.data.bookingStatus)) {
        router.push(`/book/${data.data.id}/success`);
      } else {
        router.push(`/book/${data.data.id}`);
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPrimaryPrice = () => {
    if (property.rentalType === 'MONTHLY' || property.rentalType === 'LONG_TERM') return property.pricePerMonth || 0;
    if (property.rentalType === 'WEEKLY') return property.pricePerWeek || 0;
    return property.pricePerNight || 0;
  };

  return (
    <Card className="shadow-lg border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-2xl font-bold">
              {formatCurrency(getPrimaryPrice() / 100, property.currency)}
            </span>
            <span className="text-muted-foreground">
              {` / ${rentalPeriodLabel.toLowerCase()}`}
            </span>
          </div>
          {property.averageRating > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-foreground" />
              <span className="font-semibold">{property.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({property.reviewCount})</span>
            </div>
          )}
        </div>

        {isRental ? (
          <div className="space-y-4 mb-4">

            
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase">Rental Duration</Label>
              <Select value={durationMonths} onValueChange={setDurationMonths}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {!property.fixedTerm && <SelectItem value="0">Month-to-Month (Flexible)</SelectItem>}
                  <SelectItem value="1">1 {rentalPeriodLabel}</SelectItem>
                  <SelectItem value="2">2 {rentalPeriodLabel}s</SelectItem>
                  <SelectItem value="3">3 {rentalPeriodLabel}s</SelectItem>
                  <SelectItem value="6">6 {rentalPeriodLabel}s</SelectItem>
                  <SelectItem value="12">12 {rentalPeriodLabel}s</SelectItem>
                  <SelectItem value="24">24 {rentalPeriodLabel}s</SelectItem>
                  <SelectItem value="36">36 {rentalPeriodLabel}s</SelectItem>
                  <SelectItem value="48">48 {rentalPeriodLabel}s</SelectItem>
                  <SelectItem value="60">60 {rentalPeriodLabel}s</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-0 rounded-lg border overflow-hidden mb-4">
            <div className="p-3 border-r">
              <Label className="text-[10px] font-semibold uppercase">Check-in</Label>
              <Input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="border-0 p-0 h-6 text-sm shadow-none focus-visible:ring-0"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="p-3">
              <Label className="text-[10px] font-semibold uppercase">Checkout</Label>
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="border-0 p-0 h-6 text-sm shadow-none focus-visible:ring-0"
                min={checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        )}

        {isRental && (
          <div className="bg-muted/30 p-3 rounded-lg mb-4 space-y-2 text-sm">
            <p className="font-semibold text-xs uppercase mb-2">Utilities & Charges</p>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Electricity</span>
              <span>{property.electricityBillingType === 'INCLUDED' ? 'Included' : property.electricityBillingType === 'SEPARATE_METER' ? 'Separate Meter' : property.electricityCharge ? formatCurrency(property.electricityCharge / 100, property.currency) : 'Not Included'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Water</span>
              <span>{property.waterBillingType === 'INCLUDED' ? 'Included' : property.waterCharge ? formatCurrency(property.waterCharge / 100, property.currency) : 'Not Included'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Internet</span>
              <span>{property.internetBillingType === 'INCLUDED' ? 'Included' : property.internetCharge ? formatCurrency(property.internetCharge / 100, property.currency) : 'Not Included'}</span>
            </div>
            {property.maintenanceCharge > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maintenance</span>
                <span>{formatCurrency(property.maintenanceCharge / 100, property.currency)}/mo</span>
              </div>
            )}
          </div>
        )}

        <Button
          className="w-full mb-4"
          size="lg"
          onClick={handleBook}
          disabled={isLoading || (isRental ? !durationMonths : (!checkIn || !checkOut))}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isRental ? 'Request to Rent' : (property.isInstantBook ? 'Book Now' : 'Request to Book')}
        </Button>

        {pricing && (
          <div className="space-y-3">
            {pricing.isRental ? (
              <>
                <p className="font-semibold text-sm mb-2">Initial Amount Due</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground underline">First {rentalPeriodLabel} Rent</span>
                  <span>{formatCurrency((pricing.initialRent || 0) / 100, property.currency)}</span>
                </div>
                {(pricing.advance || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground underline">Advance Payment</span>
                    <span>{formatCurrency((pricing.advance || 0) / 100, property.currency)}</span>
                  </div>
                )}
                {pricing.securityDeposit > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground underline">Security Deposit</span>
                    <span>{formatCurrency(pricing.securityDeposit / 100, property.currency)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Initial Total</span>
                  <span>{formatCurrency(pricing.total / 100, property.currency)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground underline">
                    {formatCurrency(pricing.baseRate / 100, property.currency)} x {pricing.duration} {pricing.durationLabel}
                  </span>
                  <span>{formatCurrency((pricing.subtotal || 0) / 100, property.currency)}</span>
                </div>
                {pricing.cleaningFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground underline">Cleaning fee</span>
                    <span>{formatCurrency(pricing.cleaningFee / 100, property.currency)}</span>
                  </div>
                )}
                {(pricing.serviceFee || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground underline">StayScape service fee</span>
                    <span>{formatCurrency((pricing.serviceFee || 0) / 100, property.currency)}</span>
                  </div>
                )}
                {pricing.securityDeposit > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground underline">Security Deposit</span>
                    <span>{formatCurrency(pricing.securityDeposit / 100, property.currency)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(pricing.total / 100, property.currency)}</span>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
