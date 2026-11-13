import { getPrismaClient } from '../src/config/database.js';
import { seedDatabase } from '../src/services/seedService.js';

async function runSeed() {
  try {
    console.log('[SeedScript] Initializing database...');
    await getPrismaClient();
    await seedDatabase();
    console.log('[SeedScript] Completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[SeedScript] Failed:', err);
    process.exit(1);
  }
}

runSeed();
