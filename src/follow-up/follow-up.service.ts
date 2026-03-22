import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import {
  PUPRIME_SIGNUP_LINK,
  MYFXBOOK_URL,
  CHANNEL_URL,
  BOT_TRADING_URL,
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
    // Only send during VN optimal hours
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

  /** Check if current time is within VN follow-up windows (ICT = UTC+7) */
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
    // A. User vào bot nhưng chưa bấm gì (status = new)
    if (user.status === 'new') {
      if (user.followUpCount === 0) {
        return {
          text: `Anh/chị có thể xem nhanh kết quả thực tế ở đây trước nhé:\n• Myfxbook: ${MYFXBOOK_URL}\n• Channel cập nhật hằng ngày: ${CHANNEL_URL}\nKhi sẵn sàng em sẽ hướng dẫn setup rất nhanh.`,
          extra: Markup.inlineKeyboard([
            [Markup.button.url('📈 Myfxbook', MYFXBOOK_URL)],
            [Markup.button.url('📊 Channel', CHANNEL_URL)],
          ]),
        };
      }
      return {
        text: `Nếu anh/chị muốn bắt đầu nhẹ để trải nghiệm trước, có thể test từ mức nhỏ rồi theo dõi thêm.\nEm để sẵn hướng dẫn tại đây: ${PUPRIME_SIGNUP_LINK}`,
        extra: Markup.inlineKeyboard([
          [Markup.button.url('🚀 Bắt đầu', PUPRIME_SIGNUP_LINK)],
          [Markup.button.url('📊 Channel', CHANNEL_URL)],
        ]),
      };
    }

    // B. User bấm xem kết quả nhưng chưa chọn vốn (lastStep = viewed_results, no capital)
    if (!user.capitalRange || user.status === 'new') {
      if (user.followUpCount === 0) {
        return {
          text: `Em thấy anh/chị đã xem kết quả.\nĐể em gợi ý setup phù hợp, anh/chị dự kiến bắt đầu ở mức nào?\n• Test nhẹ\n• Trung bình\n• Tài khoản lớn`,
        };
      }
      return {
        text: `Mỗi mức vốn sẽ có cách setup và quản lý rủi ro khác nhau.\nAnh/chị chọn nhanh mức dự kiến, em sẽ điều hướng đúng flow để đỡ mất thời gian.`,
      };
    }

    // C. User chọn vốn retail nhưng chưa đăng ký (capital_selected, no registration)
    if (user.status === 'capital_selected' && !user.isVip) {
      if (user.followUpCount === 0) {
        return {
          text: `Với mức vốn này, anh/chị có thể bắt đầu khá đơn giản:\n1. Đăng ký tài khoản\n2. Nạp vốn\n3. Bật copytrade\nEm có sẵn hướng dẫn từng bước ở đây: ${PUPRIME_SIGNUP_LINK}`,
          extra: Markup.inlineKeyboard([
            [Markup.button.url('👉 Đăng ký ngay', PUPRIME_SIGNUP_LINK)],
          ]),
        };
      }
      if (user.followUpCount === 1) {
        return {
          text: `Nếu chưa muốn vào lớn, anh/chị có thể test nhỏ trước để làm quen cách hệ thống chạy.\nKhi thấy phù hợp rồi scale sau cũng được.`,
        };
      }
      return {
        text: `Hôm nay hệ thống đã có cập nhật mới trong channel.\nAnh/chị có thể xem thêm rồi quyết định sau, không cần vội: ${CHANNEL_URL}`,
        extra: Markup.inlineKeyboard([
          [Markup.button.url('📊 Xem Channel', CHANNEL_URL)],
        ]),
      };
    }

    // D. User đã đăng ký nhưng chưa nạp (registered / account_submitted)
    if (user.status === 'registered' || user.status === 'account_submitted') {
      return {
        text: `Tài khoản đã sẵn sàng.\nBạn có thể bắt đầu với 100$ để test trước, setup chỉ mất 2 phút.`,
        extra: Markup.inlineKeyboard([
          [Markup.button.url('💰 Nạp tiền', PUPRIME_SIGNUP_LINK)],
          [Markup.button.url('📊 Bot Trading', BOT_TRADING_URL)],
        ]),
      };
    }

    // E. User đã nạp, chưa bật copy (deposit_claimed)
    if (user.status === 'deposit_claimed') {
      return {
        text: `Đã xác nhận nạp tiền! 🎉\n\nBật copy trading ngay:\nMaster: Red Bull X / BMR Scalper\nRisk: 95%`,
      };
    }

    // H. User chọn mức vốn VIP 2k-10k nhưng chưa chat admin
    if (user.status === 'capital_selected' && user.isVip) {
      if (user.followUpCount === 0) {
        return {
          text: `Với tài khoản từ mức này, bên em thường setup riêng để tối ưu quản lý vốn và support sát hơn.\nAnh/chị nhắn admin tại đây để được tư vấn đúng flow: @Vitaperry`,
        };
      }
      return {
        text: `Em nhắc lại nhẹ: mức vốn của anh/chị phù hợp flow VIP hơn retail.\nĐi theo flow riêng sẽ đỡ mất thời gian và chuẩn hơn về risk.\n\n👤 Liên hệ: @Vitaperry`,
      };
    }

    return null;
  }
}
