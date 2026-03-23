import { Logger } from '@nestjs/common';
import { Scene, SceneEnter, Action, On, Command } from 'nestjs-telegraf';
import type { BotContext } from '../../common/interfaces/session.interface';
import {
  CALLBACKS,
  ACCOUNT_CREATION_TEXT,
  IB_CODE,
  DEPOSIT_VIDEO_GUIDE_TEXT,
} from '../../common/constants';
import {
  ctStep1Keyboard,
  ctIbKeyboard,
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
    ctx.session.currentStep = undefined;
    ctx.session.tier = undefined;
    await ctx.scene.enter('onboarding');
  }

  @SceneEnter()
  async onEnter(ctx: BotContext) {
    ctx.session.currentStep = 'copytrading:step1';
    ctx.session.awaitingEmail = false;
    ctx.session.awaitingAccount = false;

    await this.botService.sendWithKeyboard(ctx, `BƯỚC 1:\n\n${ACCOUNT_CREATION_TEXT}`, ctStep1Keyboard());
  }

  @Action(CALLBACKS.ctRegistered)
  async onRegistered(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'registered', lastStep: 'ct_registered' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await this.askForTradingAccount(ctx);
  }

  @Action(CALLBACKS.alreadyHavePuPrime)
  async onAlreadyHavePuPrime(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:ib_transfer';
    ctx.session.awaitingEmail = true;

    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'registered', lastStep: 'ct_ib_transfer' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    try { await this.botService.sendMediaGroup(ctx, ctIbMobileMedia()); } catch {
      await ctx.reply('⚡️ HƯỚNG DẪN CHUYỂN MÃ HỖ TRỢ TRÊN ĐIỆN THOẠI');
    }
    try { await this.botService.sendMediaGroup(ctx, ctIbWebMedia()); } catch {
      await ctx.reply('⚡️ HƯỚNG DẪN CHUYỂN MÃ HỖ TRỢ TRÊN WEB');
    }

    await this.botService.sendWithKeyboard(ctx, `Mã IB: <code>${IB_CODE}</code>\n\nSau khi chuyển mã xong, gửi email bạn dùng để tạo tài khoản để em xử lý giúp nhé`, { ...ctIbKeyboard(), parse_mode: 'HTML' });
  }

  private async askForTradingAccount(ctx: BotContext) {
    ctx.session.currentStep = 'copytrading:account_collection';
    ctx.session.awaitingAccount = true;
    const text = `Gửi số tài khoản trading để được hỗ trợ nhanh hơn.\n\nVí dụ: ACC: 12345678`;
    await ctx.reply(text, ctAccountKeyboard());
  }

  @Action(CALLBACKS.ctSkipAccount)
  async onSkipAccount(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.awaitingAccount = false;
    await this.showStep2(ctx);
  }

  @Action(CALLBACKS.ctNextStep2)
  async onStep2(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.showStep2(ctx);
  }

  private async showStep2(ctx: BotContext) {
    ctx.session.currentStep = 'copytrading:step2';
    try { await this.botService.sendMediaGroup(ctx, ctStep2Media()); } catch { await ctx.reply('(Hình hướng dẫn Bước 2)'); }
    await this.botService.sendWithKeyboard(ctx, `BƯỚC 2:\n\n2.1 Tải ứng dụng PU PRIME\n\n2.2 Mở app PU Prime, đăng nhập. Chọn "Account ID" để xem tài khoản.\n\n2.3 Chọn "New Live Account" → Platform: "Copy Trading", Type: "Standard", Currency: "USD" → Chấp nhận → Gửi.\n\n2.4 Chọn "Agree" và liên hệ Hỗ trợ để đẩy nhanh duyệt. Email xác nhận trong 1 ngày làm việc.\n\nBạn sẵn sàng cho bước tiếp theo chưa?`, ctStep2Keyboard());
  }

  @Action(CALLBACKS.ctNextStep3)
  async onStep3(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:step3';
    try { await this.botService.sendMediaGroup(ctx, ctStep3Media()); } catch { await ctx.reply('(Hình hướng dẫn Bước 3)'); }
    await this.botService.sendWithKeyboard(ctx, `BƯỚC 3:\n\nChuyển Tiền Vào Tài Khoản Copy Trading\n\nSau khi tài khoản được duyệt, vào tài khoản Live và chuyển tiền sang tài khoản Copy Trading.\n\n${DEPOSIT_VIDEO_GUIDE_TEXT}\n\nBạn sẵn sàng cho bước tiếp theo chưa?`, ctStep3Keyboard());
  }

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

    await ctx.reply('✅ Tuyệt vời! Chuyển sang bước tiếp theo...');
    await this.showStep4(ctx);
  }

  @Action(CALLBACKS.ctNextStep4)
  async onStep4(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.showStep4(ctx);
  }

  private async showStep4(ctx: BotContext) {
    ctx.session.currentStep = 'copytrading:step4';
    try { await this.botService.sendMediaGroup(ctx, ctStep4Media()); } catch { await ctx.reply('(Hình hướng dẫn Bước 4)'); }
    await this.botService.sendWithKeyboard(ctx, `BƯỚC 4:\n\nBạn sẽ thấy Master "Red Bull X" & "BMR Scalper" trong Top Lợi Nhuận Năm Cao Nhất. Chọn "View" để xem chi tiết.\n\nLợi nhuận YTD: 213753%\nNgười copy: 1859\nChia sẻ lợi nhuận: 30%\n\nBạn sẵn sàng cho bước cuối chưa?`, ctStep4Keyboard());
  }

  @Action(CALLBACKS.ctFinalStep)
  async onFinalStep(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:final';
    try { await this.botService.sendMediaGroup(ctx, ctFinalMedia()); } catch { await ctx.reply('(Hình hướng dẫn Bước Cuối)'); }
    await ctx.reply(`BƯỚC CUỐI:\n\nCấu Hình và Bắt Đầu Copy\n\nCopy Mode: "Equivalent Used Margin"\nSố tiền đầu tư: Nhập số tiền của bạn\nQuản Lý Rủi Ro: 95% (khuyến nghị)\nLot Rounding: TẮT\n\nNhấn Submit để bắt đầu copy trading.`, ctFinalKeyboard());
  }

  @Action(CALLBACKS.ctCopyEnabled)
  async onCopyEnabled(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'copy_claimed', lastStep: 'ct_copy_enabled' },
    });

    await ctx.reply('🔥 Bạn đã sẵn sàng!\n\nTheo dõi kết quả hàng ngày tại kênh.\nHỗ trợ: @KenMasterTrade');
    await ctx.scene.leave();
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

    // Handle admin commands directly (scene intercepts before middleware)
    if (message.startsWith('/')) {
      if (this.adminService.isAdmin(ctx.chat!.id)) {
        await this.adminService.handleCommand(ctx, message);
      }
      return;
    }

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
        await this.showStep2(ctx);
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
        await this.adminService.notifyAdminEmail(ctx.from.id, ctx.from?.username || ctx.from?.first_name || '', email, 'CopyTrading IB Transfer');
        await ctx.reply(`✅ Cảm ơn! Email đã nhận: ${email}\n\nChúng tôi sẽ xử lý chuyển IB sớm. Admin sẽ liên hệ nếu cần.`);
        return;
      }
    }

    const displayName = this.botService.getDisplayName(ctx);
    await this.adminService.forwardUserMessage(ctx.from.id, displayName, message);
    await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
  }
}
