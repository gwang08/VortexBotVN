import { Logger } from '@nestjs/common';
import { Scene, SceneEnter, Action, On, Command } from 'nestjs-telegraf';
import type { BotContext } from '../../common/interfaces/session.interface';
import {
  CALLBACKS,
  BROKER_IB,
  DEPOSIT_VIDEO_GUIDE_TEXT,
  PUPRIME_SIGNUP_LINK,
} from '../../common/constants';
import {
  brokerQuestionKeyboard,
  registerKeyboard,
  warpKeyboard,
  transferBrokerKeyboard,
  puPrimeTransferKeyboard,
  ultimaTransferKeyboard,
  vantageTransferKeyboard,
  depositKeyboard,
  verifyKeyboard,
  unlockKeyboard,
  ctAccountKeyboard,
  ctStep2Keyboard,
  ctStep3Keyboard,
  ctStep4Keyboard,
  ctFinalKeyboard,
} from '../../common/keyboards';
import {
  ctIbMobileMedia,
  ctIbWebMedia,
  ctStep2Media,
  ctStep3Media,
  ctStep4Media,
  ctFinalMedia,
} from '../../common/media';
import { AdminService } from '../../admin/admin.service';
import { BotService } from '../../bot/bot.service';
import { PrismaService } from '../../prisma/prisma.service';

@Scene('copytrading')
export class CopyTradingScene {
  private readonly logger = new Logger(CopyTradingScene.name);

  constructor(
    private adminService: AdminService,
    private botService: BotService,
    private prisma: PrismaService,
  ) {}

  @Action(CALLBACKS.signals)
  async onSwitchToSignals(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'signals';
    await ctx.scene.enter('signals');
  }

  @Action(CALLBACKS.copytrading)
  async onSwitchToCopyTrading(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.scene.enter('copytrading');
  }

  @Command('start')
  async onRestart(ctx: BotContext) {
    await ctx.scene.leave();
    ctx.session.capitalRange = undefined;
    ctx.session.selectedFlow = undefined;
    ctx.session.email = undefined;
    ctx.session.awaitingEmail = false;
    ctx.session.awaitingAccount = false;
    ctx.session.awaitingUid = false;
    ctx.session.currentStep = undefined;
    ctx.session.tier = undefined;
    ctx.session.selectedBroker = undefined;
    await ctx.scene.enter('onboarding');
  }

  // ── SCREEN 5: BROKER QUESTION ──
  @SceneEnter()
  async onEnter(ctx: BotContext) {
    ctx.session.currentStep = 'copytrading:broker_question';
    ctx.session.awaitingEmail = false;
    ctx.session.awaitingAccount = false;
    ctx.session.awaitingUid = false;
    await ctx.reply('Bạn đã có tài khoản broker chưa?', brokerQuestionKeyboard());
  }

  // ── SCREEN 6: REGISTER NEW ──
  @Action(CALLBACKS.registerNew)
  async onRegisterNew(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:register';
    await this.showRegisterScreen(ctx);
  }

  private async showRegisterScreen(ctx: BotContext) {
    const text = `Đăng ký:

${PUPRIME_SIGNUP_LINK}`;
    await this.botService.sendWithKeyboard(ctx, text, registerKeyboard());
  }

  // ── SCREEN 7: 1.1.1.1 WARP ──
  @Action(CALLBACKS.cantOpenLink)
  async onCantOpenLink(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:warp';
    const text = `Cài 1.1.1.1

Bật lên

Mở lại link`;
    await ctx.reply(text, warpKeyboard());
  }

  @Action(CALLBACKS.reopenLink)
  async onReopenLink(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:register';
    await this.showRegisterScreen(ctx);
  }

  // ── I Registered -> Deposit ──
  @Action(CALLBACKS.ctRegistered)
  async onRegistered(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'registered', lastStep: 'ct_registered' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await this.showDepositScreen(ctx);
  }

