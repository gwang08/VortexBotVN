import { Scene, SceneEnter, Action, On, Command } from 'nestjs-telegraf';
import type { BotContext } from '../../common/interfaces/session.interface';
import {
  CALLBACKS,
  ACCOUNT_CREATION_TEXT,
  DEPOSIT_VIDEO_GUIDE_TEXT,
} from '../../common/constants';
import { sigStep1Keyboard, sigStep2Keyboard } from '../../common/keyboards';
import { GeminiService } from '../../gemini/gemini.service';
import { AdminService } from '../../admin/admin.service';
import { BotService } from '../../bot/bot.service';

@Scene('signals')
export class SignalsScene {
  constructor(
    private geminiService: GeminiService,
    private adminService: AdminService,
    private botService: BotService,
  ) {}

  @Action(CALLBACKS.copytrading)
  async onSwitchToCopyTrading(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'copytrading';
    await ctx.scene.enter('copytrading');
  }

  @Action(CALLBACKS.signals)
  async onSwitchToSignals(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.scene.enter('signals');
  }

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
    ctx.session.currentStep = 'signals:step1';
    ctx.session.awaitingEmail = false;

    const text = await this.geminiService.generateResponse({
      currentStep: 'Tín Hiệu Bước 1 - Tạo Tài Khoản PuPrime',
      userName: this.botService.getDisplayName(ctx),
      profitTarget: ctx.session.profitTarget,
      templateText: ACCOUNT_CREATION_TEXT,
    });
    await this.botService.sendWithKeyboard(ctx, text, sigStep1Keyboard());
  }

  @Action(CALLBACKS.sigCreatedAccount)
  async onCreatedAccount(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.showDepositStep(ctx);
  }

  @Action(CALLBACKS.sigAlreadyHaveAccount)
  async onAlreadyHaveAccount(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.showDepositStep(ctx);
  }

  private async showDepositStep(ctx: BotContext) {
    ctx.session.currentStep = 'signals:step2_deposit';

    const text = await this.geminiService.generateResponse({
      currentStep: 'Tín Hiệu Bước 2 - Nạp Tiền',
      userName: this.botService.getDisplayName(ctx),
      profitTarget: ctx.session.profitTarget,
      templateText: 'Nạp số tiền bạn muốn giao dịch (tối thiểu 300u để tham gia cộng đồng của chúng tôi)',
    });
    await this.botService.sendWithKeyboard(ctx, text, sigStep2Keyboard());
  }

  @Action(CALLBACKS.sigVideoGuide)
  async onVideoGuide(ctx: BotContext) {
    await ctx.answerCbQuery();

    const text = await this.geminiService.generateResponse({
      currentStep: 'Tín Hiệu - Video Hướng Dẫn Nạp Tiền',
      userName: this.botService.getDisplayName(ctx),
      templateText: DEPOSIT_VIDEO_GUIDE_TEXT,
    });
    await this.botService.sendWithKeyboard(ctx, text, sigStep2Keyboard());
  }

  @Action(CALLBACKS.sigDepositedDone)
  async onDepositedDone(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'signals:step3_email';
    ctx.session.awaitingEmail = true;

    const text = await this.geminiService.generateResponse({
      currentStep: 'Tín Hiệu Bước 3 - Thu Thập Email',
      userName: this.botService.getDisplayName(ctx),
      templateText: 'Vui lòng gửi cho tôi email bạn dùng để tạo tài khoản, để tôi kiểm tra trạng thái tài khoản của bạn',
    });
    await ctx.reply(text);
  }

  @Action(CALLBACKS.contactAdmin)
  async onContactAdmin(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);

    const text = await this.geminiService.generateResponse({
      currentStep: 'Liên hệ admin từ flow Tín Hiệu',
      userName: this.botService.getDisplayName(ctx),
      templateText: 'Cảm ơn bạn! Admin đã được thông báo. Chúng tôi sẽ liên hệ lại với bạn tại đây.',
    });
    await ctx.reply(text);
  }

  @On('text')
  async onText(ctx: BotContext) {
    const message = (ctx.message as any)?.text;
    if (!message) return;

    if (ctx.session.awaitingEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailMatch = message.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);

      if (emailMatch && emailRegex.test(emailMatch[0])) {
        const email = emailMatch[0];
        ctx.session.email = email;
        ctx.session.awaitingEmail = false;

        await this.adminService.notifyAdminEmail(
          ctx.from!.id,
          ctx.from?.username || ctx.from?.first_name || '',
          email,
          'Signals',
        );

        const text = await this.geminiService.generateResponse({
          currentStep: 'Tín Hiệu - Đã nhận email',
          userName: this.botService.getDisplayName(ctx),
          templateText: `✅ Cảm ơn bạn đã gửi email: ${email}`,
        });
        await ctx.reply(text);
        return;
      }

      const response = await this.geminiService.handleFreeText({
        userMessage: message,
        currentStep: 'Đang chờ địa chỉ email',
        userName: this.botService.getDisplayName(ctx),
        availableActions: ['Nhập địa chỉ email của bạn (ví dụ: ten@example.com)'],
      });
      await ctx.reply(response);
      return;
    }

    const response = await this.geminiService.handleFreeText({
      userMessage: message,
      currentStep: ctx.session.currentStep || 'Flow Tín Hiệu',
      userName: this.botService.getDisplayName(ctx),
      availableActions: ['Sử dụng các nút bên trên để tiếp tục'],
    });
    await ctx.reply(response);
  }
}
