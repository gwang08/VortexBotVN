import { Scene, SceneEnter, Action, On, Command } from 'nestjs-telegraf';
import type { BotContext } from '../../common/interfaces/session.interface';
import { CALLBACKS, ACCOUNT_CREATION_TEXT, DEPOSIT_VIDEO_GUIDE_TEXT } from '../../common/constants';
import { sigStep1Keyboard, sigStep2Keyboard } from '../../common/keyboards';
import { AdminService } from '../../admin/admin.service';
import { BotService } from '../../bot/bot.service';

@Scene('signals')
export class SignalsScene {
  constructor(
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
    await this.botService.sendWithKeyboard(ctx, ACCOUNT_CREATION_TEXT, sigStep1Keyboard());
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
    await this.botService.sendWithKeyboard(ctx, 'Nạp số tiền bạn muốn giao dịch (tối thiểu 300u để tham gia cộng đồng)', sigStep2Keyboard());
  }

  @Action(CALLBACKS.sigVideoGuide)
  async onVideoGuide(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.botService.sendWithKeyboard(ctx, DEPOSIT_VIDEO_GUIDE_TEXT, sigStep2Keyboard());
  }

  @Action(CALLBACKS.sigDepositedDone)
  async onDepositedDone(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'signals:step3_email';
    ctx.session.awaitingEmail = true;
    await ctx.reply('Vui lòng gửi email bạn dùng để tạo tài khoản, để tôi kiểm tra trạng thái tài khoản.');
  }

  @Action(CALLBACKS.contactAdmin)
  async onContactAdmin(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply('Cảm ơn bạn! Admin đã được thông báo. Chúng tôi sẽ liên hệ lại tại đây.');
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
        await this.adminService.notifyAdminEmail(ctx.from!.id, ctx.from?.username || ctx.from?.first_name || '', email, 'Signals');
        await ctx.reply(`✅ Cảm ơn! Email đã nhận: ${email}`);
        return;
      }
      await ctx.reply('Vui lòng nhập email hợp lệ (ví dụ: ten@example.com)');
      return;
    }

    const displayName = this.botService.getDisplayName(ctx);
    await this.adminService.forwardUserMessage(ctx.from!.id, displayName, message);
    await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
  }
}
