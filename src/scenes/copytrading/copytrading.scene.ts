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
  ctStep2Keyboard,
  ctStep3Keyboard,
  ctStep4Keyboard,
} from '../../common/keyboards';
import {
  ctIbMobileMedia,
  ctIbWebMedia,
  ctStep2Media,
  ctStep3Media,
  ctStep4Media,
  ctFinalMedia,
} from '../../common/media';
import { GeminiService } from '../../gemini/gemini.service';
import { AdminService } from '../../admin/admin.service';
import { BotService } from '../../bot/bot.service';

@Scene('copytrading')
export class CopyTradingScene {
  constructor(
    private geminiService: GeminiService,
    private adminService: AdminService,
    private botService: BotService,
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
    ctx.session.currentStep = 'copytrading:step1';
    ctx.session.awaitingEmail = false;

    const text = await this.geminiService.generateResponse({
      currentStep: 'CopyTrading Bước 1 - Tạo Tài Khoản PuPrime',
      userName: this.botService.getDisplayName(ctx),
      profitTarget: ctx.session.profitTarget,
      templateText: `BƯỚC 1:\n\n${ACCOUNT_CREATION_TEXT}`,
    });
    await this.botService.sendWithKeyboard(ctx, text, ctStep1Keyboard());
  }

  @Action(CALLBACKS.alreadyHavePuPrime)
  async onAlreadyHavePuPrime(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:ib_transfer';
    ctx.session.awaitingEmail = true;

    try {
      await this.botService.sendMediaGroup(ctx, ctIbMobileMedia());
    } catch {
      await ctx.reply('⚡️ HƯỚNG DẪN CHUYỂN MÃ HỖ TRỢ TRÊN ĐIỆN THOẠI\n(Vui lòng xem hình hướng dẫn)');
    }

    try {
      await this.botService.sendMediaGroup(ctx, ctIbWebMedia());
    } catch {
      await ctx.reply('⚡️ HƯỚNG DẪN CHUYỂN MÃ HỖ TRỢ TRÊN WEB\n(Vui lòng xem hình hướng dẫn)');
    }

    const text = await this.geminiService.generateResponse({
      currentStep: 'CopyTrading - Chuyển IB, yêu cầu email',
      userName: this.botService.getDisplayName(ctx),
      profitTarget: ctx.session.profitTarget,
      templateText: `Mã IB của tôi: ${IB_CODE}\n\nSau khi chuyển mã xong, gửi cho tôi email bạn dùng để tạo tài khoản để tôi xử lý giúp bạn nhé, cảm ơn`,
    });
    await this.botService.sendWithKeyboard(ctx, text, ctIbKeyboard());
  }

  @Action(CALLBACKS.ctNextStep2)
  async onStep2(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:step2';

    try {
      await this.botService.sendMediaGroup(ctx, ctStep2Media());
    } catch {
      await ctx.reply('(Hình hướng dẫn Bước 2)');
    }

    const text = await this.geminiService.generateResponse({
      currentStep: 'CopyTrading Bước 2 - Mở Tài Khoản Copy Trading',
      userName: this.botService.getDisplayName(ctx),
      profitTarget: ctx.session.profitTarget,
      templateText: `BƯỚC 2:\n\n2.1 Tải ứng dụng PU PRIME\n\n2.2 Mở ứng dụng PU Prime và đăng nhập vào tài khoản. Sau đó chọn "Account ID" để xem các tài khoản hiện có.\n\n2.3 Chọn "New Live Account" → Platform: "Copy Trading", Account Type: "Standard", Currency: "USD" → Chấp nhận điều khoản → Gửi.\n\n2.4 Sau khi gửi, chọn "Agree" và liên hệ Hỗ trợ để đẩy nhanh quá trình duyệt. Bạn sẽ nhận email xác nhận trong vòng một ngày làm việc.\n\nBạn đã sẵn sàng cho bước tiếp theo chưa?`,
    });
    await this.botService.sendWithKeyboard(ctx, text, ctStep2Keyboard());
  }

