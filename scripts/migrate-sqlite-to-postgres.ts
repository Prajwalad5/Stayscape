const { PrismaClient: SqliteClient } = require('../prisma/generated/sqlite');
const { PrismaClient: PostgresClient } = require('@prisma/client');

async function migrate() {
  const sqlite = new SqliteClient();
  const postgres = new PostgresClient();

  try {
    console.log("Starting Migration...");
    const models = [
      'user',
      'userProfile',
      'role',
      'userRole',
      'property',
      'propertyImage',
      'amenity',
      'propertyAmenity',
      'listingLocation',
      'booking',
      'bookingGuest',
      'bookingStatusHistory',
      'payment',
      'transaction',
      'hostEarning',
      'review',
      'favorite',
      'conversation',
      'conversationParticipant',
      'message',
      'notification',
      'auditLog',
      'platformSetting'
    ];

    for (const model of models) {
      console.log(`Migrating ${model}...`);
      
      const records = await sqlite[model].findMany();
      if (records.length === 0) {
        console.log(`  - 0 records found.`);
        continue;
      }
      
      let success = 0;
      let failed = 0;
      
      for (const record of records) {
        try {
          await postgres[model].create({ data: record });
          success++;
        } catch (err) {
          console.error(`  - Failed to insert into ${model} [ID: ${record.id}]:`, (err as any).message);
          failed++;
        }
      }
      console.log(`  - Migrated ${success} records. Failed: ${failed}.`);
    }
    
    console.log("Migration completed successfully.");
    
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  }
}

migrate();
