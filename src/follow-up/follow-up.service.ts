import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import {
  FOLLOWUP_SCHEDULE_HOURS,
  MAX_FOLLOWUP_COUNT,
  VIP_MAX_FOLLOWUP_COUNT,
  PUPRIME_SIGNUP_LINK,
  ULTIMA_SIGNUP_LINK,
  VANTAGE_SIGNUP_LINK,
} from '../common/constants';

// Telegram channel links for each system
const GROK_CHANNEL = 'https://t.me/GrokAIGold';
const BMR_COPY_CHANNEL = 'https://t.me/BMRCopyTrade';
const BMR_SCALPER_CHANNEL = 'https://t.me/BMRGoldScalper';

// VIP contact (VN admin)
const KEN_VN = 'https://t.me/FinBMR';

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

@Injectable()
export class FollowUpService implements OnModuleInit {
  private readonly logger = new Logger(FollowUpService.name);
  private botUsername = '';

  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    try {
      const me = await this.bot.telegram.getMe();
      this.botUsername = me.username || '';
    } catch (e: any) {
      this.logger.warn(`Failed to get bot username: ${e.message}`);
    }
    setInterval(() => this.processFollowUps(), CHECK_INTERVAL_MS);
    this.logger.log('Follow-up scheduler started (5-min interval)');
  }

  async processFollowUps(): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: {
        status: { notIn: ['done', 'vip_contacted'] },
        followUpCount: { lt: MAX_FOLLOWUP_COUNT },
      },
    });

    const now = new Date();

    for (const user of users) {
      if (user.isVip && user.followUpCount >= VIP_MAX_FOLLOWUP_COUNT) continue;
      if (!this.canSendFollowUp(user, now)) continue;

      const message = this.getFollowUpMessage(user);
      if (!message) continue;

      try {
        await this.bot.telegram.sendMessage(user.id.toString(), message.text, message.extra);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { followUpCount: { increment: 1 }, lastFollowUpAt: now },
        });
      } catch (error: any) {
        if (error.response?.error_code === 403) {
          this.logger.warn(`User ${user.id} blocked bot, skipping`);
          await this.prisma.user.update({
            where: { id: user.id },
            data: { followUpCount: MAX_FOLLOWUP_COUNT },
          });
        } else {
          this.logger.error(`Follow-up failed for user ${user.id}: ${error.message}`);
        }
      }
    }
  }

  private canSendFollowUp(user: any, now: Date): boolean {
    if (!user.lastFollowUpAt) {
      const hoursSinceCreation = (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceCreation >= FOLLOWUP_SCHEDULE_HOURS[0];
    }
    const count = user.followUpCount;
    if (count >= FOLLOWUP_SCHEDULE_HOURS.length) return false;
    const requiredHours = FOLLOWUP_SCHEDULE_HOURS[count];
    const hoursSinceLast = (now.getTime() - user.lastFollowUpAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceLast >= requiredHours;
  }

  private botUrl(): string {
    return this.botUsername ? `https://t.me/${this.botUsername}` : 'https://t.me/BMRTradingbotVN';
  }

  // 3 system channel buttons (Grok / BMR Copy / BMR Scalper)
  private systemsKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.url('🤖 Grok AI Gold', GROK_CHANNEL)],
      [Markup.button.url('🏆 BMR Copy Trading', BMR_COPY_CHANNEL)],
      [Markup.button.url('🚀 BMR Scalper Gold', BMR_SCALPER_CHANNEL)],
    ]);
  }

  // 3 broker register buttons (PU Prime / Ultima / Vantage)
  private brokersKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.url('🔥 PU Prime', PUPRIME_SIGNUP_LINK)],
      [Markup.button.url('🔥 Ultima Markets', ULTIMA_SIGNUP_LINK)],
      [Markup.button.url('🔥 Vantage', VANTAGE_SIGNUP_LINK)],
    ]);
  }

  private getFollowUpMessage(user: any): { text: string; extra?: any } | null {
    const count = user.followUpCount;

    // #0 (~10 phút) — Choose system
    if (count === 0) {
      return {
        text: 'Chọn hệ thống của bạn:\n\n🤖 Grok AI Gold\n🏆 BMR Copy Trading\n🚀 BMR Scalper Gold',
        extra: this.systemsKeyboard(),
      };
    }

    // #1 (~1h) — System ↔ Broker pairing
    if (count === 1) {
      return {
        text: 'Top hệ thống Copy Trading:\n\nGrok AI Gold — PU Prime\nBMR Copy Trading — Ultima Markets\nBMR Scalper Gold — Vantage\n\nBắt đầu Copy Trading hôm nay',
        extra: Markup.inlineKeyboard([
          [Markup.button.url('Grok AI Gold — PU Prime', PUPRIME_SIGNUP_LINK)],
          [Markup.button.url('BMR Copy Trading — Ultima', ULTIMA_SIGNUP_LINK)],
          [Markup.button.url('BMR Scalper Gold — Vantage', VANTAGE_SIGNUP_LINK)],
        ]),
      };
    }

    // #2 (~24h) — Entry-level split
    if (count === 2) {
      return {
        text: 'Đa số nhà đầu tư bắt đầu với:\n\n$500 — Copy Trading\n$1000 — Truy cập VIP\n\nChọn hệ thống của bạn ngay',
        extra: Markup.inlineKeyboard([
          [Markup.button.url('$500 — Copy Trading', this.botUrl())],
          [Markup.button.url('$1000 — Truy cập VIP', KEN_VN)],
        ]),
      };
    }

    // #3 (~2 ngày) — New traders joined
    if (count === 3) {
      return {
        text: 'Nhà đầu tư mới đã tham gia hôm nay\n\n🤖 Grok AI Gold\n🏆 BMR Copy Trading\n🚀 BMR Scalper Gold\n\nĐừng bỏ lỡ cơ hội',
        extra: this.systemsKeyboard(),
      };
    }

    // #4 (~3 ngày) — Copy trading advantages
    if (count === 4) {
      return {
        text: 'Lợi thế Copy Trading:\n\n✅ Không cần kinh nghiệm\n✅ Hoàn toàn tự động\n✅ Chiến lược chuyên nghiệp',
        extra: this.systemsKeyboard(),
      };
    }

    // #5 (~5 ngày) — Three brokers
    if (count === 5) {
      return {
        text: '3 Hệ thống hàng đầu\n\nPU Prime\nUltima Markets\nVantage\n\nChọn broker bạn muốn',
        extra: this.brokersKeyboard(),
      };
    }

    // #6 (~7 ngày) — VIP package → Ken
    if (count === 6) {
      return {
        text: 'Gói VIP:\n\nTín hiệu\nKhoá học\nCopy Trading\nCộng đồng',
        extra: Markup.inlineKeyboard([
          [Markup.button.url('👑 Liên hệ VIP', KEN_VN)],
        ]),
      };
    }

    // #7 (~10 ngày) — Start small
    if (count === 7) {
      return {
        text: 'Nhiều nhà đầu tư bắt đầu nhỏ\n\nSau đó scale khi có lợi nhuận\n\nBắt đầu hôm nay',
        extra: Markup.inlineKeyboard([
          [Markup.button.url('💬 Bắt đầu hôm nay', KEN_VN)],
        ]),
      };
    }

    // #8 (~15 ngày) — Three systems
    if (count === 8) {
      return {
        text: 'Copy Trading Chuyên Nghiệp\n\n🤖 Grok AI Gold\n🏆 BMR Copy Trading\n🚀 BMR Scalper Gold',
        extra: this.systemsKeyboard(),
      };
    }

    // #9 (~20 ngày) — Choose / Register / Start
    if (count === 9) {
      return {
        text: 'Bạn có thể bắt đầu bất cứ lúc nào\n\nChọn hệ thống\nĐăng ký broker\nBắt đầu copy',
        extra: Markup.inlineKeyboard([
          [Markup.button.url('🎯 Chọn hệ thống', this.botUrl())],
          [Markup.button.url('🔥 Đăng ký PU Prime', PUPRIME_SIGNUP_LINK)],
          [Markup.button.url('🔥 Đăng ký Ultima', ULTIMA_SIGNUP_LINK)],
          [Markup.button.url('🔥 Đăng ký Vantage', VANTAGE_SIGNUP_LINK)],
          [Markup.button.url('💬 Bắt đầu copy', KEN_VN)],
        ]),
      };
    }

    return null;
  }
}
