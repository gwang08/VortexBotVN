import { Logger } from '@nestjs/common';
import { Scene, SceneEnter, Action, On, Command } from 'nestjs-telegraf';
import type { BotContext } from '../../common/interfaces/session.interface';
import {
  CALLBACKS,
  BROKER_IB,
  BROKER_SIGNUP_LINKS,
  CHANNEL_URL,
  VIDEO_GUIDES,
} from '../../common/constants';
import {
  registerKeyboard,
  warpKeyboard,
  alreadyHaveAccountKeyboard,
  puPrimeTransferKeyboard,
  emailTransferKeyboard,
  screenshotConfirmKeyboard,
  depositKeyboard,
  verifyKeyboard,
  unlockKeyboard,
} from '../../common/keyboards';
import { puPrimeTransferMedia } from '../../common/media';
import { AdminService } from '../../admin/admin.service';
import { BotService } from '../../bot/bot.service';
import { PrismaService } from '../../prisma/prisma.service';

// Build mailto: URL with pre-filled subject + body so user only edits UID.
function buildMailto(to: string, subject: string, body: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

@Scene('setup')
export class SetupScene {
  private readonly logger = new Logger(SetupScene.name);

  constructor(
    private adminService: AdminService,
    private botService: BotService,
    private prisma: PrismaService,
  ) {}

  @Command('start')
  async onRestart(ctx: BotContext) {
    await ctx.scene.leave();
    this.resetSession(ctx);
    await ctx.scene.enter('onboarding');
  }

  // ── Quay lại Menu (works inside setup scene sub-screens) ──
  @Action(CALLBACKS.backToMenu)
  async onBackToMenu(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    this.resetSession(ctx);
    await ctx.scene.enter('onboarding');
  }

  private resetSession(ctx: BotContext) {
    ctx.session.selectedProduct = undefined;
    ctx.session.selectedBroker = undefined;
    ctx.session.isVipFlow = undefined;
    ctx.session.currentStep = undefined;
    ctx.session.awaitingUid = undefined;
    ctx.session.tier = undefined;
  }

  // ── Scene entry: register or already-have branching ──
  @SceneEnter()
  async onEnter(ctx: BotContext) {
    if (ctx.session.currentStep === 'setup:already_have') {
      return this.showAlreadyHaveAccount(ctx);
    }
    return this.showRegisterScreen(ctx);
  }

  // ── Screen 6/7/8: Register (per broker) ──
  private async showRegisterScreen(ctx: BotContext) {
    const broker = ctx.session.selectedBroker || 'puprime';
    const names: Record<string, string> = { puprime: 'PU Prime', ultima: 'Ultima Markets', vantage: 'Vantage', startrader: 'STARTRADER' };
    const link = BROKER_SIGNUP_LINKS[broker] || BROKER_SIGNUP_LINKS.puprime;
    const name = names[broker] || 'PU Prime';

    ctx.session.currentStep = 'setup:register';
    // PU Prime / Ultima hiển thị STEP 1 đầy đủ với video; còn lại giữ ngắn
    let text: string;
    if (broker === 'puprime') {
      text = `BƯỚC 1:

Tạo tài khoản PU Prime theo link: ${link}

Video hướng dẫn:

📣 Mở tài khoản Live PuPrime: ${VIDEO_GUIDES.openAccount}
💋 Xác minh CMND/CCCD: ${VIDEO_GUIDES.idAuth}
⭐️ Xác minh địa chỉ: ${VIDEO_GUIDES.addressVerify}
🎲 Sử dụng khuyến mãi: ${VIDEO_GUIDES.usePromotions}

Nếu đã có tài khoản PU Prime hãy bấm nút bên dưới`;
    } else if (broker === 'ultima') {
      // Video URL first so Telegram shows the preview for it
      text = `⭐️ Đăng ký bằng UM App:
${VIDEO_GUIDES.signUpUltima}

<b>Link Đăng ký:</b> ${link}

Sau khi đăng ký bấm: Đã đăng ký`;
    } else {
      text = `Đăng ký ${name}: ${link}\n\nSau khi đăng ký bấm: Đã đăng ký`;
    }
    // Ultima register preview video UM App
    const previewUrl = broker === 'ultima' ? VIDEO_GUIDES.signUpUltima : undefined;
    const parseMode = broker === 'ultima' ? 'HTML' : undefined;
    await this.botService.sendWithKeyboard(ctx, text, registerKeyboard(), previewUrl, parseMode);
  }

  // ── Đã đăng ký → Deposit ──
  @Action(CALLBACKS.ctRegistered)
  async onRegistered(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'registered', lastStep: 'registered' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await this.showDepositScreen(ctx);
  }

  // ── Cannot open link → WARP ──
  @Action(CALLBACKS.cantOpenLink)
  async onCantOpenLink(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'setup:warp';
    await ctx.reply('Cài 1.1.1.1\n\nBật Connect\n\nMở lại link', warpKeyboard());
  }

  @Action(CALLBACKS.reopenLink)
  async onReopenLink(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.showRegisterScreen(ctx);
  }

  // ── Screen 9: Already have account ──
  private async showAlreadyHaveAccount(ctx: BotContext) {
    ctx.session.currentStep = 'setup:already_have';
    await ctx.reply('Bạn đã có tài khoản broker?\n\nChuyển IB để mở khoá Copy Trading', alreadyHaveAccountKeyboard());
  }

  @Action(CALLBACKS.alreadyHaveAccount)
  async onAlreadyHaveAccount(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.showAlreadyHaveAccount(ctx);
  }

  // ── Screen 10: PU Prime Transfer (4 images) ──
  @Action(CALLBACKS.brokerPuPrime)
  async onBrokerPuPrime(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedBroker = 'puprime';
    ctx.session.currentStep = 'setup:transfer_puprime';

    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'registered', lastStep: 'transfer_puprime' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    try {
      await this.botService.sendMediaGroup(ctx, puPrimeTransferMedia());
    } catch {
      this.logger.warn('PU Prime transfer images not found');
    }

    const text = `Chuyển IB PU Prime

Profile

Transfer IB/CPA

Partnership Type:
IB

IB Number:
${BROKER_IB.puprime.ibNumber}

Reason:
Join BMR Copytrade

Submit`;
    await ctx.reply(text, puPrimeTransferKeyboard());
  }

  // ── Screen 11: Ultima Transfer ──
  // Vào thẳng từ "Đã có tài khoản Ultima" (skip broker picker)
  @Action(CALLBACKS.alreadyHaveUltima)
  async onAlreadyHaveUltima(ctx: BotContext) {
    await ctx.answerCbQuery();
    return this.showUltimaTransfer(ctx);
  }

  @Action(CALLBACKS.brokerUltima)
  async onBrokerUltima(ctx: BotContext) {
    await ctx.answerCbQuery();
    return this.showUltimaTransfer(ctx);
  }

  private async showUltimaTransfer(ctx: BotContext) {
    ctx.session.selectedBroker = 'ultima';
    ctx.session.currentStep = 'setup:transfer_ultima';

    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'registered', lastStep: 'transfer_ultima' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    const subject = 'IB Transfer Request';
    const body = `Please transfer my account to be under IB ${BROKER_IB.ultima.ibNumber}\nMy information:\nUID: (Your UID)`;
    const mailto = buildMailto(BROKER_IB.ultima.email!, subject, body);

    const text = `📩 Gửi đến: ${BROKER_IB.ultima.email}

📋 Tiêu đề: ${subject}

📝 Nội dung:
Please transfer my account to be under IB ${BROKER_IB.ultima.ibNumber}
My information:
UID: (Your UID)

Bấm "Mở App Email" để mở mail có sẵn template — chỉ cần thay (Your UID) bằng UID thật của bạn.`;
    await ctx.reply(text, emailTransferKeyboard(mailto));
  }

  // ── Screen 11c: STARTRADER Transfer ──
  @Action(CALLBACKS.alreadyHaveStartrader)
  async onAlreadyHaveStartrader(ctx: BotContext) {
    await ctx.answerCbQuery();
    return this.showStartraderTransfer(ctx);
  }

  @Action(CALLBACKS.brokerStartrader)
  async onBrokerStartrader(ctx: BotContext) {
    await ctx.answerCbQuery();
    return this.showStartraderTransfer(ctx);
  }

  private async showStartraderTransfer(ctx: BotContext) {
    ctx.session.selectedBroker = 'startrader';
    ctx.session.currentStep = 'setup:transfer_startrader';

    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'registered', lastStep: 'transfer_startrader' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    const subject = 'Transfer request';
    const body = `Dear team, please move my account to under new IB ${BROKER_IB.startrader.ibNumber}. Thanks.`;
    const mailto = buildMailto(BROKER_IB.startrader.email!, subject, body);

    const text = `📩 Gửi đến: ${BROKER_IB.startrader.email}

📋 Tiêu đề: ${subject}

📝 Nội dung:
${body}

Bấm "Mở App Email" để mở mail có sẵn template.`;
    await ctx.reply(text, emailTransferKeyboard(mailto));
  }

  // ── Screen 12: Vantage Transfer ──
  @Action(CALLBACKS.brokerVantage)
  async onBrokerVantage(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedBroker = 'vantage';
    ctx.session.currentStep = 'setup:transfer_vantage';

    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'registered', lastStep: 'transfer_vantage' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    const text = `🌐 Chuyển tài khoản Vantage sang BMR

Vui lòng gửi email từ địa chỉ email đã đăng ký Vantage:

Gửi đến:
${BROKER_IB.vantage.email}

Tiêu đề:
Change account owner — (email của bạn)

Nội dung:
Please move my account under IB ${BROKER_IB.vantage.ibNumber}`;
    await ctx.reply(text, emailTransferKeyboard());
  }

  // ── IB Submitted / Sent Email → Deposit ──
  @Action(CALLBACKS.ibSubmitted)
  async onIbSubmitted(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { lastStep: 'ib_submitted' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await this.showDepositScreen(ctx);
  }

  @Action(CALLBACKS.sentEmail)
  async onSentEmail(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { lastStep: 'email_sent' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    ctx.session.currentStep = 'setup:screenshot_confirm';
    const text = `📸 Gửi screenshot cho @KevinBMR để xác nhận:

1. Tài khoản copy trading của bạn
2. Email bạn đã gửi

Admin sẽ kiểm tra và mở khoá copy trading cho bạn.`;
    await ctx.reply(text, screenshotConfirmKeyboard());
  }

  @Action(CALLBACKS.sentScreenshot)
  async onSentScreenshot(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { lastStep: 'screenshot_sent' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await this.showDepositScreen(ctx);
  }

  // ── Screen 13: Deposit (BƯỚC 3) ──
  private async showDepositScreen(ctx: BotContext) {
    ctx.session.currentStep = 'setup:deposit';
    const broker = ctx.session.selectedBroker;
    // STARTRADER chưa có video — chỉ hiện text, không có phần Video hướng dẫn
    const baseText = `BƯỚC 3:

Chuyển tiền sang tài khoản Copy Trading

Sau khi tài khoản Copy Trading được duyệt, vào tài khoản Live có sẵn số dư và chuyển tiền sang tài khoản Copy Trading mới để bắt đầu copy trading.`;
    const ultimaVideos = `

Video hướng dẫn:

💸 Hướng dẫn nạp tiền bằng UM App
${VIDEO_GUIDES.depositUltimaApp}
💠 Hướng dẫn đăng nhập MT5
${VIDEO_GUIDES.loginMt5}
💻 Hướng dẫn đăng nhập MT5 trên máy tính
${VIDEO_GUIDES.loginMt5Laptop}
💝 Hướng dẫn nhận khuyến mãi Ultima Markets
${VIDEO_GUIDES.ultimaPromotion}`;
    const defaultVideos = `

Video hướng dẫn:

🔪 Nạp bằng Crypto: ${VIDEO_GUIDES.depositCrypto}
⭐️ Nạp bằng thẻ tín dụng: ${VIDEO_GUIDES.depositCreditCard}
💸 Nạp bằng E-Wallet: ${VIDEO_GUIDES.depositEWallet}
🍒 Nạp bằng ngân hàng nội địa: ${VIDEO_GUIDES.depositLocalBank}
💝 Nạp bằng ngân hàng quốc tế: ${VIDEO_GUIDES.depositIntlBank}
🍀 Rút tiền Crypto: ${VIDEO_GUIDES.withdrawCrypto}
🔺 Rút tiền bằng thẻ tín dụng: ${VIDEO_GUIDES.withdrawCreditCard}
💠 Rút tiền bằng ngân hàng nội địa: ${VIDEO_GUIDES.withdrawLocalBank}
💻 Rút tiền bằng ngân hàng quốc tế: ${VIDEO_GUIDES.withdrawIntlBank}`;
    let videos = '';
    if (broker === 'ultima') videos = ultimaVideos;
    else if (broker !== 'startrader') videos = defaultVideos;
    const text = `${baseText}${videos}

Sẵn sàng cho bước tiếp theo?`;
    await ctx.reply(text, depositKeyboard());
  }

  // ── Đã nạp → Verify ──
  @Action(CALLBACKS.ctDeposited)
  async onDeposited(ctx: BotContext) {
    await ctx.answerCbQuery();
    const userId = BigInt(ctx.from!.id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'deposit_claimed', lastStep: 'deposit_claimed' },
    });

    await this.adminService.notifyDepositClaimed(
      ctx.from!.id,
      ctx.from?.username,
      ctx.from?.first_name,
      user?.tradingAccount,
    );

    await this.showVerifyScreen(ctx);
  }

  // ── Screen 14: Verify (Send UID) ──
  @Action(CALLBACKS.sendUid)
  async onSendUid(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.awaitingUid = true;
    await ctx.reply('Vui lòng gửi UID của bạn:');
  }

  private async showVerifyScreen(ctx: BotContext) {
    ctx.session.currentStep = 'setup:verify';
    const text = `Gửi UID để xác minh

🔐 Mở khoá:

Grok AI Gold
BMR Copy Trading
BMR Scalper Gold
Gói VIP`;
    await ctx.reply(text, verifyKeyboard());
  }

  // ── Screen 15: Unlock ──
  private async showUnlockScreen(ctx: BotContext) {
    ctx.session.currentStep = 'setup:unlock';
    await ctx.reply('🔥 Đã mở quyền truy cập\n\nChọn hệ thống của bạn:', unlockKeyboard());
  }

  // ── Unlock system buttons ──
  @Action(CALLBACKS.unlockGrokAiGold)
  async onUnlockGrok(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.markDone(ctx);
    await ctx.reply('🤖 Grok AI Gold đã kích hoạt!\n\nTheo dõi kết quả: https://t.me/GrokAIGold\nHỗ trợ: @FinBMR');
  }

  @Action(CALLBACKS.unlockBmrCopyTrading)
  async onUnlockBmrCopy(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.markDone(ctx);
    await ctx.reply('🏆 BMR Copy Trading đã kích hoạt!\n\nTheo dõi kết quả: https://t.me/BMRCopyTrade\nHỗ trợ: @FinBMR');
  }

  @Action(CALLBACKS.unlockBmrCopy)
  async onUnlockDulcieGold(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.markDone(ctx);
    await ctx.reply('🔥 Dulcie Gold đã kích hoạt!\n\nTheo dõi kết quả: https://t.me/BMRCopyTrade\nHỗ trợ: @FinBMR');
  }

  @Action(CALLBACKS.unlockBmrScalperGold)
  async onUnlockBmrScalper(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.markDone(ctx);
    await ctx.reply(`🚀 BMR Scalper Gold đã kích hoạt!\n\nTheo dõi kết quả: ${CHANNEL_URL}\nHỗ trợ: @FinBMR`);
  }

  @Action(CALLBACKS.unlockVipPackage)
  async onUnlockVip(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'done', isVip: true, tier: 'vip', lastStep: 'unlock_vip' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await ctx.reply(`👑 Gói VIP đã kích hoạt!\n\nTheo dõi kết quả: ${CHANNEL_URL}\nHỗ trợ: @FinBMR`);
  }

  // ── Contact Admin ──
  @Action(CALLBACKS.contactAdmin)
  async onContactAdmin(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply('Cảm ơn! Admin đã được thông báo. Em sẽ liên hệ lại sớm.\n\n👤 Liên hệ: @FinBMR');
  }

  // ── Register callbacks from VIP flow (scene-level) ──
  @Action(CALLBACKS.registerPuPrime)
  async onRegisterPuPrime(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedBroker = 'puprime';
    await this.showRegisterScreen(ctx);
  }

  @Action(CALLBACKS.registerUltima)
  async onRegisterUltima(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedBroker = 'ultima';
    await this.showRegisterScreen(ctx);
  }

  @Action(CALLBACKS.registerVantage)
  async onRegisterVantage(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedBroker = 'vantage';
    await this.showRegisterScreen(ctx);
  }

  @Action(CALLBACKS.registerStarTrader)
  async onRegisterStarTrader(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedBroker = 'startrader';
    await this.showRegisterScreen(ctx);
  }

  // ── Text handler (UID input + admin commands) ──
  @On('text')
  async onText(ctx: BotContext) {
    const message = (ctx.message as any)?.text;
    if (!message || !ctx.from) return;

    // Admin: dispatch slash commands inline.
    if (this.adminService.isAdmin(ctx.chat!.id)) {
      if (message.startsWith('/')) {
        await this.adminService.handleCommand(ctx, message);
      }
      return;
    }

    if (message.startsWith('/')) return;

    // Handle UID input
    if (ctx.session.awaitingUid) {
      const uidMatch = message.match(/\d{4,}/);
      if (uidMatch) {
        const uid = uidMatch[0];
        ctx.session.awaitingUid = false;

        await this.prisma.user.update({
          where: { id: BigInt(ctx.from!.id) },
          data: { tradingAccount: uid, status: 'account_submitted', lastStep: 'uid_submitted' },
        }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

        await this.adminService.notifyAccountSubmitted(
          ctx.from!.id,
          ctx.from?.username,
          ctx.from?.first_name,
          uid,
        );
        await ctx.reply(`✅ Đã nhận UID ${uid}.`);
        await this.showUnlockScreen(ctx);
        return;
      }
      await ctx.reply('Vui lòng gửi UID hợp lệ (chỉ số).');
      return;
    }

    // Forward user messages to admin
    await this.adminService.forwardUserMessage(
      ctx.from.id,
      ctx.from.username,
      ctx.from.first_name,
      message,
    );
    await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
  }

  // ── Helpers ──
  private async markDone(ctx: BotContext) {
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'done', lastStep: 'unlock' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
  }
}
