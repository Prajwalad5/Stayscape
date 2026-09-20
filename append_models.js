const fs = require("fs");
let content = fs.readFileSync("prisma/schema.prisma", "utf8");

// Update PlatformSetting
content = content.replace(
  /model PlatformSetting \{\s+id    String @id @default\(cuid\(\)\)\s+key   String @unique\s+value String \s+description String\?\s+createdAt DateTime @default\(now\(\)\)\s+updatedAt DateTime @updatedAt\s+\}/,
  `model PlatformSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String 
  description String?
  isSecret    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}`
);

// Append new models
content += `

// ============================================
// COMMISSIONS & ADS
// ============================================

model CommissionRule {
  id                     String   @id @default(cuid())
  name                   String
  type                   String   // GLOBAL, COUNTRY, HOST, PROPERTY_TYPE
  targetId               String?  // null if GLOBAL, else country code, hostId, etc.
  guestServiceFeePercent Float
  hostCommissionPercent  Float
  fixedFeeAmount         Int      @default(0) // in cents
  isActive               Boolean  @default(true)
  startDate              DateTime?
  endDate                DateTime?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([type, targetId])
  @@index([isActive])
}

model Advertisement {
  id             String   @id @default(cuid())
  title          String
  description    String?
  imageUrl       String?
  targetUrl      String
  placement      String   // HOMEPAGE_BANNER, SEARCH_RESULTS, etc.
  targetAudience String   // ALL, GUESTS, HOSTS
  status         String   @default("DRAFT") // DRAFT, ACTIVE, PAUSED, ENDED
  
  startDate      DateTime?
  endDate        DateTime?
  
  dailyBudget    Int?     // in cents
  totalBudget    Int?     // in cents
  
  impressions    Int      @default(0)
  clicks         Int      @default(0)
  priority       Int      @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
  @@index([placement])
}
`;

fs.writeFileSync("prisma/schema.prisma", content);

