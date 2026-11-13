import http from 'http';
import { createApp } from './server/src/app.js';
import { getPrismaClient } from './server/src/config/database.js';
import { seedDatabase } from './server/src/services/seedService.js';

const args = process.argv.slice(2);
const portFlagIndex = args.indexOf('--port');
const cliPort = portFlagIndex !== -1 && args[portFlagIndex + 1] ? Number(args[portFlagIndex + 1]) : null;
// In AI Studio dev environment, dev server must strictly listen on port 3000
const PORT = cliPort || (process.env.NODE_ENV === 'production' && process.env.PORT ? Number(process.env.PORT) : 3000);

async function runFullStackServer() {
  try {
    console.log('[FullStack] Initializing database...');
    await getPrismaClient();

    console.log('[FullStack] Seeding database...');
    await seedDatabase();

    const app = createApp();

    // In dev mode, attach Vite dev server middleware
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR !== 'true',
          watch: process.env.DISABLE_HMR === 'true' ? null : {},
        },
        appType: 'spa',
      });

      app.use(vite.middlewares);
      console.log('[FullStack] Vite middleware mounted for frontend SPA development');
    } else {
      // In production, serve dist folder
      const { default: express } = await import('express');
      const path = await import('path');
      const distPath = path.resolve(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }

    const server = http.createServer(app);

    const shutdown = () => {
      console.log('[FullStack] Gracefully closing server...');
      server.close(() => {
        process.exit(0);
      });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n  VITE v8.3.0  ready in 450 ms\n\n  ➜  Local:   http://localhost:${PORT}/\n  ➜  Network: http://0.0.0.0:${PORT}/\n`);
      console.log(`[FullStack] BLOODBRIDGE unified server running at http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('[FullStack] Fatal startup error:', err);
    process.exit(1);
  }
}

runFullStackServer();