  // ── SCREEN 8: TRANSFER IB - CHOOSE BROKER ──
  @Action(CALLBACKS.transferIb)
  async onTransferIb(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:transfer_broker';
    await ctx.reply('Chọn broker', transferBrokerKeyboard());
  }

  // ── SCREEN 9: PU PRIME TRANSFER ──
  @Action(CALLBACKS.brokerPuPrime)
  async onBrokerPuPrime(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:transfer_puprime';
    ctx.session.selectedBroker = 'puprime';

    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'registered', lastStep: 'ct_transfer_puprime' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    try {
      await this.botService.sendMediaGroup(ctx, ctIbMobileMedia());
    } catch {
      this.logger.warn('PU Prime mobile guide images not found');
    }

    const text = `Profile

Chuyển IB/CPA

IB Number:
${BROKER_IB.puprime.ibNumber}

Submit`;
    await ctx.reply(text, puPrimeTransferKeyboard());
  }

  // ── SCREEN 10: ULTIMA TRANSFER ──
  @Action(CALLBACKS.brokerUltima)
  async onBrokerUltima(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:transfer_ultima';
    ctx.session.selectedBroker = 'ultima';

    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'registered', lastStep: 'ct_transfer_ultima' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    const text = `Gửi email:

IB ${BROKER_IB.ultima.ibNumber}

Gửi UID

Gửi tới: ${BROKER_IB.ultima.email}`;
    await ctx.reply(text, ultimaTransferKeyboard());
  }

  // ── SCREEN 11: VANTAGE TRANSFER ──
  @Action(CALLBACKS.brokerVantage)
  async onBrokerVantage(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:transfer_vantage';
    ctx.session.selectedBroker = 'vantage';

    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'registered', lastStep: 'ct_transfer_vantage' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    ctx.session.awaitingUid = true;
    const text = `Liên hệ support

Yêu cầu chuyển IB

Gửi UID`;
    await ctx.reply(text, vantageTransferKeyboard());
  }

  // ── IB SUBMITTED / SENT EMAIL -> Deposit ──
  @Action(CALLBACKS.ibSubmitted)
  async onIbSubmitted(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { lastStep: 'ct_ib_submitted' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await this.showDepositScreen(ctx);
  }

  @Action(CALLBACKS.sentEmail)
  async onSentEmail(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { lastStep: 'ct_email_sent' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await this.showDepositScreen(ctx);
  }

  // ── SCREEN 11 (DEPOSIT) ──
  private async showDepositScreen(ctx: BotContext) {
    ctx.session.currentStep = 'copytrading:deposit';
    const text = `💰 Nạp tiền:

💵 $500
💰 $1000
💎 $5000`;
    await ctx.reply(text, depositKeyboard());
  }

  // ── I Deposited -> Verify ──
  @Action(CALLBACKS.ctDeposited)
  async onDeposited(ctx: BotContext) {
    await ctx.answerCbQuery();
    const userId = BigInt(ctx.from!.id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'deposit_claimed', lastStep: 'ct_deposit_claimed' },
    });

    await this.adminService.notifyDepositClaimed(
      ctx.from!.id,
      ctx.from?.username,
      user?.tradingAccount,
    );

    await this.showVerifyScreen(ctx);
  }

  // ── SCREEN 12: VERIFY (Send UID) ──
  private async showVerifyScreen(ctx: BotContext) {
    ctx.session.currentStep = 'copytrading:verify';
    ctx.session.awaitingUid = true;
    await ctx.reply('Gửi UID', verifyKeyboard());
  }

  // ── SEND UID button ──
  @Action(CALLBACKS.sendUid)
  async onSendUid(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.awaitingUid = true;

    if (ctx.session.currentStep === 'copytrading:transfer_vantage') {
      ctx.session.currentStep = 'copytrading:vantage_uid';
    }
    await ctx.reply('Gửi UID:');
  }

