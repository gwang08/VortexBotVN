import { Logger } from '@nestjs/common';
import { Scene, SceneEnter, Action, On, Command } from 'nestjs-telegraf';
import type { BotContext } from '../../common/interfaces/session.interface';
import { CALLBACKS, IMAGES } from '../../common/constants';
import {
  welcomeKeyboard,
  grokAiGoldKeyboard,
  bmrCopyTradingKeyboard,
  dulcieGoldKeyboard,
  bmrScalperGoldKeyboard,
  vipPackageKeyboard,
  communityRegionsKeyboard,
  middleEastKeyboard,
  asiaKeyboard,
  africaKeyboard,
  latamKeyboard,
  europeKeyboard,
} from '../../common/keyboards';
import { AdminService } from '../../admin/admin.service';
import { BotService } from '../../bot/bot.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';

@Scene('onboarding')
export class OnboardingScene {
  private readonly logger = new Logger(OnboardingScene.name);

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

  // ── Quay lại Menu (reset session + về welcome) ──
  @Action(CALLBACKS.backToMenu)
  async onBackToMenu(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    this.resetSession(ctx);
    await ctx.scene.enter('onboarding');
  }

  // ── Screen 1: WELCOME ──
  @SceneEnter()
  async onEnter(ctx: BotContext) {
    ctx.session.currentStep = 'onboarding:welcome';
    const welcomeText =
      '🔥 Chào mừng đến BMR Copy Trading\n' +
      'Hạ tầng AI Gold Trading chuyên nghiệp 👇\n' +
      '━━━━━━━━━━━━━━\n' +
      '🇻🇳 VN VIP Support: 👉 @FinBMR';
    await ctx.reply(welcomeText, welcomeKeyboard());
  }

  // ── Screen 2: GROK AI GOLD (PU Prime) ──
  @Action(CALLBACKS.selectGrokAiGold)
  async onGrokAiGold(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedProduct = 'grok';
    ctx.session.selectedBroker = 'puprime';
    ctx.session.currentStep = 'onboarding:grok_ai_gold';

    const text = `🤖 Grok AI Gold

Top 2 Most Copied trên PU Prime

📊 Lợi nhuận YTD: +107,615%
📈 Lợi nhuận 3 tháng: +14,184%
👥 Tổng người copy: 10,622
⚖️ Mức rủi ro: 3

✅ Gold Scalping System
✅ AI Risk Management
✅ Real-Time Copy Trading`;
    await this.sendPhotoWithCaption(ctx, IMAGES.grok.product1, text, grokAiGoldKeyboard());
  }

  // ── Screen 3: BMR COPY TRADING (Ultima) ──
  @Action(CALLBACKS.selectBmrCopyTrading)
  async onBmrCopyTrading(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedProduct = 'bmr_copy';
    ctx.session.selectedBroker = 'ultima';
    ctx.session.currentStep = 'onboarding:bmr_copy_trading';

    const text = `🏆 BMR Copy Trading Strategy
Top 1 Performing Gold System trên Ultima Markets

📊 Lợi nhuận 1 năm: +2,276%
👥 Active Copiers: 2,844+
📈 Community AUM: $460,000+
🎯 Tỷ lệ thắng: 69.28%
💰 Vốn tối thiểu: $200 (Đề xuất: $500+)

✅ Tự động hoàn toàn
✅ Tích hợp trực tiếp Ultima
✅ Tăng trưởng bền vững dài hạn`;
    await this.sendPhotoWithCaption(ctx, IMAGES.grok.product2, text, bmrCopyTradingKeyboard());
  }

  // ── Screen 3b: DULCIE GOLD (STARTRADER) ──
  @Action(CALLBACKS.selectBmrCopy)
  async onDulcieGold(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedProduct = 'bmr_copy_pu';
    ctx.session.selectedBroker = 'startrader';
    ctx.session.currentStep = 'onboarding:dulcie_gold';

    const text = `🔥 Dulcie Gold Strategy
Premium AI-Driven Portfolio trên STARTRADER

📊 Lợi nhuận YTD: +4,495%
🎯 Tỷ lệ thắng: 66.6%
💰 Vốn tối thiểu: $100 (Đề xuất: $500+)

✅ Chuyên Gold (XAU/USD)
✅ AI tự động 100%
✅ Không cần kinh nghiệm trading

👇 Chọn bên dưới để đăng ký hoặc kết nối tài khoản sẵn có.`;
    await this.sendPhotoWithCaption(ctx, IMAGES.grok.dulcieGold, text, dulcieGoldKeyboard());
  }

  // ── Screen 4: BMR SCALPER GOLD (Vantage) ──
  @Action(CALLBACKS.selectBmrScalperGold)
  async onBmrScalperGold(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedProduct = 'bmr_scalper';
    ctx.session.selectedBroker = 'vantage';
    ctx.session.currentStep = 'onboarding:bmr_scalper_gold';

    const text = `🚀 BMR Scalper Gold
Top 3 Copy Trading Performance trên PU Prime & Vantage

📊 Lợi nhuận YTD: +16,753%
👥 Tổng người copy: 3,717
🥇 Winrate: 66.84%

✅ Gold Scalping System
✅ AI Trade Execution
✅ Social Copy Trading`;
    await this.sendPhotoWithCaption(ctx, IMAGES.grok.product3, text, bmrScalperGoldKeyboard());
  }

