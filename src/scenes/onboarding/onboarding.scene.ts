import { Logger } from '@nestjs/common';
import { Scene, SceneEnter, On, Action, Command } from 'nestjs-telegraf';
import type { BotContext } from '../../common/interfaces/session.interface';
import { CALLBACKS, PUPRIME_SIGNUP_LINK, ACCOUNT_CREATION_TEXT } from '../../common/constants';
import {
  hookKeyboard,
  proofKeyboard,
  capitalSelectionKeyboard,
  retailActionKeyboard,
  vipActionKeyboard,
} from '../../common/keyboards';
import { GeminiService } from '../../gemini/gemini.service';
import { AdminService } from '../../admin/admin.service';
import { BotService } from '../../bot/bot.service';
import { PrismaService } from '../../prisma/prisma.service';

@Scene('onboarding')
export class OnboardingScene {
  private readonly logger = new Logger(OnboardingScene.name);

  constructor(
    private geminiService: GeminiService,
    private adminService: AdminService,
    private botService: BotService,
    private prisma: PrismaService,
  ) {}

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

  // ── STEP 1: HOOK ──
  @SceneEnter()
  async onEnter(ctx: BotContext) {
    ctx.session.currentStep = 'onboarding:hook';
    const name = this.botService.getDisplayName(ctx);
    const text = `🚀 Hệ thống Copytrade Gold (XAUUSD)\n\nChào ${name}! Bạn có thể kiếm lợi nhuận từ vàng mà không cần trade (tự động 100%)`;
    await ctx.reply(text, hookKeyboard());
  }

