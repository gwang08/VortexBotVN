import { Update, Start, Use, Ctx } from 'nestjs-telegraf';
import type { BotContext } from '../common/interfaces/session.interface';
import { BotService } from './bot.service';
import { AdminService } from '../admin/admin.service';

@Update()
export class BotUpdate {
  constructor(
    private botService: BotService,
    private adminService: AdminService,
  ) {}

  /**
   * Middleware chạy TRƯỚC scenes - bắt admin reply
   * và tin nhắn tự do của user trước khi scene xử lý.
   */
  @Use()
  async middleware(@Ctx() ctx: BotContext, next: () => Promise<void>) {
    const message = (ctx.message as any)?.text;
    const chatId = ctx.chat?.id;

    // Chỉ xử lý tin nhắn text
    if (!message || !chatId) {
      return next();
    }

    // Cho commands đi qua bình thường
    if (message.startsWith('/')) {
      return next();
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
      return next();
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

    await ctx.scene.enter('onboarding');
  }
}
