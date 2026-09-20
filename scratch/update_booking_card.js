const fs = require('fs');
let c = fs.readFileSync('src/components/booking/booking-card.tsx', 'utf8');

// 1. Remove the checking of startDate for isRental logic
c = c.replace(/if \(isRental && !startDate\) return null;/g, 'if (isRental && !durationMonths) return null;');
c = c.replace(/if \(isRental && !startDate\) \{[\s\S]*?toast\.error\('Please select a move-in date'\);[\s\S]*?return;[\s\S]*?\}/g, '');
c = c.replace(/disabled=\{isLoading \|\| \(isRental \? !startDate : \(!checkIn \|\| !checkOut\)\)\}/g, 'disabled={isLoading || (isRental ? !durationMonths : (!checkIn || !checkOut))}');

// 2. Remove the UI for Move-in Date
const dateUI = `            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase">Move-in Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>`;
c = c.replace(dateUI, '');

// 3. Add more duration options
const durationOptions = `<SelectItem value="12">12 {rentalPeriodLabel}s</SelectItem>`;
const newDurationOptions = `<SelectItem value="12">12 {rentalPeriodLabel}s</SelectItem>
                  <SelectItem value="24">24 {rentalPeriodLabel}s</SelectItem>
                  <SelectItem value="36">36 {rentalPeriodLabel}s</SelectItem>
                  <SelectItem value="48">48 {rentalPeriodLabel}s</SelectItem>
                  <SelectItem value="60">60 {rentalPeriodLabel}s</SelectItem>`;
c = c.replace(durationOptions, newDurationOptions);

// 4. In handleBook, remove payload.startDate and calculate endDate differently
// Previously: payload.startDate = new Date(startDate).toISOString();
// Now we don't have a start date. Let's set it to current date as default?
// No, if it's optional, we can just skip it, or set to null/undefined. The backend accepts optional startDate.
const payloadLogic = `      if (isRental) {
        payload.startDate = new Date(startDate).toISOString();
        if (durationMonths !== '0') {
           const end = new Date(startDate);
           if (property.rentalType === 'WEEKLY') {
             end.setDate(end.getDate() + (parseInt(durationMonths) * 7));
           } else {
             end.setMonth(end.getMonth() + parseInt(durationMonths));
           }
           payload.endDate = end.toISOString();
        }
        payload.durationMonths = parseInt(durationMonths);
      }`;
const newPayloadLogic = `      if (isRental) {
        payload.durationMonths = parseInt(durationMonths);
        // Start date is removed, let backend handle it
      }`;
c = c.replace(payloadLogic, newPayloadLogic);

fs.writeFileSync('src/components/booking/booking-card.tsx', c);
