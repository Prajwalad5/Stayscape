'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { propertySchema } from '@/lib/validators/property';
import { Checkbox } from '@/components/ui/checkbox';
import { PROPERTY_TYPES, ROOM_TYPES, CANCELLATION_POLICIES } from '@/lib/constants';
import Image from 'next/image';
import { LocationPicker } from '@/components/map/location-picker';

export function ListingForm({ initialData, mode = 'create' }: { initialData?: any; mode?: 'create' | 'edit' }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<{ url: string; file?: File }[]>(
    initialData?.images?.map((img: any) => ({ url: img.url })) || []
  );

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData ? {
      ...initialData,
      pricePerNight: initialData.pricePerNight / 100,
      cleaningFee: initialData.cleaningFee / 100,
      amenityIds: initialData.amenities?.map((a: any) => a.amenityId) || [],
    } : {
      pricePerNight: 10,
      pricePerMonth: 0,
      securityDeposit: 0,
      rentalType: 'SHORT_TERM',
      advanceRequired: false,
      fixedTerm: false,
      electricityBillingType: 'INCLUDED',
      waterBillingType: 'INCLUDED',
      internetBillingType: 'INCLUDED',
      cleaningFee: 0,
      maxGuests: 1,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      kitchens: 0,
      livingRooms: 0,
      minNights: 1,
      maxNights: 365,
      isInstantBook: true,
      propertyType: 'HOUSE',
      roomType: 'ENTIRE_PLACE',
      cancellationPolicy: 'FLEXIBLE',
      currency: 'NPR',
      latitude: 0,
      longitude: 0,
    }
  });

  const propertyType = watch('propertyType');
  const currency = watch('currency');
  const roomType = watch('roomType');
  const cancellationPolicy = watch('cancellationPolicy');
  const isInstantBook = watch('isInstantBook');
  const rentalType = watch('rentalType');
  const advanceRequired = watch('advanceRequired');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => ({
        url: URL.createObjectURL(file),
        file,
      }));
      setImages(prev => [...prev, ...newImages].slice(0, 10)); // Max 10 images
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    if (images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    let finalLat = data.latitude;
    let finalLng = data.longitude;

    if (!finalLat || finalLat === 0) {
      const searchAddress = `${data.address ? data.address + ',' : ''} ${data.city || ''}, ${data.country || ''}`.trim();
      if (searchAddress.length > 3) {
        try {
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}`);
          const geoData = await res.json();
          if (geoData.results && geoData.results.length > 0) {
            finalLat = geoData.results[0].geometry.location.lat;
            finalLng = geoData.results[0].geometry.location.lng;
          }
        } catch (e) {
          console.error('Geocoding fallback failed', e);
        }
      }
    }

    if ((!finalLat || finalLat === 0) && (!data.city || !data.country)) {
      toast.error('Please enter a valid city and country or select on map');
      return;
    }

    setIsLoading(true);
    try {
      const imageUrls = images.map(img => ({ url: img.url }));

            const formattedData = {
        ...data,
        latitude: finalLat,
        longitude: finalLng,
        pricePerNight: Math.round(parseFloat(data.pricePerNight || 0) * 100),
        pricePerMonth: Math.round(parseFloat(data.pricePerMonth || 0) * 100),
        pricePerWeek: Math.round(parseFloat(data.pricePerWeek || 0) * 100),
        securityDeposit: Math.round(parseFloat(data.securityDeposit || 0) * 100),
        advanceAmount: Math.round(parseFloat(data.advanceAmount || 0) * 100),
        electricityCharge: Math.round(parseFloat(data.electricityCharge || 0) * 100),
        waterCharge: Math.round(parseFloat(data.waterCharge || 0) * 100),
        internetCharge: Math.round(parseFloat(data.internetCharge || 0) * 100),
        maintenanceCharge: Math.round(parseFloat(data.maintenanceCharge || 0) * 100),
        parkingCharge: Math.round(parseFloat(data.parkingCharge || 0) * 100),
        maxGuests: parseInt(data.maxGuests) || 1,
        bedrooms: parseInt(data.bedrooms) || 0,
        beds: parseInt(data.beds) || 0,
        bathrooms: parseFloat(data.bathrooms) || 0,
        kitchens: parseInt(data.kitchens) || 0,
        livingRooms: parseInt(data.livingRooms) || 0,
        totalRooms: data.totalRooms ? parseInt(data.totalRooms) : null,
        images: imageUrls,
      };

      const endpoint = mode === 'create' ? '/api/properties' : `/api/properties/${initialData.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error?.message || 'Something went wrong');
        if (result.error?.details) toast.error(JSON.stringify(result.error.details).substring(0, 200));
        return;
      }

      toast.success(mode === 'create' ? 'Listing created!' : 'Listing updated!');
      router.push('/host/listings');
      router.refresh();
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); console.log("FORM ERRORS:", errors); handleSubmit(onSubmit)(e); }} className="space-y-8 max-w-4xl pb-24">
      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...register('title')} placeholder="Cozy Cabin in the Woods" disabled={isLoading} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message as string}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...register('description')} className="min-h-[120px]" placeholder="Describe your property..." disabled={isLoading} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select disabled={isLoading} value={currency} onValueChange={(v) => setValue('currency', v)}>
                <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NPR">Nepalese Rupee (NPR)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select disabled={isLoading} value={propertyType} onValueChange={(v) => setValue('propertyType', v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select disabled={isLoading} value={roomType} onValueChange={(v) => setValue('roomType', v)}>
                <SelectTrigger><SelectValue placeholder="Select room type" /></SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader><CardTitle>Location</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <LocationPicker 
            disabled={isLoading}
            initialLocation={initialData ? {
              lat: initialData.latitude,
              lng: initialData.longitude,
              address: initialData.address,
              city: initialData.city,
              state: initialData.state || '',
              country: initialData.country,
              countryCode: initialData.countryCode || '',
              postalCode: initialData.postalCode || '',
              formattedAddress: initialData.formattedAddress || '',
              googlePlaceId: initialData.googlePlaceId || ''
            } : null}
            onChange={(loc) => {
              setValue('address', loc.address, { shouldValidate: true });
              setValue('city', loc.city, { shouldValidate: true });
              setValue('state', loc.state);
              setValue('country', loc.country, { shouldValidate: true });
              setValue('countryCode', loc.countryCode);
              setValue('postalCode', loc.postalCode);
              setValue('latitude', loc.lat);
              setValue('longitude', loc.lng);
              setValue('googlePlaceId', loc.googlePlaceId);
              setValue('formattedAddress', loc.formattedAddress);
            }}
          />
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Street Address</Label>
              <Input {...register('address')} disabled={isLoading} placeholder="e.g. 123 Main St" />
              {errors.address && <p className="text-xs text-red-500">{errors.address.message as string}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input {...register('city')} disabled={isLoading} placeholder="e.g. Birtamod" />
              {errors.city && <p className="text-xs text-red-500">{errors.city.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input {...register('country')} disabled={isLoading} placeholder="e.g. Nepal" />
              {errors.country && <p className="text-xs text-red-500">{errors.country.message as string}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacity & Rooms */}
      <Card>
        <CardHeader><CardTitle>Capacity & Rooms</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {(rentalType === 'MONTHLY' || rentalType === 'LONG_TERM') ? (
            // For Lease / Rental
            <>
              <div className="space-y-2">
                <Label>Total Rooms</Label>
                <Input type="number" {...register('totalRooms')} disabled={isLoading} min={1} />
              </div>
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <Input type="number" {...register('bedrooms')} disabled={isLoading} min={0} />
              </div>
              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <Input type="number" step="0.5" {...register('bathrooms')} disabled={isLoading} min={0} />
              </div>
              <div className="space-y-2">
                <Label>Kitchens</Label>
                <Input type="number" {...register('kitchens')} disabled={isLoading} min={0} />
              </div>
              <div className="space-y-2">
                <Label>Living Rooms</Label>
                <Input type="number" {...register('livingRooms')} disabled={isLoading} min={0} />
              </div>
              <div className="space-y-2 hidden">
                {/* Hidden Defaults for backend */}
                <Input type="hidden" {...register('maxGuests')} value={1} />
                <Input type="hidden" {...register('beds')} value={0} />
              </div>
            </>
          ) : (
            // For Hotel Booking
            <>
              <div className="space-y-2">
                <Label>Max Guests</Label>
                <Input type="number" {...register('maxGuests')} disabled={isLoading} min={1} />
              </div>
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <Input type="number" {...register('bedrooms')} disabled={isLoading} min={0} />
              </div>
              <div className="space-y-2">
                <Label>Beds</Label>
                <Input type="number" {...register('beds')} disabled={isLoading} min={0} />
              </div>
              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <Input type="number" step="0.5" {...register('bathrooms')} disabled={isLoading} min={0} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Rental Configuration & Pricing */}


      <Card>
        <CardHeader><CardTitle>Rental Configuration & Pricing</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rental Type</Label>
              <Select disabled={isLoading} value={rentalType} onValueChange={(v) => setValue('rentalType', v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHORT_TERM">Short Term (Daily/Nightly)</SelectItem>
                  <SelectItem value="MONTHLY">Monthly / Long Term</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select disabled={isLoading} value={watch('currency')} onValueChange={(v) => setValue('currency', v)}>
                <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="NPR">NPR (?)</SelectItem>
                  <SelectItem value="NPR">NPR (??)</SelectItem>
                  <SelectItem value="EUR">EUR (�)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(rentalType === 'MONTHLY' || rentalType === 'LONG_TERM') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Rent</Label>
                  <Input type="number" {...register('pricePerMonth')} disabled={isLoading} min={2000} />
                </div>
                <div className="space-y-2">
                  <Label>Security Deposit</Label>
                  <Input type="number" {...register('securityDeposit')} disabled={isLoading} min={0} />
                </div>
              </div>
              
              <div className="space-y-4 border p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="advanceRequired" 
                    checked={advanceRequired} 
                    onCheckedChange={(c) => setValue('advanceRequired', !!c)} 
                  />
                  <Label htmlFor="advanceRequired">Advance Payment Required?</Label>
                </div>
                
                {advanceRequired && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Advance Type</Label>
                      <Select disabled={isLoading} value={watch('advanceType') || 'MONTHS'} onValueChange={(v) => setValue('advanceType', v)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MONTHS">Number of Months</SelectItem>
                          <SelectItem value="FIXED">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{watch('advanceType') === 'FIXED' ? 'Amount' : 'Months'}</Label>
                      <Input type="number" {...register('advanceAmount')} disabled={isLoading} min={1} />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Duration (Months)</Label>
                  <Input type="number" {...register('minNights')} disabled={isLoading} min={1} />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="fixedTerm" 
                      checked={watch('fixedTerm')} 
                      onCheckedChange={(c) => setValue('fixedTerm', !!c)} 
                    />
                    <Label htmlFor="fixedTerm">Fixed Term Lease?</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border p-4 rounded-lg">
                <h4 className="font-semibold text-sm">Utilities & Additional Charges</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Electricity</Label>
                    <Select disabled={isLoading} value={watch('electricityBillingType')} onValueChange={(v) => setValue('electricityBillingType', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCLUDED">Included in Rent</SelectItem>
                        <SelectItem value="SEPARATE_METER">Separate Meter (Pay per unit)</SelectItem>
                        <SelectItem value="FIXED">Fixed Monthly Charge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {watch('electricityBillingType') === 'FIXED' && (
                    <div className="space-y-2">
                      <Label>Charge Amount</Label>
                      <Input type="number" {...register('electricityCharge')} disabled={isLoading} />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Water</Label>
                    <Select disabled={isLoading} value={watch('waterBillingType')} onValueChange={(v) => setValue('waterBillingType', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCLUDED">Included in Rent</SelectItem>
                        <SelectItem value="FIXED">Fixed Monthly Charge</SelectItem>
                        <SelectItem value="NOT_INCLUDED">Not Included</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {watch('waterBillingType') === 'FIXED' && (
                    <div className="space-y-2">
                      <Label>Charge Amount</Label>
                      <Input type="number" {...register('waterCharge')} disabled={isLoading} />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maintenance / Community Fee</Label>
                    <Input type="number" {...register('maintenanceCharge')} placeholder="0 if none" disabled={isLoading} />
                  </div>
                  <div className="space-y-2">
                    <Label>Parking Fee</Label>
                    <Input type="number" {...register('parkingCharge')} placeholder="0 if none" disabled={isLoading} />
                  </div>
                </div>
              </div>
            </>
          )}

          {rentalType !== 'MONTHLY' && rentalType !== 'LONG_TERM' && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{rentalType === 'WEEKLY' ? 'Price per week' : 'Price per night'}</Label>
                <Input type="number" {...register(rentalType === 'WEEKLY' ? 'pricePerWeek' : 'pricePerNight')} disabled={isLoading} min={1} />
              </div>
              <div className="space-y-2">
                <Label>Cleaning fee</Label>
                <Input type="number" {...register('cleaningFee')} disabled={isLoading} min={0} />
              </div>
              <div className="space-y-2">
                <Label>Minimum Nights</Label>
                <Input type="number" {...register('minNights')} disabled={isLoading} min={1} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Cancellation Policy</Label>
            <Select disabled={isLoading} value={cancellationPolicy} onValueChange={(v) => setValue('cancellationPolicy', v)}>
              <SelectTrigger><SelectValue placeholder="Select policy" /></SelectTrigger>
              <SelectContent>
                {CANCELLATION_POLICIES.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-semibold">Instant Book</Label>
              <p className="text-sm text-muted-foreground">Allow guests to book instantly without approval.</p>
            </div>
            <Switch
              checked={isInstantBook}
              onCheckedChange={(c) => setValue('isInstantBook', c)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Images */}

      {/* Images */}
      <Card>
        <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                <Image src={img.url} alt="Upload preview" fill className="object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeImage(i)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <label className="relative aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm font-medium text-muted-foreground">Upload photos</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isLoading} />
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Listing' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
