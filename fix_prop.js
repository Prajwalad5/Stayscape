const fs = require("fs");
let schema = fs.readFileSync("src/lib/validators/property.ts", "utf8");

schema = schema.replace(/maxGuests: z\.number\(\)/g, "maxGuests: z.coerce.number()");
schema = schema.replace(/bedrooms: z\.number\(\)/g, "bedrooms: z.coerce.number()");
schema = schema.replace(/beds: z\.number\(\)/g, "beds: z.coerce.number()");
schema = schema.replace(/bathrooms: z\.number\(\)/g, "bathrooms: z.coerce.number()");
schema = schema.replace(/pricePerNight: z\.number\(\)\.int\(\)\.min\(100, .Minimum price is \$1\.00.\)/g, "pricePerNight: z.coerce.number().int().min(10, \"Minimum price is $10\")");
schema = schema.replace(/cleaningFee: z\.number\(\)/g, "cleaningFee: z.coerce.number()");
schema = schema.replace(/minNights: z\.number\(\)/g, "minNights: z.coerce.number()");
schema = schema.replace(/maxNights: z\.number\(\)/g, "maxNights: z.coerce.number()");

fs.writeFileSync("src/lib/validators/property.ts", schema);
console.log("Updated property.ts");
