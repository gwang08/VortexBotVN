import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Crash on unhandled rejection so pm2 restarts the process with a fresh
// Telegraf polling loop. Without this, polling can silently die after a
// transient 409/ETIMEDOUT while the Nest HTTP server keeps the process alive.
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] unhandledRejection — forcing pm2 restart:', reason);
  process.exit(1);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