  // ── STEP 2: PROOF ──
  @Action(CALLBACKS.viewResults)
  async onViewResults(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'onboarding:proof';

    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { lastStep: 'viewed_results' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    const text = `📊 ${this.botService.getDisplayName(ctx)} có thể xem kết quả thực tế tại đây:`;
    await ctx.reply(text, proofKeyboard());
  }

  // "Bắt đầu ngay" skips proof, goes straight to capital
  @Action(CALLBACKS.startNow)
  async onStartNow(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.showCapitalSelection(ctx);
  }

  // After proof, continue to capital
  @Action(CALLBACKS.continueToCapital)
  async onContinueToCapital(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.showCapitalSelection(ctx);
  }

  // ── STEP 3: HỎI VỐN ──
  private async showCapitalSelection(ctx: BotContext) {
    ctx.session.currentStep = 'onboarding:capital_selection';
    const name = this.botService.getDisplayName(ctx);
    const text = `💰 Để em gợi ý setup phù hợp, ${name} dự kiến bắt đầu khoảng bao nhiêu?`;
    await ctx.reply(text, capitalSelectionKeyboard());
  }

  // Capital handlers with new tier mapping
  @Action(CALLBACKS.capitalUnder100)
  async onCapitalUnder100(ctx: BotContext) {
    await this.handleCapitalSelection(ctx, 'under-100', 'retail_low');
  }

  @Action(CALLBACKS.capital100_500)
  async onCapital100(ctx: BotContext) {
    await this.handleCapitalSelection(ctx, '100-500', 'retail_low');
  }

  @Action(CALLBACKS.capital500_2000)
  async onCapital500(ctx: BotContext) {
    await this.handleCapitalSelection(ctx, '500-2000', 'retail_high');
  }

  @Action(CALLBACKS.capital2000_10000)
  async onCapital2000(ctx: BotContext) {
    await this.handleCapitalSelection(ctx, '2000-10000', 'vip');
  }

  @Action(CALLBACKS.capital10000plus)
  async onCapital10000(ctx: BotContext) {
    await this.handleCapitalSelection(ctx, '10000+', 'whale');
  }

  private async handleCapitalSelection(ctx: BotContext, capitalRange: string, tier: string) {
    await ctx.answerCbQuery();

    const isVip = tier === 'vip' || tier === 'whale';
    const userId = BigInt(ctx.from!.id);

    await this.prisma.user.update({
      where: { id: userId },
      data: { capitalRange, tier, isVip, status: 'capital_selected', lastStep: 'capital_selected' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    ctx.session.capitalRange = capitalRange;
    ctx.session.tier = tier;
    ctx.session.isVip = isVip;

    // ── STEP 4: SPLIT LOGIC ──
    if (isVip) {
      await this.showVipSplit(ctx, tier);
    } else {
      await this.showRetailSplit(ctx, tier, capitalRange);
    }
  }

  // ── RETAIL (<2k$): Bot auto flow, message per tier ──
  private async showRetailSplit(ctx: BotContext, _tier: string, capitalRange: string) {
    ctx.session.currentStep = 'onboarding:retail_action';
    const name = this.botService.getDisplayName(ctx);

    let text: string;
    if (capitalRange === 'under-100') {
      text = `👍 ${name} có thể bắt đầu với mức nhỏ để trải nghiệm trước\n\nChỉ cần $100 là đủ để test hệ thống`;
    } else if (capitalRange === '100-500') {
      text = `👍 Mức này rất phù hợp để bắt đầu ${name}\n\nNhiều người đang bắt đầu với $100–$300\n\nSetup chỉ mất 2 phút`;
    } else {
      // 500-2000 (retail_high)
      text = `👍 Mức vốn tốt ${name}!\n\nEm khuyên dùng setup cân bằng rủi ro cho mức này\n\nEm sẽ hướng dẫn từng bước`;
    }

    await ctx.reply(text, retailActionKeyboard());
  }

  // ── VIP (>=2k$): Chat admin, don't go deeper ──
  private async showVipSplit(ctx: BotContext, tier: string) {
    ctx.session.currentStep = 'onboarding:vip_action';

    const name = this.botService.getDisplayName(ctx);
    const isWhale = tier === 'whale';
    const text = isWhale
      ? `👑 Với tài khoản từ mức này, bên em ưu tiên setup riêng cho ${name} để tối ưu quản lý vốn và support sát hơn`
      : `💎 Với tài khoản lớn, bên em sẽ setup riêng cho ${name}\nđể tối ưu lợi nhuận và kiểm soát rủi ro`;

    await ctx.reply(text, vipActionKeyboard());

    // Notify admin immediately for VIP/whale
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
  }

  // ── ACTION BUTTONS ──

  // Retail: "Đăng ký tài khoản" → enters CopyTrading scene
  @Action(CALLBACKS.registerAccount)
  async onRegisterAccount(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'copytrading';
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { flow: 'copytrading', lastStep: 'register_clicked' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await ctx.scene.enter('copytrading');
  }

  // Retail: "Xem hướng dẫn" → show account creation guide then enter copytrading
  @Action(CALLBACKS.viewGuide)
  async onViewGuide(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'copytrading';
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { flow: 'copytrading', lastStep: 'guide_clicked' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await ctx.scene.enter('copytrading');
  }

  // VIP/Whale: "Trao đổi riêng với admin" → end of bot flow
  @Action(CALLBACKS.chatAdmin)
  async onChatAdmin(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { status: 'vip_contacted', lastStep: 'chat_admin_clicked' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    const name = this.botService.getDisplayName(ctx);
    await ctx.reply(`Trao đổi trực tiếp để setup phù hợp với vốn ${name}\n\n👤 Liên hệ: @Vitaperry\n\nAdmin sẽ liên hệ ${name} sớm nhất!`);
  }

  // Keep old callbacks for backward compatibility
  @Action(CALLBACKS.copytrading)
  async onCopyTrading(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'copytrading';
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { flow: 'copytrading' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await ctx.scene.enter('copytrading');
  }

  @Action(CALLBACKS.signals)
  async onSignals(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'signals';
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { flow: 'signals' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await ctx.scene.enter('signals');
  }

  @Action(CALLBACKS.contactAdmin)
  async onContactAdmin(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply('Cảm ơn anh! Admin đã được thông báo. Em sẽ liên hệ lại với anh tại đây.');
  }

  @Action(CALLBACKS.vipSupport)
  async onVipSupport(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply('💎 Hỗ Trợ VIP\n\n👤 Liên hệ: @Vitaperry để được tư vấn 1-1!');
  }

  @Action(CALLBACKS.aiSupport)
  async onAiSupport(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.inAiChat = true;
    ctx.session.aiQuestionCount = 0;
    const name = this.botService.getDisplayName(ctx);
    await ctx.reply(
      `💬 Hỗ Trợ AI\n\nChào ${name}! Em là trợ lý AI của BMR Trading.\n\nHỏi em về:\n• Copytrade & cách hoạt động\n• Vốn & rủi ro\n• Quy trình đăng ký & nạp tiền\n\nGõ /human để nói chuyện với nhân viên.`,
    );
  }

  @On('text')
  async onText(ctx: BotContext) {
    const message = (ctx.message as any)?.text;
    if (!message || !ctx.from) return;

    if (ctx.session.inAiChat) {
      if (message === '/human') {
        ctx.session.inAiChat = false;
        ctx.session.aiQuestionCount = 0;
        await this.adminService.notifyAdmin(ctx.from.id, ctx.from?.username, ctx.from?.first_name);
        await ctx.reply('✅ Đã kết nối với nhân viên hỗ trợ. Em sẽ phản hồi sớm!');
        return;
      }

      // Count AI questions + detect VIP signals
      ctx.session.aiQuestionCount = (ctx.session.aiQuestionCount || 0) + 1;
      const shouldTransfer = this.geminiService.detectAdminTransfer(message) || ctx.session.aiQuestionCount >= 3;

      // Auto-transfer to admin for VIP/whale or after 3+ questions
      if (shouldTransfer && (ctx.session.isVip || ctx.session.aiQuestionCount >= 5)) {
        ctx.session.inAiChat = false;
        ctx.session.aiQuestionCount = 0;
        await this.adminService.notifyAdmin(ctx.from.id, ctx.from?.username, ctx.from?.first_name);
        const name = this.botService.getDisplayName(ctx);
        await ctx.reply(`Em thấy nhu cầu của ${name} phù hợp tư vấn riêng hơn bot tự động.\nEm kết nối admin để hỗ trợ sát hơn nhé.\n\n👤 Liên hệ: @Vitaperry`);
        return;
      }

      const response = await this.geminiService.chatSupport(message, this.botService.getDisplayName(ctx), ctx.session.tier);
      await ctx.reply(response);
      return;
    }

    const displayName = this.botService.getDisplayName(ctx);
    await this.adminService.forwardUserMessage(ctx.from.id, displayName, message);
    await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
  }
}
