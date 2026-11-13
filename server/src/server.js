import { createApp } from './src/app.js';
import { getPrismaClient } from './src/config/database.js';
import { config } from './src/config/index.js';
import { seedDatabase } from './src/services/seedService.js';

async function startServer() {
  try {
    console.log('[Server] Connecting to database...');
    await getPrismaClient();

    console.log('[Server] Verifying initial seed data...');
    await seedDatabase();

    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`[Server] BLOODBRIDGE backend server running on port ${config.port} (${config.nodeEnv})`);
    });

    // Graceful shutdown handling
    const shutdown = async () => {
      console.log('[Server] Shutting down gracefully...');
      server.close(async () => {
        const prisma = await getPrismaClient();
        await prisma.$disconnect?.();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('[Server] Fatal error during startup:', err);
    process.exit(1);
  }
}

startServer();
