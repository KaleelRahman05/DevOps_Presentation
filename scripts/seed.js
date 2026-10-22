import { seedDatabase } from '../backend/src/utils/seedRunner.js';
import { connectDB, disconnectDB } from '../backend/src/config/db.js';

(async () => {
  try {
    await connectDB();
    await seedDatabase({ quiet: false });
    await disconnectDB();
    console.log('[Seed] Seeding script completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Database seeding failed:', err);
    process.exit(1);
  }
})();
