import { Scene, SceneEnter, On, Action, Command } from 'nestjs-telegraf';
import type { BotContext } from '../../common/interfaces/session.interface';
import { CALLBACKS } from '../../common/constants';
import { mainMenuKeyboard } from '../../common/keyboards';
import { GeminiService } from '../../gemini/gemini.service';
import { AdminService } from '../../admin/admin.service';
import { BotService } from '../../bot/bot.service';

@Scene('onboarding')
export class OnboardingScene {
  constructor(
    private geminiService: GeminiService,
    private adminService: AdminService,
    private botService: BotService,
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
    await ctx.scene.enter('onboarding');
  }

  @SceneEnter()
  async onEnter(ctx: BotContext) {
    ctx.session.awaitingProfitTarget = true;
    ctx.session.currentStep = 'onboarding:profit_question';

    const text = await this.geminiService.generateResponse({
      currentStep: 'Chào mừng - hỏi mục tiêu lợi nhuận',
      userName: this.botService.getDisplayName(ctx),
      templateText:
        'Xin chào! Trước tiên, bạn muốn tạo ra bao nhiêu lợi nhuận mỗi tháng với VortexBot? (Tính bằng đô la)',
    });
    await ctx.reply(text);
  }

  @On('text')
  async onText(ctx: BotContext) {
    const message = (ctx.message as any)?.text;
    if (!message) return;

    if (ctx.session.awaitingProfitTarget) {
      const amount = parseFloat(message.replace(/[^0-9.]/g, ''));

      if (isNaN(amount) || amount <= 0) {
        const response = await this.geminiService.handleFreeText({
          userMessage: message,
          currentStep: 'Đang chờ số tiền mục tiêu lợi nhuận',
          userName: this.botService.getDisplayName(ctx),
          availableActions: ['Nhập số tiền đô la (ví dụ: 1000, 5000)'],
        });
        await ctx.reply(response);
        return;
      }

      ctx.session.profitTarget = amount;
      ctx.session.awaitingProfitTarget = false;
      ctx.session.currentStep = 'onboarding:main_menu';

      const recommendation = await this.geminiService.generateDepositRecommendation(
        amount,
        this.botService.getDisplayName(ctx),
      );
      await this.botService.sendWithKeyboard(ctx, recommendation, mainMenuKeyboard());
      return;
    }

    const response = await this.geminiService.handleFreeText({
      userMessage: message,
      currentStep: 'Menu chính - chọn giữa CopyTrading, Tín Hiệu, hoặc Liên Hệ Admin',
      userName: this.botService.getDisplayName(ctx),
      availableActions: ['CopyTrading', 'Tín Hiệu', 'Liên Hệ Admin'],
    });
    await ctx.reply(response);
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
    await this.adminService.notifyAdmin(
      ctx.from!.id,
      ctx.from?.username,
      ctx.from?.first_name,
    );

    const text = await this.geminiService.generateResponse({
      currentStep: 'Xác nhận liên hệ admin',
      userName: this.botService.getDisplayName(ctx),
      templateText: 'Cảm ơn bạn! Admin đã được thông báo. Chúng tôi sẽ liên hệ lại với bạn tại đây.',
    });
    await ctx.reply(text);
  }
}
