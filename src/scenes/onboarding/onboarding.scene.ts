import { Logger } from '@nestjs/common';
import { Scene, SceneEnter, On, Action, Command } from 'nestjs-telegraf';
import type { BotContext } from '../../common/interfaces/session.interface';
import { CALLBACKS, MYFXBOOK_URL } from '../../common/constants';
import {
  welcomeKeyboard,
  copytradeInfoKeyboard,
  vipSignalsKeyboard,
  freeSignalsKeyboard,
  freeSignalsUpsellKeyboard,
  capitalSelectionKeyboard,
  aiChatRetailKeyboard,
  aiChatVipKeyboard,
  aiChatWhaleKeyboard,
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

  // ── SCREEN 1: WELCOME ──
  @SceneEnter()
  async onEnter(ctx: BotContext) {
    ctx.session.currentStep = 'onboarding:welcome';
    const text =
      `🔥 Chào mừng đến BMR Copytrade System\n\n` +
      `Bạn không cần biết trade vẫn có thể kiếm tiền.\n\n` +
      `Bạn muốn:\n\n` +
      `1. Copytrade tự động\n` +
      `2. VIP Signals\n` +
      `3. Free Signals (miễn phí)`;
    await ctx.reply(text, welcomeKeyboard());
  }

  // ── SCREEN 2A: COPYTRADE INFO (Copytrade Auto button) ──
  @Action(CALLBACKS.copytrading)
  async onCopyTrading(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'copytrading';
    ctx.session.currentStep = 'onboarding:copytrade_info';

    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { flow: 'copytrading', lastStep: 'copytrade_info_viewed' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    const text =
      `🔥 BMR Copytrade\n\n` +
      `✅ Không cần biết trade\n` +
      `✅ Tự động vào lệnh\n` +
      `✅ Copy tài khoản master\n\n` +
      `Lợi nhuận trung bình:\n\n` +
      `5–10% mỗi ngày\n\n` +
      `Bắt đầu:\n\n` +
      `1. Đăng ký Broker\n` +
      `2. Nạp tiền\n` +
      `3. Kết nối copy`;
    await ctx.reply(text, copytradeInfoKeyboard());
  }

  // ── SCREEN 2B: VIP SIGNALS INFO (VIP Signals button) ──
  @Action(CALLBACKS.signals)
  async onSignals(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'signals';
    ctx.session.currentStep = 'onboarding:signals_info';

    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { flow: 'signals', lastStep: 'signals_info_viewed' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    const text =
      `📈 BMR VIP Signals\n\n` +
      `✅ Tín hiệu Gold / Forex\n` +
      `✅ Phân tích chi tiết\n` +
      `✅ Risk Management\n\n` +
      `VIP nhận:\n\n` +
      `3–5 kèo mỗi ngày\n` +
      `Winrate cao`;
    await ctx.reply(text, vipSignalsKeyboard());
  }

  // ── SCREEN 2C: FREE SIGNALS (Soft Funnel) ──
  @Action(CALLBACKS.freeSignals)
  async onFreeSignals(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'onboarding:free_signals';

    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { flow: 'free_signals', lastStep: 'free_signals_viewed' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    const text =
      `📊 Free Signals\n\n` +
      `Bạn sẽ nhận:\n\n` +
      `✅ Gold signals\n` +
      `✅ Forex signals\n` +
      `✅ Phân tích thị trường\n\n` +
      `👇 Join bên dưới`;
    await ctx.reply(text, freeSignalsKeyboard());

    // Upsell after showing free signals
    const upsellText =
      `🔥 Free Signals là bản giới hạn\n\n` +
      `VIP sẽ:\n\n` +
      `✅ Kèo sớm hơn\n` +
      `✅ Risk thấp hơn\n` +
      `✅ Lợi nhuận cao hơn`;
    await ctx.reply(upsellText, freeSignalsUpsellKeyboard());
  }

  // ── UPGRADE VIP → enter copytrading (register → deposit → unlock) ──
  @Action(CALLBACKS.upgradeVip)
  async onUpgradeVip(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'copytrading';
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { flow: 'copytrading', lastStep: 'upgrade_vip_clicked' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await ctx.scene.enter('copytrading');
  }

  // ── PERFORMANCE (view Myfxbook) ──
  @Action(CALLBACKS.viewPerformance)
  async onViewPerformance(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply(`📊 Xem kết quả thực tế:\n\n${MYFXBOOK_URL}`);
  }

  // ── VIP SUPPORT / CONTACT ADMIN ──
  @Action(CALLBACKS.vipSupport)
  async onVipSupport(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply('💎 Hỗ Trợ VIP\n\n👤 Liên hệ: @KenMasterTrade để được tư vấn 1-1!');
  }

  @Action(CALLBACKS.contactAdmin)
  async onContactAdmin(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply('Cảm ơn anh! Admin đã được thông báo. Em sẽ liên hệ lại với anh tại đây.');
  }

  // ── REGISTER ACCOUNT → enter copytrading scene ──
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

  // ── VIEW GUIDE → enter copytrading scene ──
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

  // ── JOIN VIP → enter signals scene ──
  @Action(CALLBACKS.joinVip)
  async onJoinVip(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'signals';
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { flow: 'signals', lastStep: 'join_vip_clicked' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await ctx.scene.enter('signals');
  }

  // ── BACKWARD COMPAT: old chatAdmin callback ──
  @Action(CALLBACKS.chatAdmin)
  async onChatAdmin(ctx: BotContext) {
    await ctx.answerCbQuery();
    const name = this.botService.getDisplayName(ctx);
    await ctx.reply(`Trao đổi trực tiếp để setup phù hợp với vốn ${name}\n\n👤 Liên hệ: @KenMasterTrade\n\nAdmin sẽ liên hệ ${name} sớm nhất!`);
  }

  // ── AI SUPPORT ──
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

  // Return tier-appropriate keyboard for AI chat responses
  private getAiChatKeyboard(tier?: string) {
    switch (tier) {
      case 'retail_low':
      case 'retail_high':
        return aiChatRetailKeyboard();
      case 'vip':
        return aiChatVipKeyboard();
      case 'whale':
        return aiChatWhaleKeyboard();
      default:
        return null;
    }
  }

  @On('text')
  async onText(ctx: BotContext) {
    const message = (ctx.message as any)?.text;
    if (!message || !ctx.from) return;

    // Skip processing for admin — handled by bot.update middleware
    if (this.adminService.isAdmin(ctx.chat!.id)) return;

    // Handle admin commands directly (scene intercepts before middleware)
    if (message.startsWith('/') && message !== '/human') {
      if (this.adminService.isAdmin(ctx.chat!.id)) {
        await this.adminService.handleCommand(ctx, message);
      }
      return;
    }

    if (ctx.session.inAiChat) {
      if (message === '/human') {
        ctx.session.inAiChat = false;
        ctx.session.aiQuestionCount = 0;
        await this.adminService.notifyAdmin(ctx.from.id, ctx.from?.username, ctx.from?.first_name);
        await ctx.reply('✅ Đã kết nối với nhân viên hỗ trợ. Em sẽ phản hồi sớm!');
        return;
      }

      ctx.session.aiQuestionCount = (ctx.session.aiQuestionCount || 0) + 1;
      const shouldTransfer = this.geminiService.detectAdminTransfer(message) || ctx.session.aiQuestionCount >= 3;

      if (shouldTransfer && (ctx.session.isVip || ctx.session.aiQuestionCount >= 5)) {
        ctx.session.inAiChat = false;
        ctx.session.aiQuestionCount = 0;
        await this.adminService.notifyAdmin(ctx.from.id, ctx.from?.username, ctx.from?.first_name);
        const name = this.botService.getDisplayName(ctx);
        await ctx.reply(`Em thấy nhu cầu của ${name} phù hợp tư vấn riêng hơn bot tự động.\nEm kết nối admin để hỗ trợ sát hơn nhé.\n\n👤 Liên hệ: @KenMasterTrade`);
        return;
      }

      const response = await this.geminiService.chatSupport(message, this.botService.getDisplayName(ctx), ctx.session.tier);

      const asksAboutCapital = /mức nào|bao nhiêu|mức vốn|bắt đầu.*mức/i.test(response) || /mức nào|bao nhiêu|vốn|bắt đầu/i.test(message);
      if (asksAboutCapital) {
        await ctx.reply(response);
        await ctx.reply('Chọn mức vốn dự kiến:', capitalSelectionKeyboard());
      } else {
        const keyboard = this.getAiChatKeyboard(ctx.session.tier);
        await ctx.reply(response, keyboard ?? undefined);
      }
      return;
    }

    const displayName = this.botService.getDisplayName(ctx);
    await this.adminService.forwardUserMessage(ctx.from.id, displayName, message);
    await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
  }
}
