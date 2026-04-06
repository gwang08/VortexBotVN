import { Logger } from '@nestjs/common';
import { Scene, SceneEnter, On, Action, Command } from 'nestjs-telegraf';
import type { BotContext } from '../../common/interfaces/session.interface';
import { CALLBACKS, CHANNEL_URL } from '../../common/constants';
import {
  welcomeKeyboard,
  vipPackageKeyboard,
  copytradeInfoKeyboard,
  freeSignalsKeyboard,
  whaleAmountKeyboard,
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
    ctx.session.awaitingUid = false;
    ctx.session.currentStep = undefined;
    ctx.session.tier = undefined;
    ctx.session.selectedBroker = undefined;
    await ctx.scene.enter('onboarding');
  }

  // ── SCREEN 1: WELCOME ──
  @SceneEnter()
  async onEnter(ctx: BotContext) {
    ctx.session.currentStep = 'onboarding:welcome';
    const text = `🔥 Chào mừng đến BMR Master Trading

Bạn muốn:

1. VIP Package
2. Copytrade Auto
3. Free Signals
4. Hỗ trợ`;
    await ctx.reply(text, welcomeKeyboard());
  }

  // ── SCREEN 2: VIP PACKAGE ──
  @Action(CALLBACKS.vipPackage)
  async onVipPackage(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'onboarding:vip_package';
    ctx.session.selectedFlow = 'signals';
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { flow: 'signals' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    const text = `🚀 BMR VIP — Full Learning + Signals

Trong VIP:

Forex Course
SMC Course

8–12 scalping/ngày
3–5 swing/ngày

500+ pips/ngày`;
    await ctx.reply(text, vipPackageKeyboard());
  }

  // ── SCREEN 3: COPYTRADE INFO ──
  @Action(CALLBACKS.copytrading)
  async onCopyTrading(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'onboarding:copytrade_info';
    ctx.session.selectedFlow = 'copytrading';
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { flow: 'copytrading' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    const text = `🤖 Copytrade tự động

Không cần trade
Không cần kinh nghiệm

5–10% target/ngày`;
    await ctx.reply(text, copytradeInfoKeyboard());
  }

  // ── SCREEN 4: FREE SIGNALS ──
  @Action(CALLBACKS.freeSignals)
  async onFreeSignals(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'onboarding:free_signals';

    const text = `📊 Free Signals

Gold
Forex
Cập nhật thị trường`;
    await ctx.reply(text, freeSignalsKeyboard());
  }

  // ── START SETUP (-> broker question in copytrading scene) ──
  @Action(CALLBACKS.startSetup)
  async onStartSetup(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'copytrading';
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { flow: 'copytrading', lastStep: 'start_setup' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await ctx.scene.enter('copytrading');
  }

  // ── REGISTER NEW (-> copytrading scene) ──
  @Action(CALLBACKS.registerNew)
  async onRegisterNew(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'copytrading';
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { flow: 'copytrading', lastStep: 'register_clicked' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));
    await ctx.scene.enter('copytrading');
  }

  // ── JOIN VIP ──
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

  // ── SUPPORT / WHALE FLOW ──
  @Action(CALLBACKS.support)
  async onSupport(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'onboarding:whale_question';
    await ctx.reply('Bạn đầu tư bao nhiêu?', whaleAmountKeyboard());
  }

  @Action(CALLBACKS.whaleAmount500)
  async onWhale500(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.handleWhaleAmount(ctx, '$500', false);
  }

  @Action(CALLBACKS.whaleAmount1000)
  async onWhale1000(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.handleWhaleAmount(ctx, '$1000', false);
  }

  @Action(CALLBACKS.whaleAmount5000)
  async onWhale5000(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.handleWhaleAmount(ctx, '$5000+', true);
  }

  @Action(CALLBACKS.whaleAmount10000)
  async onWhale10000(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.handleWhaleAmount(ctx, '$10000+', true);
  }

  private async handleWhaleAmount(ctx: BotContext, amount: string, isWhale: boolean) {
    await this.prisma.user.update({
      where: { id: BigInt(ctx.from!.id) },
      data: { capitalRange: amount, isVip: isWhale, tier: isWhale ? 'vip' : 'retail' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);

    if (isWhale) {
      const text = `VIP Private

Rủi ro thấp hơn
Ưu tiên
Hỗ trợ riêng

👤 Liên hệ: @KenMasterTrade`;
      await ctx.reply(text);
    } else {
      await ctx.reply('Cảm ơn! Admin đã được thông báo. Em sẽ liên hệ lại sớm.\n\n👤 Liên hệ: @KenMasterTrade');
    }
  }

  // ── CONTACT ADMIN ──
  @Action(CALLBACKS.contactAdmin)
  async onContactAdmin(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply('Cảm ơn! Admin đã được thông báo. Em sẽ liên hệ lại sớm.');
  }

  // ── LEGACY: VIP SUPPORT ──
  @Action(CALLBACKS.vipSupport)
  async onVipSupport(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply('💎 Hỗ Trợ VIP\n\n👤 Liên hệ: @KenMasterTrade để được tư vấn 1-1!');
  }

  // ── LEGACY: chatAdmin ──
  @Action(CALLBACKS.chatAdmin)
  async onChatAdmin(ctx: BotContext) {
    await ctx.answerCbQuery();
    const name = this.botService.getDisplayName(ctx);
    await ctx.reply(`Trao đổi trực tiếp để setup phù hợp với vốn ${name}\n\n👤 Liên hệ: @KenMasterTrade`);
  }

  // ── PERFORMANCE ──
  @Action(CALLBACKS.viewPerformance)
  async onViewPerformance(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply(`📊 Xem kết quả thực tế:\n\n${CHANNEL_URL}`);
  }

  // ── LEGACY: upgradeVip ──
  @Action(CALLBACKS.upgradeVip)
  async onUpgradeVip(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'copytrading';
    await ctx.scene.enter('copytrading');
  }

  // ── LEGACY: registerAccount ──
  @Action(CALLBACKS.registerAccount)
  async onRegisterAccount(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'copytrading';
    await ctx.scene.enter('copytrading');
  }

  // ── LEGACY: viewGuide ──
  @Action(CALLBACKS.viewGuide)
  async onViewGuide(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedFlow = 'copytrading';
    await ctx.scene.enter('copytrading');
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

    if (this.adminService.isAdmin(ctx.chat!.id)) return;

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
        await ctx.reply(`Em thấy nhu cầu của ${name} phù hợp tư vấn riêng hơn.\n\n👤 Liên hệ: @KenMasterTrade`);
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

    await this.adminService.forwardUserMessage(ctx.from.id, ctx.from.username, message);
    await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
  }
}