  // ── Screen 5: VIP PACKAGE ──
  @Action(CALLBACKS.vipPackage)
  async onVipPackage(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.isVipFlow = true;
    ctx.session.currentStep = 'onboarding:vip_package';

    const text = `👑 BMR VIP Package

Mở khóa:
✅ AI Gold Signals
✅ Market Analysis
✅ Trading Education
✅ Community Access
✅ Priority Support

📌 Điều kiện tham gia:
Tài khoản từ $1,000+`;
    await this.sendPhotoWithCaption(ctx, IMAGES.grok.vip, text, vipPackageKeyboard());
  }

  // ── Register buttons → enter setup scene ──
  @Action(CALLBACKS.registerPuPrime)
  async onRegisterPuPrime(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedBroker = 'puprime';
    ctx.session.currentStep = 'setup:register';
    await ctx.scene.enter('setup');
  }

  @Action(CALLBACKS.registerUltima)
  async onRegisterUltima(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedBroker = 'ultima';
    ctx.session.currentStep = 'setup:register';
    await ctx.scene.enter('setup');
  }

  @Action(CALLBACKS.registerVantage)
  async onRegisterVantage(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedBroker = 'vantage';
    ctx.session.currentStep = 'setup:register';
    await ctx.scene.enter('setup');
  }

  @Action(CALLBACKS.registerStarTrader)
  async onRegisterStarTrader(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedBroker = 'startrader';
    ctx.session.currentStep = 'setup:register';
    await ctx.scene.enter('setup');
  }

  // ── Already have account → enter setup scene ──
  @Action(CALLBACKS.alreadyHaveAccount)
  async onAlreadyHaveAccount(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'setup:already_have';
    await ctx.scene.enter('setup');
  }

  // Broker-specific shortcuts: skip the broker picker, go straight to that
  // broker's transfer flow in setup scene.
  @Action(CALLBACKS.alreadyHaveUltima)
  async onAlreadyHaveUltima(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedBroker = 'ultima';
    ctx.session.currentStep = 'setup:already_have';
    await ctx.scene.enter('setup');
  }

  @Action(CALLBACKS.alreadyHaveStartrader)
  async onAlreadyHaveStartrader(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.selectedBroker = 'startrader';
    ctx.session.currentStep = 'setup:already_have';
    await ctx.scene.enter('setup');
  }

  // ── Community Access ──
  @Action(CALLBACKS.communityAccess)
  async onCommunityAccess(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.currentStep = 'onboarding:community';
    await ctx.reply('🌍 Chọn khu vực của bạn:', communityRegionsKeyboard());
  }

  @Action(CALLBACKS.communityMiddleEast)
  async onCommunityMiddleEast(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply('🌍 Middle East & MENA — chọn cộng đồng:', middleEastKeyboard());
  }

  @Action(CALLBACKS.communityAsia)
  async onCommunityAsia(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply('🌏 Asia — chọn cộng đồng:', asiaKeyboard());
  }

  @Action(CALLBACKS.communityAfrica)
  async onCommunityAfrica(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply('🌍 Africa — chọn cộng đồng:', africaKeyboard());
  }

  @Action(CALLBACKS.communityLatam)
  async onCommunityLatam(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply('🌎 LATAM — chọn cộng đồng:', latamKeyboard());
  }

  @Action(CALLBACKS.communityEurope)
  async onCommunityEurope(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply('🇪🇺 Europe & CIS — chọn cộng đồng:', europeKeyboard());
  }

  // ── Support ──
  @Action(CALLBACKS.support)
  async onSupport(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply('Cảm ơn! Admin đã được thông báo. Em sẽ liên hệ lại sớm.\n\n👤 Liên hệ: @FinBMR');
  }

  @Action(CALLBACKS.contactAdmin)
  async onContactAdmin(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply('Cảm ơn! Admin đã được thông báo. Em sẽ liên hệ lại sớm.\n\n👤 Liên hệ: @FinBMR');
  }

  // ── Text handler ──
  @On('text')
  async onText(ctx: BotContext) {
    const message = (ctx.message as any)?.text;
    if (!message || !ctx.from) return;

    // Admin: dispatch slash commands inline. Returning early without next()
    // would also prevent BotUpdate.@Use from running, so /link, /stats, etc.
    // must be handled right here while the admin is inside this scene.
    if (this.adminService.isAdmin(ctx.chat!.id)) {
      if (message.startsWith('/')) {
        await this.adminService.handleCommand(ctx, message);
      }
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
  /** Send photo with caption + inline keyboard in a single message */
  private async sendPhotoWithCaption(ctx: BotContext, imagePath: string, caption: string, keyboard: any) {
    try {
      if (fs.existsSync(imagePath)) {
        await ctx.replyWithPhoto({ source: imagePath }, { caption, ...keyboard });
        return;
      }
    } catch (err: any) {
      this.logger.warn(`Failed to send photo with caption: ${err.message}`);
    }
    // Fallback: text + keyboard only
    await ctx.reply(caption, keyboard);
  }

  private resetSession(ctx: BotContext) {
    ctx.session.selectedProduct = undefined;
    ctx.session.selectedBroker = undefined;
    ctx.session.isVipFlow = undefined;
    ctx.session.currentStep = undefined;
    ctx.session.awaitingUid = undefined;
    ctx.session.tier = undefined;
  }
}
