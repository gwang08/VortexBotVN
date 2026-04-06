import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import type { BotContext } from '../common/interfaces/session.interface';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';
import { PrismaService } from '../prisma/prisma.service';
import { MAX_FOLLOWUP_COUNT, VIP_MAX_FOLLOWUP_COUNT } from '../common/constants';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly adminChatId: string;

  constructor(
    @InjectBot() private bot: Telegraf<BotContext>,
    private configService: ConfigService,
    private googleSheetsService: GoogleSheetsService,
    private prisma: PrismaService,
  ) {
    this.adminChatId = this.configService.get<string>('ADMIN_CHAT_ID') ?? '';
  }

  async hasTrackingLink(source: string): Promise<boolean> {
    const link = await this.prisma.trackingLink.findUnique({ where: { source } });
    return link !== null;
  }

  async saveTrackingLink(source: string): Promise<void> {
    await this.prisma.trackingLink.create({ data: { source } });
  }

  async getTrackingLinks(): Promise<{ source: string; createdAt: string }[]> {
    const links = await this.prisma.trackingLink.findMany({ orderBy: { createdAt: 'desc' } });
    return links.map((l) => ({ source: l.source, createdAt: l.createdAt.toISOString() }));
  }

  isAdmin(chatId: number): boolean {
    return String(chatId) === this.adminChatId;
  }

  /** Handle admin commands when called from within scenes */
  async handleCommand(ctx: BotContext, message: string): Promise<void> {
    // Support multi-line: split by newline, process each /link command
    const lines = message.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1 && lines.every((l) => l.startsWith('/link '))) {
      await this.createTrackingLinksBatch(ctx, lines);
      return;
    }

    if (message === '/help') {
      await this.sendHelpMessage(ctx);
    } else if (message.startsWith('/link')) {
      const args = message.split(' ').slice(1).join('_');
      if (!args) {
        await ctx.reply('Usage: /link <source>\n\nCó thể gửi nhiều link cùng lúc:\n/link source1\n/link source2');
        return;
      }
      const source = args.replace(/[^a-zA-Z0-9_-]/g, '');
      await this.createTrackingLink(ctx, source);
    } else if (message.startsWith('/checklinks')) {
      await this.showTrackingLinks(ctx);
    } else if (message.startsWith('/status')) {
      const parts = message.split(' ');
      if (parts.length < 2) {
        await ctx.reply('Usage: /status <telegram_id>');
        return;
      }
      await this.sendUserStatus(ctx, parts[1]);
    } else if (message === '/stats') {
      await this.sendStats(ctx);
    } else if (message.startsWith('/verify')) {
      const parts = message.split(' ');
      if (parts.length < 2) {
        await ctx.reply('Usage: /verify <account>');
        return;
      }
      await this.verifyAccount(ctx, parts[1]);
    }
  }

  /** Create tracking link */
  async createTrackingLink(ctx: BotContext, source: string): Promise<void> {
    if (await this.hasTrackingLink(source)) {
      const botInfo = await ctx.telegram.getMe();
      const link = `https://t.me/${botInfo.username}?start=ref_${source}`;
      await ctx.reply(`⚠️ Source "${source}" đã tồn tại!\n\n🔗 ${link}\n\nVui lòng dùng tên khác.`);
      return;
    }

    await this.saveTrackingLink(source);
    const botInfo = await ctx.telegram.getMe();
    const link = `https://t.me/${botInfo.username}?start=ref_${source}`;
    await ctx.reply(
      `✅ Link tracking đã tạo!\n\n🔗 ${link}\n\n📊 Source: ${source}\n\nGửi link này cho channel quảng cáo.\nKhi user bấm vào, bot sẽ tự động ghi nhận source.`,
    );
  }

  /** Batch create multiple tracking links, return single summary message */
  async createTrackingLinksBatch(ctx: BotContext, lines: string[]): Promise<void> {
    const botInfo = await ctx.telegram.getMe();
    const created: string[] = [];
    const skipped: string[] = [];

    for (const line of lines) {
      const source = line.split(' ').slice(1).join('_').replace(/[^a-zA-Z0-9_-]/g, '');
      if (!source) continue;

      if (await this.hasTrackingLink(source)) {
        skipped.push(source);
      } else {
        await this.saveTrackingLink(source);
        const link = `https://t.me/${botInfo.username}?start=ref_${source}`;
        created.push(`📊 ${source}\n🔗 ${link}`);
      }
    }

    let text = '';
    if (created.length > 0) {
      text += `✅ Đã tạo ${created.length} link:\n\n${created.join('\n\n')}`;
    }
    if (skipped.length > 0) {
      text += `${text ? '\n\n' : ''}⚠️ Đã tồn tại: ${skipped.join(', ')}`;
    }
    if (!text) {
      text = '⚠️ Không có source hợp lệ.';
    }

    await ctx.reply(text);
  }

  /** Show all tracking links */
  async showTrackingLinks(ctx: BotContext): Promise<void> {
    const links = await this.getTrackingLinks();
    if (links.length === 0) {
      await ctx.reply('📭 Chưa có tracking link nào.\n\nDùng /link <source> để tạo.');
      return;
    }

    const botInfo = await ctx.telegram.getMe();
    const lines = links.map((l, i) => {
      const link = `https://t.me/${botInfo.username}?start=ref_${l.source}`;
      const date = new Date(l.createdAt).toLocaleDateString('vi-VN');
      return `${i + 1}. 📊 ${l.source}\n   🔗 ${link}\n   📅 ${date}`;
    });

    await ctx.reply(`📋 Tracking Links (${links.length}):\n\n${lines.join('\n\n')}`);
  }

  async forwardUserMessage(userId: number, username: string | undefined, text: string): Promise<void> {
    const displayName = username ? `@${username}` : `ID:${userId}`;
    const message = `💬 Tin nhắn từ ${displayName} (ID: ${userId}):\n\n"${text}"\n\n↩️ Reply tin nhắn này để trả lời.`;

    try {
      await this.bot.telegram.sendMessage(this.adminChatId, message);
    } catch (error) {
      this.logger.error('Failed to forward user message to admin', error);
    }
  }

  async sendReplyToUser(userId: number, text: string): Promise<boolean> {
    try {
      await this.bot.telegram.sendMessage(userId, text);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send reply to user ${userId}`, error);
      return false;
    }
  }

  extractUserIdFromMessage(text: string): number | null {
    const match =
      text.match(/\(ID:\s*(\d+)\)/) ||
      text.match(/User ID:\s*(\d+)/) ||
      text.match(/ID:\s*(\d+)/);
    return match ? parseInt(match[1], 10) : null;
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

  /** Notify admin when user submits trading account */
  async notifyAccountSubmitted(userId: number, username: string | undefined, account: string): Promise<void> {
    const displayName = username ? `@${username}` : `ID:${userId}`;
    const text = `🏦 Account Submitted\n\nUser: ${displayName} (ID: ${userId})\nAccount: ${account}\n\nVerify with: /verify ${account}`;

    try {
      await this.bot.telegram.sendMessage(this.adminChatId, text);
    } catch (error) {
      this.logger.error('Failed to notify admin about account submission', error);
    }
  }

  /** Notify admin when user claims deposit */
  async notifyDepositClaimed(userId: number, username: string | undefined, account: string | null | undefined): Promise<void> {
    const displayName = username ? `@${username}` : `ID:${userId}`;
    const text = `💰 Deposit Claimed\n\nUser: ${displayName} (ID: ${userId})\nAccount: ${account || 'N/A'}\n\nCheck on IB portal.`;

    try {
      await this.bot.telegram.sendMessage(this.adminChatId, text);
    } catch (error) {
      this.logger.error('Failed to notify admin about deposit claim', error);
    }
  }

  /** /help - show all admin commands */
  async sendHelpMessage(ctx: BotContext): Promise<void> {
    const text = `📋 Admin Commands:\n
/help        – Show this help message
/link     – Create tracking link: /link <source>
/checklinks  – List all tracking links
/status      – View user info: /status <telegram_id>
/stats       – User statistics by source & status
/verify      – Verify trading account: /verify <account_number>

💬 Reply to user messages to chat directly`;

    await ctx.reply(text);
  }

  /** /status <tg_id> */
  async sendUserStatus(ctx: BotContext, tgId: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: BigInt(tgId) },
      });

      if (!user) {
        await ctx.reply(`User ${tgId} not found.`);
        return;
      }

      const maxFollowUp = user.isVip ? VIP_MAX_FOLLOWUP_COUNT : MAX_FOLLOWUP_COUNT;
      const text = `👤 User: ${user.firstName || 'N/A'} (@${user.username || 'N/A'})
🆔 ID: ${user.id}
📊 Tier: ${user.tier}
📌 Status: ${user.status}
💰 Capital: ${user.capitalRange || 'N/A'}
🏦 Account: ${user.tradingAccount || 'N/A'}
✅ Verified: ${user.accountVerified ? 'Yes' : 'No'}
📂 Flow: ${user.flow || 'N/A'}
🔔 Follow-ups: ${user.followUpCount}/${maxFollowUp}
🔗 Source: ${user.source || 'direct'}
📅 Joined: ${user.createdAt.toISOString().split('T')[0]}
📝 Last step: ${user.lastStep || 'N/A'}`;

      await ctx.reply(text);
    } catch (error) {
      await ctx.reply(`Error looking up user: ${tgId}`);
    }
  }

  /** /stats */
  async sendStats(ctx: BotContext): Promise<void> {
    const statusCounts = await this.prisma.user.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const sourceCounts = await this.prisma.user.groupBy({
      by: ['source'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const tierCounts = await this.prisma.user.groupBy({
      by: ['tier'],
      _count: { id: true },
    });

    const total = await this.prisma.user.count();

    let text = `📊 Stats (Total: ${total} users)\n\n`;

    text += `── By Status ──\n`;
    for (const s of statusCounts) {
      text += `${s.status}: ${s._count.id}\n`;
    }

    text += `\n── By Tier ──\n`;
    for (const t of tierCounts) {
      text += `${t.tier}: ${t._count.id}\n`;
    }

    text += `\n── Top Sources ──\n`;
    for (const s of sourceCounts) {
      text += `${s.source || 'direct'}: ${s._count.id}\n`;
    }

    await ctx.reply(text);
  }

  /** /verify <account> */
  async verifyAccount(ctx: BotContext, account: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { tradingAccount: account },
    });

    if (!user) {
      await ctx.reply(`No user found with account ${account}.`);
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { accountVerified: true, lastStep: 'account_verified' },
    });

    await ctx.reply(`✅ Account ${account} verified for user ${user.firstName || user.username || user.id}.`);

    try {
      await this.bot.telegram.sendMessage(
        user.id.toString(),
        '✅ Tài khoản trading của bạn đã được xác minh! Bạn có thể tiến hành nạp tiền.',
      );
    } catch (e: any) {
      this.logger.error(`Failed to notify user ${user.id}: ${e.message}`);
    }
  }
}
