import { Logger } from '@nestjs/common';
import { Scene, SceneEnter, Action, On, Command } from 'nestjs-telegraf';
import type { BotContext } from '../../common/interfaces/session.interface';
import { CALLBACKS, ACCOUNT_CREATION_TEXT, DEPOSIT_VIDEO_GUIDE_TEXT } from '../../common/constants';
import { sigStep1Keyboard, sigAccountKeyboard, sigStep2Keyboard } from '../../common/keyboards';
import { AdminService } from '../../admin/admin.service';
import { BotService } from '../../bot/bot.service';
import { PrismaService } from '../../prisma/prisma.service';

@Scene('signals')
export class SignalsScene {
  private readonly logger = new Logger(SignalsScene.name);

  constructor(
    private adminService: AdminService,
    private botService: BotService,
    private prisma: PrismaService,
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
    ctx.session.capitalRange = undefined;
    ctx.session.selectedFlow = undefined;
    ctx.session.email = undefined;
    ctx.session.awaitingEmail = false;
    ctx.session.awaitingAccount = false;
    ctx.session.currentStep = undefined;
    ctx.session.tier = undefined;
    await ctx.scene.enter('onboarding');
  }

  @SceneEnter()
  async onEnter(ctx: BotContext) {
    ctx.session.currentStep = 'signals:step1';
    ctx.session.awaitingEmail = false;
    ctx.session.awaitingAccount = false;
    await this.botService.sendWithKeyboard(ctx, ACCOUNT_CREATION_TEXT, sigStep1Keyboard());
  }

  @Action(CALLBACKS.sigRegistered)
  async onRegistered(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'registered', lastStep: 'sig_registered' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await this.askForTradingAccount(ctx);
  }

  @Action(CALLBACKS.sigAlreadyHaveAccount)
  async onAlreadyHaveAccount(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'registered', lastStep: 'sig_already_have' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await this.askForTradingAccount(ctx);
  }

  private async askForTradingAccount(ctx: BotContext) {
    ctx.session.currentStep = 'signals:account_collection';
    ctx.session.awaitingAccount = true;
    const text = `Gửi số tài khoản trading để được hỗ trợ nhanh hơn.\n\nVí dụ: ACC: 12345678`;
    await ctx.reply(text, sigAccountKeyboard());
  }

  @Action(CALLBACKS.sigSkipAccount)
  async onSkipAccount(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.awaitingAccount = false;
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

  @Action(CALLBACKS.sigDeposited)
  async onDeposited(ctx: BotContext) {
    await ctx.answerCbQuery();
    const userId = BigInt(ctx.from!.id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'deposit_claimed', lastStep: 'sig_deposit_claimed' },
    });

    await this.adminService.notifyDepositClaimed(
      ctx.from!.id,
      ctx.from?.username,
      user?.tradingAccount,
    );

    ctx.session.currentStep = 'signals:step3_email';
    ctx.session.awaitingEmail = true;
    await ctx.reply('✅ Tuyệt vời! Vui lòng gửi email bạn dùng để tạo tài khoản, để tôi kiểm tra trạng thái.');
  }

  // Backward compat for old callback
  @Action(CALLBACKS.sigDepositedDone)
  async onDepositedDone(ctx: BotContext) {
    await this.onDeposited(ctx);
  }

  @Action(CALLBACKS.sigCreatedAccount)
  async onCreatedAccount(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'registered', lastStep: 'sig_created_account' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await this.askForTradingAccount(ctx);
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
    if (!message || !ctx.from) return;

    if (ctx.session.awaitingAccount) {
      const accMatch = message.match(/(?:ACC[:\s]*)?(\d{6,10})/i);
      if (accMatch) {
        const account = accMatch[1];
        await this.prisma.user.update({
          where: { id: BigInt(ctx.from.id) },
          data: { tradingAccount: account, status: 'account_submitted', lastStep: 'account_submitted' },
        });
        ctx.session.awaitingAccount = false;

        await this.adminService.notifyAccountSubmitted(ctx.from.id, ctx.from?.username, account);
        await ctx.reply(`✅ Tài khoản ${account} đã lưu. Tiếp tục nào!`);
        await this.showDepositStep(ctx);
        return;
      }
    }

    if (ctx.session.awaitingEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailMatch = message.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
      if (emailMatch && emailRegex.test(emailMatch[0])) {
        const email = emailMatch[0];
        ctx.session.email = email;
        ctx.session.awaitingEmail = false;

        await this.prisma.user.update({
          where: { id: BigInt(ctx.from.id) },
          data: { status: 'done', lastStep: 'sig_email_submitted' },
        }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

        await this.adminService.notifyAdminEmail(ctx.from.id, ctx.from?.username || ctx.from?.first_name || '', email, 'Signals');
        await ctx.reply(`✅ Cảm ơn! Email đã nhận: ${email}`);
        return;
      }
      await ctx.reply('Vui lòng nhập email hợp lệ (ví dụ: ten@example.com)');
      return;
    }

    const displayName = this.botService.getDisplayName(ctx);
    await this.adminService.forwardUserMessage(ctx.from.id, displayName, message);
    await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
  }
}
