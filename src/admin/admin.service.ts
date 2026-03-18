import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import type { BotContext } from '../common/interfaces/session.interface';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly adminChatId: string;

  constructor(
    @InjectBot() private bot: Telegraf<BotContext>,
    private configService: ConfigService,
    private googleSheetsService: GoogleSheetsService,
  ) {
    this.adminChatId = this.configService.get<string>('ADMIN_CHAT_ID') ?? '';
  }

  async notifyAdmin(userId: number, username?: string, firstName?: string): Promise<void> {
    const displayName = username ? `@${username}` : firstName || `ID:${userId}`;
    const message = `🔔 Yêu cầu liên hệ mới!\n\nTừ: ${displayName}\nUser ID: ${userId}\n\nVui lòng liên hệ trực tiếp với họ.`;

    try {
      await this.bot.telegram.sendMessage(this.adminChatId, message);
      this.logger.log(`Admin notified about user ${displayName}`);
    } catch (error) {
      this.logger.error('Failed to notify admin', error);
    }

    await this.googleSheetsService.appendRow({
      userId,
      username: username || firstName,
      flow: 'General',
      action: 'Contact',
    });
  }

  async notifyAdminEmail(userId: number, username: string, email: string, flow: string): Promise<void> {
    const displayName = username ? `@${username}` : `ID:${userId}`;
    const message = `📧 Đã nhận email!\n\nTừ: ${displayName}\nDịch vụ: ${flow}\nEmail: ${email}`;

    try {
      await this.bot.telegram.sendMessage(this.adminChatId, message);
    } catch (error) {
      this.logger.error('Failed to notify admin about email', error);
    }

    await this.googleSheetsService.appendRow({
      userId,
      username,
      email,
      flow,
      action: 'Email',
    });
  }
}
