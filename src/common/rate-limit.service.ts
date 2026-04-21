import { Injectable, Logger } from '@nestjs/common';

// Sliding-window rate limiter. In-memory (per-process).
// Applies to every Telegram update (messages, callback queries) via BotUpdate middleware.

const WINDOW_MS = 10_000;   // 10s window
const MAX_IN_WINDOW = 20;    // max 20 actions per window
const BLOCK_MS = 60_000;     // block further traffic for 60s once exceeded
const CLEANUP_INTERVAL_MS = 5 * 60_000;

type Entry = {
  windowStart: number;
  count: number;
  blockedUntil: number;
  logged: boolean;
};

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly store = new Map<number, Entry>();

  constructor() {
    const timer = setInterval(() => this.cleanup(), CLEANUP_INTERVAL_MS);
    timer.unref?.();
  }

  /** Returns true if allowed, false if the user should be silently dropped. */
  check(userId: number, username?: string | null): boolean {
    const now = Date.now();
    let entry = this.store.get(userId);

    if (!entry) {
      this.store.set(userId, { windowStart: now, count: 1, blockedUntil: 0, logged: false });
      return true;
    }

    if (entry.blockedUntil > now) {
      return false;
    }

    // Window expired -> reset
    if (now - entry.windowStart > WINDOW_MS) {
      entry.windowStart = now;
      entry.count = 1;
      entry.logged = false;
      entry.blockedUntil = 0;
      return true;
    }

    entry.count += 1;
    if (entry.count > MAX_IN_WINDOW) {
      entry.blockedUntil = now + BLOCK_MS;
      if (!entry.logged) {
        this.logger.warn(
          `Rate limit hit: user=${userId}${username ? ` @${username}` : ''} count=${entry.count}/${WINDOW_MS / 1000}s -> block ${BLOCK_MS / 1000}s`,
        );
        entry.logged = true;
      }
      return false;
    }

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [userId, entry] of this.store.entries()) {
      const isIdle = now - entry.windowStart > WINDOW_MS * 6;
      const unblocked = entry.blockedUntil <= now;
      if (isIdle && unblocked) {
        this.store.delete(userId);
      }
    }
  }
}
