const fs = require('fs');

let content = fs.readFileSync('src/components/host/listing-form.tsx', 'utf8');

const defaultValuesRegex = /bathrooms: 1,/;
content = content.replace(defaultValuesRegex, `bathrooms: 1,
      kitchens: 0,
      livingRooms: 0,`);

const capacityRegex = /\{\/\* Capacity & Rooms \*\/\}.*?\{\/\* Rental Configuration & Pricing \*\/\}/s;

const newCapacity = `
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
`;

content = content.replace(capacityRegex, newCapacity.trim() + '\n\n');

// Also update the format map 
const formatRegex = /totalRooms:\s*Math\.round\(parseFloat\(data\.totalRooms\)\),/;
// Wait, totalRooms is just an int, we don't need to multiply by 100
let formattedData = `      const formattedData = {
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
      };`;

const formattedDataRegex = /const formattedData = \{[\s\S]*?images: imageUrls,\s*\};/;
content = content.replace(formattedDataRegex, formattedData);

fs.writeFileSync('src/components/host/listing-form.tsx', content);
