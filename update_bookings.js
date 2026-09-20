const fs = require("fs");
let content = fs.readFileSync("src/app/api/bookings/route.ts", "utf8");

// Remove import
content = content.replace(/import \{ PLATFORM_FEE_PERCENT \} from .@\/lib\/constants.;\n/, "");

const newCalc = `      // SERVER-SIDE price calculation with DYNAMIC COMMISSION
      const nightlyRate = property.pricePerNight;
      const subtotal = nightlyRate * nights;
      const cleaningFee = property.cleaningFee;
      
      // Fetch active commission rule
      const rule = await prisma.commissionRule.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" }
      });
      
      const guestFeePercent = rule ? rule.guestServiceFeePercent : 10;
      const hostCommPercent = rule ? rule.hostCommissionPercent : 3;

      const serviceFee = Math.round(subtotal * (guestFeePercent / 100));
      const taxAmount = 0;
      const totalPrice = subtotal + cleaningFee + serviceFee + taxAmount;
      
      const processingFee = Math.round((subtotal + cleaningFee) * (hostCommPercent / 100));`;

content = content.replace(
  /      \/\/ SERVER-SIDE price calculation \(NEVER trust client pricing\)\n      const nightlyRate = property\.pricePerNight;\n      const subtotal = nightlyRate \* nights;\n      const cleaningFee = property\.cleaningFee;\n      const serviceFee = Math\.round\(subtotal \* PLATFORM_FEE_PERCENT\);\n      const taxAmount = 0;\n      const totalPrice = subtotal \+ cleaningFee \+ serviceFee \+ taxAmount;\n      \n      const hostProcessingFeePercent = 3;\n      const processingFee = Math\.round\(\(subtotal \+ cleaningFee\) \* \(hostProcessingFeePercent \/ 100\)\);/,
  newCalc
);

fs.writeFileSync("src/app/api/bookings/route.ts", content);

