import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import type { BotContext } from './interfaces/session.interface';

// Watchdog that pings Telegram via getMe periodically. If the bot can no longer
// reach Telegram (network outage, token revoked, etc.) for several consecutive
// checks, exit so pm2 restarts the process with a fresh polling loop.
const PING_INTERVAL_MS = 60_000;
const FAILURE_THRESHOLD = 3;

@Injectable()
export class BotHealthService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BotHealthService.name);
  private consecutiveFailures = 0;

  constructor(@InjectBot() private bot: Telegraf<BotContext>) {}

  onApplicationBootstrap(): void {
    // Catch errors thrown inside update handlers so a single bad update
    // doesn't crash the whole process. Polling-loop errors propagate as
    // unhandledRejection (handled in main.ts).
    this.bot.catch((err, ctx) => {
      this.logger.error(
        `Telegraf handler error on update ${ctx.update?.update_id}: ${(err as Error)?.message}`,
        (err as Error)?.stack,
      );
    });

    const timer = setInterval(() => this.ping(), PING_INTERVAL_MS);
    timer.unref?.();
  }

  private async ping(): Promise<void> {
    try {
      await this.bot.telegram.getMe();
      this.consecutiveFailures = 0;
    } catch (err: any) {
      this.consecutiveFailures += 1;
      this.logger.warn(
        `Health ping failed (${this.consecutiveFailures}/${FAILURE_THRESHOLD}): ${err?.message}`,
      );
      if (this.consecutiveFailures >= FAILURE_THRESHOLD) {
        this.logger.error('[FATAL] Bot unreachable — exiting for pm2 restart');
        process.exit(1);
      }
    }
  }
}
