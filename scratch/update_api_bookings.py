import re

with open('src/app/api/bookings/route.ts', 'r') as f:
    content = f.read()

replacement = """
    // SERVER-SIDE price calculation with DYNAMIC COMMISSION
    const rentalType = property.rentalType || 'SHORT_TERM';
    const isRental = rentalType === 'MONTHLY' || rentalType === 'LONG_TERM' || rentalType === 'WEEKLY';
    let duration = 0;
    let baseRate = 0;
    let subtotal = 0;
    let serviceFee = 0;
    let cleaningFee = property.cleaningFee || 0;
    let advance = 0;
    const securityDeposit = property.securityDeposit || 0;
    const taxAmount = 0;
    let totalPrice = 0;
    let processingFee = 0;
    let hostPayoutAmount = 0;
    
    // Fetch active commission rule
    const rule = await prisma.commissionRule.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
    const guestFeePercent = rule ? rule.guestServiceFeePercent : 10;
    const hostCommPercent = rule ? rule.hostCommissionPercent : 3;
    
    if (isRental) {
      if (rentalType === 'MONTHLY' || rentalType === 'LONG_TERM') {
        baseRate = property.pricePerMonth || 0;
        duration = body.durationMonths || 1;
      } else if (rentalType === 'WEEKLY') {
        baseRate = property.pricePerWeek || 0;
        duration = body.durationMonths || 1;
      }
      
      let initialRent = baseRate;
      if (property.advanceRequired) {
        if (property.advanceType === 'MONTHS' && property.advanceAmount) {
          advance = baseRate * property.advanceAmount;
        } else if (property.advanceType === 'FIXED' && property.advanceAmount) {
          advance = property.advanceAmount;
        }
      }
      
      subtotal = initialRent;
      totalPrice = initialRent + advance + securityDeposit;
      serviceFee = 0; // Rentals typically do not have hotel service fees per night
      cleaningFee = 0; 
      
      processingFee = Math.round(totalPrice * (hostCommPercent / 100));
      hostPayoutAmount = totalPrice - processingFee;
    } else {
      duration = nights;
      baseRate = property.pricePerNight;
      subtotal = baseRate * duration;
      serviceFee = Math.round(subtotal * (guestFeePercent / 100));
      totalPrice = subtotal + cleaningFee + serviceFee + taxAmount + securityDeposit;
      
      processingFee = Math.round((subtotal + cleaningFee) * (hostCommPercent / 100));
      hostPayoutAmount = subtotal + cleaningFee - processingFee;
    }

    const nightlyRate = baseRate; // map for backward compatibility
"""

# Find the block to replace
pattern = r"// SERVER-SIDE price calculation with DYNAMIC COMMISSION.*?const hostPayoutAmount = subtotal \+ cleaningFee - processingFee;"
new_content = re.sub(pattern, replacement.strip(), content, flags=re.DOTALL)

with open('src/app/api/bookings/route.ts', 'w') as f:
    f.write(new_content)
