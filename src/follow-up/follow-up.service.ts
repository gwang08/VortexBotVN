import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import {
  PUPRIME_SIGNUP_LINK,
  BOT_TRADING_URL,
  FOLLOWUP_SCHEDULE_HOURS,
  MAX_FOLLOWUP_COUNT,
  VIP_MAX_FOLLOWUP_COUNT,
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
    const users = await this.prisma.user.findMany({
      where: {
        status: { notIn: ['copy_claimed', 'done'] },
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
        this.logger.error(`Follow-up failed for user ${user.id}: ${error.message}`);
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

  private getFollowUpMessage(user: any): { text: string; extra?: any } | null {
    const pct = (Math.random() * 3 + 2).toFixed(1);

    if (user.isVip && user.status === 'new') {
      return {
        text: `Chúng tôi giúp bạn setup đúng cách.\n\nTránh lỗi phổ biến với cài đặt cá nhân hóa.\n\n👉 Liên hệ: @Vitaperry`,
      };
    }

    switch (user.status) {
      case 'new':
        return {
          text: `📊 Bot hôm nay +${pct}%\n\nBạn vẫn chưa bắt đầu.\n\nTạo tài khoản và bắt đầu copy trong 3 bước.`,
          extra: Markup.inlineKeyboard([
            [Markup.button.url('🚀 Bắt Đầu Ngay', PUPRIME_SIGNUP_LINK)],
            [Markup.button.url('📊 Bot Trading', BOT_TRADING_URL)],
          ]),
        };

      case 'registered':
        return {
          text: `✅ Bạn đã đăng ký thành công!\n\nGửi số tài khoản để được hỗ trợ nhanh hơn:\nACC: 12345678`,
        };

      case 'account_submitted':
        return {
          text: `Tài khoản đã sẵn sàng.\n\nNạp tiền để bắt đầu copy BMR Scalper Gold.`,
          extra: Markup.inlineKeyboard([
            [Markup.button.url('💰 Hướng Dẫn Nạp Tiền', PUPRIME_SIGNUP_LINK)],
            [Markup.button.url('📊 Bot Trading', BOT_TRADING_URL)],
          ]),
        };

      case 'deposit_claimed':
        return {
          text: `Đã xác nhận nạp tiền! 🎉\n\nBật copy trading ngay:\nMaster: Red Bull X / BMR Scalper\nRisk: 95%`,
        };

      default:
        return null;
    }
  }
}
