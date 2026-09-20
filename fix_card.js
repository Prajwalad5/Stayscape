const fs = require("fs");
let content = fs.readFileSync("src/components/booking/booking-card.tsx", "utf8");

content = content.replace(/import \{ formatPrice, calculateNights \} from .@\/lib\/utils.;/, "import { formatCurrency, calculateNights } from \"@/lib/utils\";");
content = content.replace(/formatPrice\(pricePerNight\)/g, "formatCurrency(pricePerNight / 100, currency)");
content = content.replace(/formatPrice\(pricing\.subtotal\)/g, "formatCurrency(pricing.subtotal / 100, currency)");
content = content.replace(/formatPrice\(cleaningFee\)/g, "formatCurrency(cleaningFee / 100, currency)");
content = content.replace(/formatPrice\(pricing\.serviceFee\)/g, "formatCurrency(pricing.serviceFee / 100, currency)");
content = content.replace(/formatPrice\(pricing\.total\)/g, "formatCurrency(pricing.total / 100, currency)");

fs.writeFileSync("src/components/booking/booking-card.tsx", content);
