const fs = require('fs');

let content = fs.readFileSync('src/components/host/listing-form.tsx', 'utf8');

const importRegex = /import \{ propertySchema \} from '@\/lib\/validators\/property';/;
content = content.replace(importRegex, "import { propertySchema } from '@/lib/validators/property';\nimport { Checkbox } from '@/components/ui/checkbox';");

const defaultValuesRegex = /pricePerNight: 10,/;
content = content.replace(defaultValuesRegex, `pricePerNight: 10,
      pricePerMonth: 0,
      securityDeposit: 0,
      rentalType: 'SHORT_TERM',
      advanceRequired: false,
      fixedTerm: false,
      electricityBillingType: 'INCLUDED',
      waterBillingType: 'INCLUDED',
      internetBillingType: 'INCLUDED',`);

const watchRegex = /const isInstantBook = watch\('isInstantBook'\);/;
content = content.replace(watchRegex, `const isInstantBook = watch('isInstantBook');
  const rentalType = watch('rentalType');
  const advanceRequired = watch('advanceRequired');`);

const formatRegex = /pricePerNight: Math\.round\(parseFloat\(data\.pricePerNight\) \* 100\),/;
content = content.replace(formatRegex, `pricePerNight: Math.round(parseFloat(data.pricePerNight || 0) * 100),
        pricePerMonth: Math.round(parseFloat(data.pricePerMonth || 0) * 100),
        pricePerWeek: Math.round(parseFloat(data.pricePerWeek || 0) * 100),
        securityDeposit: Math.round(parseFloat(data.securityDeposit || 0) * 100),
        advanceAmount: Math.round(parseFloat(data.advanceAmount || 0) * 100),
        electricityCharge: Math.round(parseFloat(data.electricityCharge || 0) * 100),
        waterCharge: Math.round(parseFloat(data.waterCharge || 0) * 100),
        internetCharge: Math.round(parseFloat(data.internetCharge || 0) * 100),
        maintenanceCharge: Math.round(parseFloat(data.maintenanceCharge || 0) * 100),
        parkingCharge: Math.round(parseFloat(data.parkingCharge || 0) * 100),`);

const pricingSectionRegex = /\{\/\* Pricing & Rules \*\/\}.*?\{\/\* Images \*\/\}/s;

const newPricingSection = `
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
                  <SelectItem value="NPR">NPR (??)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(rentalType === 'MONTHLY' || rentalType === 'LONG_TERM') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Rent</Label>
                  <Input type="number" {...register('pricePerMonth')} disabled={isLoading} min={0} />
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
`;

content = content.replace(pricingSectionRegex, newPricingSection.trim() + '\n\n      {/* Images */}');

fs.writeFileSync('src/components/host/listing-form.tsx', content);