  // ── SCREEN 13: UNLOCK ──
  private async showUnlockScreen(ctx: BotContext) {
    ctx.session.currentStep = 'copytrading:unlock';
    const text = `🔥 Đã mở quyền

Copytrade
VIP Package`;
    await ctx.reply(text, unlockKeyboard());
  }

  // ── START COPYTRADE (detailed steps 2-5) ──
  @Action(CALLBACKS.startCopytradeSetup)
  async onStartCopytradeSetup(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.askForTradingAccount(ctx);
  }

  // ── JOIN VIP ──
  @Action(CALLBACKS.joinVip)
  async onJoinVip(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'signals';
    await ctx.scene.enter('signals');
  }

  // ── CONTACT ADMIN ──
  @Action(CALLBACKS.contactAdmin)
  async onContactAdmin(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply('Cảm ơn! Admin đã được thông báo.');
  }

  @Action(CALLBACKS.vipSupport)
  async onVipSupport(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply('💎 Hỗ Trợ VIP\n\n👤 Liên hệ: @KenMasterTrade');
  }

  // ── LEGACY: Start Setup from onboarding ──
  @Action(CALLBACKS.startSetup)
  async onStartSetup(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.onEnter(ctx);
  }

  // ── LEGACY: Already have PuPrime ──
  @Action(CALLBACKS.alreadyHavePuPrime)
  async onAlreadyHavePuPrime(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.onTransferIb(ctx);
  }

  @Action(CALLBACKS.registerAccount)
  async onRegisterAccount(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.onRegisterNew(ctx);
  }

  // ── VIP Package / Free Signals navigation ──
  @Action(CALLBACKS.vipPackage)
  async onVipPackage(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.scene.enter('onboarding');
  }

  @Action(CALLBACKS.freeSignals)
  async onFreeSignals(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.scene.enter('onboarding');
  }

  // Trading account collection
  private async askForTradingAccount(ctx: BotContext) {
    ctx.session.currentStep = 'copytrading:account_collection';
    ctx.session.awaitingAccount = true;
    await ctx.reply('Gửi số tài khoản trading.\n\nVí dụ: ACC: 12345678', ctAccountKeyboard());
  }

  @Action(CALLBACKS.ctSkipAccount)
  async onSkipAccount(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.awaitingAccount = false;
    await this.showStep2(ctx);
  }

  // ── DETAILED STEPS 2–5 ──

  @Action(CALLBACKS.ctNextStep2)
  async onStep2(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.showStep2(ctx);
  }

  private async showStep2(ctx: BotContext) {
    ctx.session.currentStep = 'copytrading:step2';
    try { await this.botService.sendMediaGroup(ctx, ctStep2Media()); } catch { await ctx.reply('(Hình hướng dẫn Bước 2)'); }
    await this.botService.sendWithKeyboard(ctx, `BƯỚC 2:\n\n2.1 Tải ứng dụng PU PRIME\n\n2.2 Mở app PU Prime, đăng nhập. Chọn "Account ID" để xem tài khoản.\n\n2.3 Chọn "New Live Account" → Platform: "Copy Trading", Type: "Standard", Currency: "USD" → Chấp nhận → Gửi.\n\n2.4 Chọn "Agree" và liên hệ Hỗ trợ để đẩy nhanh duyệt.\n\nBạn sẵn sàng cho bước tiếp theo chưa?`, ctStep2Keyboard());
  }

  @Action(CALLBACKS.ctNextStep3)
  async onStep3(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:step3';
    try { await this.botService.sendMediaGroup(ctx, ctStep3Media()); } catch { await ctx.reply('(Hình hướng dẫn Bước 3)'); }
    await this.botService.sendWithKeyboard(ctx, `BƯỚC 3:\n\nChuyển Tiền Vào Tài Khoản Copy Trading\n\n${DEPOSIT_VIDEO_GUIDE_TEXT}\n\nBạn sẵn sàng cho bước tiếp theo chưa?`, ctStep3Keyboard());
  }

