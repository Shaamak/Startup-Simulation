import 'dotenv/config';
import http from 'http';
import { env } from './config/env';
import { testConnection } from './config/database';
import { redis } from './config/redis';
import { initSocketIO } from './config/socket';
import { createApp } from './app';

async function bootstrap(): Promise<void> {
  // Validate connections before starting
  await testConnection();
  await redis.ping();
  console.log('✅  Redis ping OK');

  const app = createApp();
  const server = http.createServer(app);

  // Initialize Socket.IO
  const io = initSocketIO(server);
  console.log(`✅  Socket.IO initialized`);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await redis.quit();
      console.log('✅  Shutdown complete');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000); // Force exit after 10s
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  server.listen(env.PORT, () => {
    console.log(`\n🚀  Startup Simulator API running on port ${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   Docs: http://localhost:${env.PORT}/health\n`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