  @Action(CALLBACKS.ctNextStep3)
  async onStep3(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:step3';

    try {
      await this.botService.sendMediaGroup(ctx, ctStep3Media());
    } catch {
      await ctx.reply('(Hình hướng dẫn Bước 3)');
    }

    const text = await this.geminiService.generateResponse({
      currentStep: 'CopyTrading Bước 3 - Chuyển Tiền',
      userName: this.botService.getDisplayName(ctx),
      profitTarget: ctx.session.profitTarget,
      templateText: `BƯỚC 3:\n\nChuyển Tiền Vào Tài Khoản Copy Trading\n\nSau khi tài khoản Copy Trading được duyệt, vào tài khoản Live có số dư và chuyển tiền sang tài khoản Copy Trading mới để bắt đầu copy trading.\n\n${DEPOSIT_VIDEO_GUIDE_TEXT}\n\nBạn đã sẵn sàng cho bước tiếp theo chưa?`,
    });
    await this.botService.sendWithKeyboard(ctx, text, ctStep3Keyboard());
  }

  @Action(CALLBACKS.ctNextStep4)
  async onStep4(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:step4';

    try {
      await this.botService.sendMediaGroup(ctx, ctStep4Media());
    } catch {
      await ctx.reply('(Hình hướng dẫn Bước 4)');
    }

    const text = await this.geminiService.generateResponse({
      currentStep: 'CopyTrading Bước 4 - Tìm Master Trader',
      userName: this.botService.getDisplayName(ctx),
      profitTarget: ctx.session.profitTarget,
      templateText: `Bạn sẽ thấy Master "Red Bull X" & master "BMR Scalper xxx" trong Top Lợi nhuận năm cao nhất. Chọn "View" để xem chi tiết và bắt đầu copy.\n\nXem chi tiết: Lợi nhuận YTD (213753%), Người copy (1859), Chia sẻ lợi nhuận (30%).\n\nBạn đã sẵn sàng cho bước tiếp theo chưa?`,
    });
    await this.botService.sendWithKeyboard(ctx, text, ctStep4Keyboard());
  }

  @Action(CALLBACKS.ctFinalStep)
  async onFinalStep(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'copytrading:final';

    try {
      await this.botService.sendMediaGroup(ctx, ctFinalMedia());
    } catch {
      await ctx.reply('(Hình hướng dẫn Bước Cuối)');
    }

    const text = await this.geminiService.generateResponse({
      currentStep: 'CopyTrading Bước Cuối - Cấu Hình Copy',
      userName: this.botService.getDisplayName(ctx),
      profitTarget: ctx.session.profitTarget,
      templateText: `BƯỚC CUỐI:\n\nCấu Hình và Bắt Đầu Copy\n\nChọn Copy Mode là "Equivalent Used Margin", nhập số tiền đầu tư, đặt Quản Lý Rủi Ro ở mức 95% theo khuyến nghị của master, tắt Lot Rounding, và nhấn Submit để bắt đầu copy trading.\n\n🎉 Chúc mừng! Bạn đã hoàn tất thiết lập. Nếu cần hỗ trợ, đừng ngại liên hệ admin của chúng tôi.`,
    });
    await ctx.reply(text, { link_preview_options: { is_disabled: true } });
  }

  @Action(CALLBACKS.contactAdmin)
  async onContactAdmin(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);

    const text = await this.geminiService.generateResponse({
      currentStep: 'Liên hệ admin từ flow CopyTrading',
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
          'CopyTrading IB Transfer',
        );

        const text = await this.geminiService.generateResponse({
          currentStep: 'Đã nhận email trong flow CopyTrading IB',
          userName: this.botService.getDisplayName(ctx),
          templateText: `✅ Cảm ơn bạn đã gửi email: ${email}\n\nChúng tôi sẽ xử lý chuyển IB cho bạn sớm. Admin sẽ liên hệ nếu cần.`,
        });
        await ctx.reply(text);
        return;
      }
    }

    // User gõ text tự do ở bước button → forward cho admin
    const displayName = this.botService.getDisplayName(ctx);
    await this.adminService.forwardUserMessage(ctx.from!.id, displayName, message);
    await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
  }
}
