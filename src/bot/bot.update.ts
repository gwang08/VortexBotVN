import { Update, Start, Use, Ctx, Command } from 'nestjs-telegraf';
import { Logger } from '@nestjs/common';
import type { BotContext } from '../common/interfaces/session.interface';
import { BotService } from './bot.service';
import { AdminService } from '../admin/admin.service';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';
import { PrismaService } from '../prisma/prisma.service';

@Update()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(
    private botService: BotService,
    private adminService: AdminService,
    private googleSheetsService: GoogleSheetsService,
    private prisma: PrismaService,
  ) {}

  @Use()
  async middleware(@Ctx() ctx: BotContext, next: () => Promise<void>) {
    const message = (ctx.message as any)?.text;
    const chatId = ctx.chat?.id;

    const callNext = typeof next === 'function' ? next : () => Promise.resolve();

    if (!message || !chatId) {
      return callNext();
    }

    if (message.startsWith('/')) {
      this.logger.log(
        `[cmd] chatId=${chatId} isAdmin=${this.adminService.isAdmin(chatId)} msg="${message.slice(0, 60)}"`,
      );
    }

    if (message.startsWith('/start')) {
      return this.onStart(ctx);
    }

    // --- Admin commands ---
    if (this.adminService.isAdmin(chatId)) {
      if (message === '/help') {
        await this.adminService.sendHelpMessage(ctx);
        return;
      }

      if (message.startsWith('/status')) {
        const parts = message.split(' ');
        if (parts.length < 2) {
          await ctx.reply('Usage: /status <telegram_id>');
          return;
        }
        await this.adminService.sendUserStatus(ctx, parts[1]);
        return;
      }

      if (message === '/stats') {
        await this.adminService.sendStats(ctx);
        return;
      }

      if (message.startsWith('/verify')) {
        const parts = message.split(' ');
        if (parts.length < 2) {
          await ctx.reply('Usage: /verify <trading_account>');
          return;
        }
        await this.adminService.verifyAccount(ctx, parts[1]);
        return;
      }

      if (message.startsWith('/link') || message.startsWith('/checklinks')) {
        await this.adminService.handleCommand(ctx, message);
        return;
      }
    }

    // Other commands -> pass through
    if (message.startsWith('/')) {
      return callNext();
    }

    // Admin đang nhập source cho /link
    if (this.adminService.isAdmin(chatId) && ctx.session?.awaitingLinkSource) {
      ctx.session.awaitingLinkSource = false;
      const source = message.replace(/[^a-zA-Z0-9_-]/g, '');
      if (!source) {
        await ctx.reply('⚠️ Tên không hợp lệ. Chỉ dùng chữ, số, _ và -');
        return;
      }
      await this.adminService.createTrackingLink(ctx, source);
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

    // --- User-side middleware ---

    // User reply vào tin nhắn bot -> forward tới admin
    const replyToBot = (ctx.message as any)?.reply_to_message;
    if (replyToBot && replyToBot.from?.is_bot) {
      if (!ctx.from) return;
      await this.adminService.forwardUserMessage(ctx.from.id, ctx.from.username, message);
      await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
      return;
    }

    // User đang nhập text (email/account/uid) hoặc AI chat -> để scene xử lý
    if (ctx.session?.awaitingEmail || ctx.session?.awaitingAccount || ctx.session?.awaitingUid || ctx.session?.inAiChat) {
      return callNext();
    }

    // Tất cả tin nhắn tự do khác -> forward tới admin
    if (!ctx.from) return;
    await this.adminService.forwardUserMessage(ctx.from.id, ctx.from.username, message);
    await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
  }

  @Start()
  async onStart(@Ctx() ctx: BotContext) {
    try {
      await ctx.scene.leave();
    } catch {}

    ctx.session.capitalRange = undefined;
    ctx.session.selectedFlow = undefined;
    ctx.session.email = undefined;
    ctx.session.awaitingEmail = false;
    ctx.session.awaitingAccount = false;
    ctx.session.awaitingUid = false;
    ctx.session.currentStep = undefined;
    ctx.session.isVip = undefined;
    ctx.session.inAiChat = false;
    ctx.session.tier = undefined;
    ctx.session.selectedBroker = undefined;

    const startPayload = (ctx.message as any)?.text?.split(' ')[1] ?? '';
    const source = startPayload.startsWith('ref_') ? startPayload.slice(4) : '';

    if (ctx.from) {
      await this.prisma.user.upsert({
        where: { id: BigInt(ctx.from.id) },
        update: { username: ctx.from.username, firstName: ctx.from.first_name },
        create: {
          id: BigInt(ctx.from.id),
          username: ctx.from.username,
          firstName: ctx.from.first_name,
          source: source || null,
        },
      });
    }

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

}