  @Action(CALLBACKS.ctNextStep4)
  async onStep4(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.showStep4(ctx);
  }

  private async showStep4(ctx: BotContext) {
    ctx.session.currentStep = 'copytrading:step4';
    try { await this.botService.sendMediaGroup(ctx, ctStep4Media()); } catch { await ctx.reply('(Hình hướng dẫn Bước 4)'); }
    await this.botService.sendWithKeyboard(ctx, `BƯỚC 4:\n\nBạn sẽ thấy Master "Red Bull X" & "BMR Scalper" trong Top Lợi Nhuận.\n\nLợi nhuận YTD: 213753%\nNgười copy: 1859\nChia sẻ lợi nhuận: 30%\n\nBạn sẵn sàng cho bước cuối chưa?`, ctStep4Keyboard());
  }

  @Action(CALLBACKS.ctFinalStep)
  async onFinalStep(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:final';
    try { await this.botService.sendMediaGroup(ctx, ctFinalMedia()); } catch { await ctx.reply('(Hình hướng dẫn Bước Cuối)'); }
    await ctx.reply(`BƯỚC CUỐI:\n\nCopy Mode: "Equivalent Used Margin"\nSố tiền: Nhập số tiền\nRisk: 95%\nLot Rounding: TẮT\n\nNhấn Submit.`, ctFinalKeyboard());
  }

  @Action(CALLBACKS.ctCopyEnabled)
  async onCopyEnabled(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'copy_claimed', lastStep: 'ct_copy_enabled' },
    });
    await ctx.reply('🔥 Bạn đã sẵn sàng!\n\nHỗ trợ: @KenMasterTrade');
    await ctx.scene.leave();
  }

  @On('text')
  async onText(ctx: BotContext) {
    const message = (ctx.message as any)?.text;
    if (!message || !ctx.from) return;

    if (this.adminService.isAdmin(ctx.chat!.id)) return;
    if (message.startsWith('/')) return;

    // Handle UID input
    if (ctx.session.awaitingUid) {
      const uidMatch = message.match(/\d{4,}/);
      if (uidMatch) {
        const uid = uidMatch[0];
        ctx.session.awaitingUid = false;

        await this.prisma.user.update({
          where: { id: BigInt(ctx.from!.id) },
          data: { tradingAccount: uid, lastStep: 'uid_submitted' },
        }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

        await this.adminService.notifyAccountSubmitted(ctx.from!.id, ctx.from?.username, uid);

        if (ctx.session.currentStep === 'copytrading:vantage_uid' || ctx.session.currentStep === 'copytrading:transfer_vantage') {
          await ctx.reply(`✅ UID ${uid} đã nhận.`);
          await this.showDepositScreen(ctx);
          return;
        }

        await ctx.reply(`✅ UID ${uid} đã nhận.`);
        await this.showUnlockScreen(ctx);
        return;
      }
      await ctx.reply('Vui lòng gửi UID hợp lệ (chỉ số).');
      return;
    }

    // Handle trading account input
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
        await ctx.reply(`✅ Tài khoản ${account} đã lưu.`);
        await this.showStep2(ctx);
        return;
      }
    }

    // Handle email input
    if (ctx.session.awaitingEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailMatch = message.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
      if (emailMatch && emailRegex.test(emailMatch[0])) {
        const email = emailMatch[0];
        ctx.session.email = email;
        ctx.session.awaitingEmail = false;
        await this.adminService.notifyAdminEmail(ctx.from.id, ctx.from?.username || ctx.from?.first_name || '', email, 'CopyTrading IB Transfer');
        await ctx.reply(`✅ Email đã nhận: ${email}`);
        return;
      }
    }

    const displayName = this.botService.getDisplayName(ctx);
    await this.adminService.forwardUserMessage(ctx.from.id, displayName, message);
    await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
  }
}
