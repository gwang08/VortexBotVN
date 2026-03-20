import { Update, Start, Use, Ctx, Command } from 'nestjs-telegraf';
import type { BotContext } from '../common/interfaces/session.interface';
import { BotService } from './bot.service';
import { AdminService } from '../admin/admin.service';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';

@Update()
export class BotUpdate {
  constructor(
    private botService: BotService,
    private adminService: AdminService,
    private googleSheetsService: GoogleSheetsService,
  ) {}

  /**
   * Middleware chạy TRƯỚC scenes - bắt admin reply
   * và tin nhắn tự do của user trước khi scene xử lý.
   */
  @Use()
  async middleware(@Ctx() ctx: BotContext, next: () => Promise<void>) {
    const message = (ctx.message as any)?.text;
    const chatId = ctx.chat?.id;

    const callNext = typeof next === 'function' ? next : () => Promise.resolve();

    // Chỉ xử lý tin nhắn text
    if (!message || !chatId) {
      return callNext();
    }

    // Handle /start directly since next() may not work in cluster mode
    if (message.startsWith('/start')) {
      return this.onStart(ctx);
    }

    // Handle /newlink for admin
    if (message.startsWith('/newlink') && this.adminService.isAdmin(chatId)) {
      const args = message.split(' ').slice(1).join('_');
      if (!args) {
        ctx.session.awaitingLinkSource = true;
        await ctx.reply('📎 Nhập tên nguồn quảng cáo (VD: forex_vn, gold_trading, fb_ads):');
        return;
      }
      const source = args.replace(/[^a-zA-Z0-9_-]/g, '');
      await this.createTrackingLink(ctx, source);
      return;
    }

    // Handle /checklinks for admin
    if (message.startsWith('/checklinks') && this.adminService.isAdmin(chatId)) {
      await this.showTrackingLinks(ctx);
      return;
    }

    // Other commands → pass through
    if (message.startsWith('/')) {
      return callNext();
    }

    // Admin đang nhập source cho /newlink
    if (this.adminService.isAdmin(chatId) && ctx.session?.awaitingLinkSource) {
      ctx.session.awaitingLinkSource = false;
      const source = message.replace(/[^a-zA-Z0-9_-]/g, '');
      if (!source) {
        await ctx.reply('⚠️ Tên không hợp lệ. Chỉ dùng chữ, số, _ và -');
        return;
      }
      await this.createTrackingLink(ctx, source);
      return;
    }

    // Admin reply tin nhắn đã forward từ user
    if (this.adminService.isAdmin(chatId)) {
      const replyTo = (ctx.message as any)?.reply_to_message?.text;
      if (!replyTo) {
        await ctx.reply('↩️ Reply vào tin nhắn của user để trả lời.');
        return;
      }

      const userId = this.adminService.extractUserIdFromMessage(replyTo);
      if (!userId) {
        await ctx.reply('⚠️ Không tìm thấy User ID trong tin nhắn.');
        return;
      }

      const sent = await this.adminService.sendReplyToUser(userId, message);
      await ctx.reply(sent ? '✅ Đã gửi.' : '❌ Gửi thất bại.');
      return;
    }

    // User reply vào tin nhắn bot → forward tới admin như live chat
    const replyToBot = (ctx.message as any)?.reply_to_message;
    if (replyToBot && replyToBot.from?.is_bot) {
      const displayName = this.botService.getDisplayName(ctx);
      await this.adminService.forwardUserMessage(ctx.from!.id, displayName, message);
      await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
      return;
    }

    // User đang nhập text (email/profit) → để scene xử lý
    if (ctx.session?.awaitingEmail || ctx.session?.awaitingProfitTarget) {
      return callNext();
    }

    // Tất cả tin nhắn tự do khác → forward tới admin
    const displayName = this.botService.getDisplayName(ctx);
    await this.adminService.forwardUserMessage(ctx.from!.id, displayName, message);
    await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
  }

  @Start()
  async onStart(@Ctx() ctx: BotContext) {
    try {
      await ctx.scene.leave();
    } catch {}

    ctx.session.profitTarget = undefined;
    ctx.session.selectedFlow = undefined;
    ctx.session.email = undefined;
    ctx.session.awaitingEmail = false;
    ctx.session.awaitingProfitTarget = false;
    ctx.session.currentStep = undefined;

    // Extract deep link source from /start ref_<source>
    const startPayload = (ctx.message as any)?.text?.split(' ')[1] ?? '';
    const source = startPayload.startsWith('ref_') ? startPayload.slice(4) : '';

    if (source) {
      const displayName = this.botService.getDisplayName(ctx);
      await this.googleSheetsService.appendRow({
        userId: ctx.from!.id,
        username: displayName,
        flow: 'General',
        action: 'Start',
        source,
      });
    }

    await ctx.scene.enter('onboarding');
  }

  /** Tạo tracking link với check trùng */
  private async createTrackingLink(ctx: BotContext, source: string): Promise<void> {
    if (this.adminService.hasTrackingLink(source)) {
      const botInfo = await ctx.telegram.getMe();
      const link = `https://t.me/${botInfo.username}?start=ref_${source}`;
      await ctx.reply(`⚠️ Source "${source}" đã tồn tại!\n\n🔗 ${link}\n\nVui lòng dùng tên khác.`);
      return;
    }

    this.adminService.saveTrackingLink(source);
    const botInfo = await ctx.telegram.getMe();
    const link = `https://t.me/${botInfo.username}?start=ref_${source}`;
    await ctx.reply(
      `✅ Link tracking đã tạo!\n\n🔗 ${link}\n\n📊 Source: ${source}\n\nGửi link này cho channel quảng cáo.\nKhi user bấm vào, bot sẽ tự động ghi nhận source.`,
    );
  }

  /** Hiện tất cả tracking links đã tạo */
  private async showTrackingLinks(ctx: BotContext): Promise<void> {
    const links = this.adminService.getTrackingLinks();
    if (links.length === 0) {
      await ctx.reply('📭 Chưa có tracking link nào.\n\nDùng /newlink <source> để tạo.');
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
}
