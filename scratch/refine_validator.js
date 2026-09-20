const fs = require('fs');
let c = fs.readFileSync('src/lib/validators/property.ts', 'utf8');

c = c.replace(/  \}\)\)\.optional\(\),\n\}\);/g, `  })).optional(),
}).superRefine((data, ctx) => {
  if (['MONTHLY', 'LONG_TERM'].includes(data.rentalType || '')) {
    if (data.pricePerMonth === undefined || data.pricePerMonth < 2000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum monthly rent should be at least 2000",
        path: ["pricePerMonth"]
      });
    }
  }
});`);

fs.writeFileSync('src/lib/validators/property.ts', c);
