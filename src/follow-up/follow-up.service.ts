import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import {
  PUPRIME_SIGNUP_LINK,
  MYFXBOOK_URL,
  CHANNEL_URL,
  FOLLOWUP_SCHEDULE_HOURS,
  MAX_FOLLOWUP_COUNT,
  VIP_MAX_FOLLOWUP_COUNT,
  VN_FOLLOWUP_WINDOWS,
} from '../common/constants';

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

@Injectable()
export class FollowUpService implements OnModuleInit {
  private readonly logger = new Logger(FollowUpService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    setInterval(() => this.processFollowUps(), CHECK_INTERVAL_MS);
    this.logger.log('Follow-up scheduler started (5-min interval)');
  }

  async processFollowUps(): Promise<void> {
    if (!this.isWithinVnWindow()) return;

    const users = await this.prisma.user.findMany({
      where: {
        status: { notIn: ['copy_claimed', 'done', 'vip_contacted'] },
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
        await this.bot.telegram.sendMessage(
          user.id.toString(),
          message.text,
          message.extra,
        );

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            followUpCount: { increment: 1 },
            lastFollowUpAt: now,
          },
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

  private isWithinVnWindow(): boolean {
    const now = new Date();
    const vnHour = (now.getUTCHours() + 7) % 24;
    const vnMin = now.getUTCMinutes();
    const vnTime = vnHour * 60 + vnMin;

    return VN_FOLLOWUP_WINDOWS.some((w) => {
      const start = w.startHour * 60 + w.startMin;
      const end = w.endHour * 60 + w.endMin;
      return vnTime >= start && vnTime <= end;
    });
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

  private getFollowUpMessage(user: any): { text: string; extra?: any } | null {
    const count = user.followUpCount;

    // Follow-up #1 (~10 min): "Bạn chưa hoàn tất setup"
    if (count === 0) {
      return {
        text: `Bạn chưa hoàn tất setup.\n\nChỉ mất 2 phút để bắt đầu.`,
        extra: Markup.inlineKeyboard([
          [Markup.button.url('🔥 Hoàn tất Setup', PUPRIME_SIGNUP_LINK)],
        ]),
      };
    }

    // Follow-up #2 (~1 hour): "Trader mới vừa join"
    if (count === 1) {
      return {
        text: `Trader mới vừa join và bắt đầu copy.\n\nĐừng bỏ lỡ phiên hôm nay.`,
        extra: Markup.inlineKeyboard([
          [Markup.button.url('🚀 Bắt đầu', PUPRIME_SIGNUP_LINK)],
        ]),
      };
    }

    // Follow-up #3 (~24 hours): "VIP sắp đầy"
    if (count === 2) {
      return {
        text: `VIP sắp đầy.\n\nĐăng ký trước khi đóng.`,
        extra: Markup.inlineKeyboard([
          [Markup.button.url('🔥 Join ngay', PUPRIME_SIGNUP_LINK)],
        ]),
      };
    }

    // Follow-up #4 (~72 hours): Performance nudge
    if (count === 3) {
      const pct = (Math.random() * 3 + 2).toFixed(1);
      return {
        text: `📊 Bot vừa đạt +${pct}% hôm nay.\n\nBạn đang bỏ lỡ phiên này.`,
        extra: Markup.inlineKeyboard([
          [Markup.button.url('📊 Xem kết quả', MYFXBOOK_URL)],
          [Markup.button.url('🚀 Bắt đầu', PUPRIME_SIGNUP_LINK)],
        ]),
      };
    }

    // Follow-up #5 (~120 hours): Final
    if (count === 4) {
      return {
        text: `Nhắc lần cuối.\n\nSetup chỉ 2 phút. Kết quả nói lên tất cả.\n\n${MYFXBOOK_URL}`,
        extra: Markup.inlineKeyboard([
          [Markup.button.url('🔥 Bắt đầu', PUPRIME_SIGNUP_LINK)],
        ]),
      };
    }

    return null;
  }
}
