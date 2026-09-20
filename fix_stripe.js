const fs = require("fs");
let content = fs.readFileSync("src/app/api/stripe/webhook/route.ts", "utf8");
content = content.replace(/bookingStatus: .COMPLETED./, "status: \"SUCCEEDED\", provider: \"stripe\", providerPaymentId: paymentIntent.id, paymentMethod: \"stripe\"");
content = content.replace(/bookingStatus: 400/g, "status: 400");
fs.writeFileSync("src/app/api/stripe/webhook/route.ts", content);

