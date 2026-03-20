import { Scene, SceneEnter, On, Action, Command } from 'nestjs-telegraf';
import type { BotContext } from '../../common/interfaces/session.interface';
import { CALLBACKS } from '../../common/constants';
import { mainMenuVipKeyboard, mainMenuStandardKeyboard } from '../../common/keyboards';
import { GeminiService } from '../../gemini/gemini.service';
import { AdminService } from '../../admin/admin.service';
import { BotService } from '../../bot/bot.service';
import { FollowUpService } from '../../follow-up/follow-up.service';
import { PrismaService } from '../../prisma/prisma.service';

@Scene('onboarding')
export class OnboardingScene {
  constructor(
    private geminiService: GeminiService,
    private adminService: AdminService,
    private botService: BotService,
    private followUpService: FollowUpService,
    private prisma: PrismaService,
  ) {}

  @Command('start')
  async onRestart(ctx: BotContext) {
    await ctx.scene.leave();
    ctx.session.profitTarget = undefined;
    ctx.session.selectedFlow = undefined;
    ctx.session.email = undefined;
    ctx.session.awaitingEmail = false;
    ctx.session.awaitingProfitTarget = false;
    ctx.session.currentStep = undefined;
    ctx.session.isVip = undefined;
    ctx.session.inAiChat = false;
    await ctx.scene.enter('onboarding');
  }

  @SceneEnter()
  async onEnter(ctx: BotContext) {
    ctx.session.awaitingProfitTarget = true;
    ctx.session.currentStep = 'onboarding:profit_question';

    await ctx.reply('Xin chào! Trước tiên, bạn muốn tạo ra bao nhiêu lợi nhuận mỗi tháng với BMR AI Trading? (Tính bằng đô la)');
  }

  @On('text')
  async onText(ctx: BotContext) {
    const message = (ctx.message as any)?.text;
    if (!message) return;

    if (ctx.session.awaitingProfitTarget) {
      const amount = parseFloat(message.replace(/[^0-9.]/g, ''));

      if (isNaN(amount) || amount <= 0) {
        await ctx.reply('Vui lòng nhập số tiền hợp lệ (ví dụ: 1000, 5000)');
        return;
      }

      ctx.session.profitTarget = amount;
      ctx.session.awaitingProfitTarget = false;
      ctx.session.currentStep = 'onboarding:main_menu';

      // Tính deposit và xác định VIP (deposit >= $5k)
      const minDeposit = Math.round(amount / 0.8);
      ctx.session.isVip = minDeposit >= 5000;

      const recommendation = await this.geminiService.generateDepositRecommendation(
        amount,
        this.botService.getDisplayName(ctx),
        ctx.session.isVip,
      );
      const keyboard = ctx.session.isVip ? mainMenuVipKeyboard() : mainMenuStandardKeyboard();
      await this.botService.sendWithKeyboard(ctx, recommendation, keyboard);

      // Persist profitTarget and isVip to User record
      if (ctx.from) {
        await this.prisma.user.update({
          where: { id: BigInt(ctx.from.id) },
          data: { profitTarget: amount, isVip: ctx.session.isVip ?? false },
        }).catch(() => {
          // User may not exist yet (e.g. session resumed without /start)
        });
      }

      if (!ctx.session.isVip) {
        await this.followUpService.addUser(ctx.from!.id);
      }
      return;
    }

    // User đang trong AI chat mode → trả lời bằng Gemini
    if (ctx.session.inAiChat) {
      if (message === '/human') {
        ctx.session.inAiChat = false;
        await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
        await ctx.reply('✅ Bạn đã được kết nối với nhân viên hỗ trợ. Chúng tôi sẽ phản hồi sớm!');
        return;
      }
      const response = await this.geminiService.chatSupport(message, this.botService.getDisplayName(ctx));
      await ctx.reply(response);
      return;
    }

    // User gõ text tự do ở bước button → forward cho admin
    const displayName = this.botService.getDisplayName(ctx);
    await this.adminService.forwardUserMessage(ctx.from!.id, displayName, message);
    await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
  }

  @Action(CALLBACKS.copytrading)
  async onCopyTrading(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'copytrading';
    await ctx.scene.enter('copytrading');
  }

  @Action(CALLBACKS.signals)
  async onSignals(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'signals';
    await ctx.scene.enter('signals');
  }

  @Action(CALLBACKS.contactAdmin)
  async onContactAdmin(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply('Cảm ơn bạn! Admin đã được thông báo. Chúng tôi sẽ liên hệ lại với bạn tại đây.');
  }

  @Action(CALLBACKS.vipSupport)
  async onVipSupport(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply(
      '💎 Hỗ Trợ VIP\n\nBạn đã được phân bổ quản lý tài khoản riêng.\n\n👤 Liên hệ: @Vitaperry để được tư vấn 1-1!',
    );
  }

  @Action(CALLBACKS.aiSupport)
  async onAiSupport(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.inAiChat = true;
    await ctx.reply(
      '💬 Hỗ Trợ AI\n\nXin chào! Tôi là trợ lý AI của BMR Trading. Hỏi tôi bất cứ điều gì về:\n\n• CopyTrading & Tín Hiệu\n• Tạo tài khoản PU Prime\n• Nạp & rút tiền\n• Kiến thức trading cơ bản\n\nGõ /human bất cứ lúc nào để nói chuyện với nhân viên.',
    );
  }
}
