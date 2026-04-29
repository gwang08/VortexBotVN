import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Crash on unhandled rejection / uncaught exception so pm2 restarts the
// process with a fresh Telegraf polling loop. Without this, polling can
// silently die after a transient 409/ETIMEDOUT while the Nest HTTP server
// keeps the process alive (zombie state — bot ignores all incoming messages).
// `node_args: --unhandled-rejections=strict` in ecosystem.config.js is a
// belt-and-braces backup if a wrapper (e.g. pm2 cluster mode) intercepts the
// listener.
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] unhandledRejection — forcing pm2 restart:', reason);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('[FATAL] uncaughtException — forcing pm2 restart:', err);
  process.exit(1);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
