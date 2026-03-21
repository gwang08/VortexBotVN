import { Logger } from '@nestjs/common';
import { Scene, SceneEnter, On, Action, Command } from 'nestjs-telegraf';
import type { BotContext } from '../../common/interfaces/session.interface';
import { CALLBACKS } from '../../common/constants';
import {
  capitalSelectionKeyboard,
  mainMenuRetailKeyboard,
  mainMenuSemiKeyboard,
  mainMenuVipKeyboard,
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

  @SceneEnter()
  async onEnter(ctx: BotContext) {
    ctx.session.currentStep = 'onboarding:capital_selection';
    const displayName = this.botService.getDisplayName(ctx);
    const text = `Chào mừng ${displayName} đến với BMR Scalper Gold AI!\n\nBạn dự định bắt đầu với bao nhiêu vốn?`;
    await ctx.reply(text, capitalSelectionKeyboard());
  }

  // Capital selection handlers
  @Action(CALLBACKS.capital100_500)
  async onCapital100(ctx: BotContext) { await this.handleCapitalSelection(ctx, '100-500', 'retail'); }

  @Action(CALLBACKS.capital500_2000)
  async onCapital500(ctx: BotContext) { await this.handleCapitalSelection(ctx, '500-2000', 'retail'); }

  @Action(CALLBACKS.capital2000_5000)
  async onCapital2000(ctx: BotContext) { await this.handleCapitalSelection(ctx, '2000-5000', 'semi'); }

  @Action(CALLBACKS.capital5000_10000)
  async onCapital5000(ctx: BotContext) { await this.handleCapitalSelection(ctx, '5000-10000', 'vip'); }

  @Action(CALLBACKS.capital10000plus)
  async onCapital10000(ctx: BotContext) { await this.handleCapitalSelection(ctx, '10000+', 'vip'); }

  private async handleCapitalSelection(ctx: BotContext, capitalRange: string, tier: string) {
    await ctx.answerCbQuery();

    const isVip = tier === 'vip';
    const userId = BigInt(ctx.from!.id);

    await this.prisma.user.update({
      where: { id: userId },
      data: { capitalRange, tier, isVip, status: 'new' },
    }).catch((e) => this.logger.warn(`User update failed: ${e.message}`));

    ctx.session.capitalRange = capitalRange;
    ctx.session.tier = tier;
    ctx.session.isVip = isVip;
    ctx.session.currentStep = 'onboarding:main_menu';

    await this.sendTierMessage(ctx, tier);
  }

  private async sendTierMessage(ctx: BotContext, tier: string) {
    if (tier === 'retail') {
      const text = `Tuyệt vời!\n\n3 bước đơn giản để bắt đầu:\n1. Tạo tài khoản\n2. Nạp tiền\n3. Bật copy trading\n\nKhông cần biết trade. Bắt đầu từ $100.\n\nBạn muốn sử dụng dịch vụ nào?`;
      await ctx.reply(text, mainMenuRetailKeyboard());
    } else if (tier === 'semi') {
      const text = `Bạn đủ điều kiện được hỗ trợ ưu tiên.\n\n✔ Hướng dẫn cấu hình tài khoản\n✔ Tối ưu rủi ro cho vốn của bạn\n✔ Hỗ trợ trực tiếp\n\nBắt đầu ngay nào.`;
      await ctx.reply(text, mainMenuSemiKeyboard());
    } else {
      const text = `🔥 VIP Access Unlocked\n\nBạn sẽ nhận được:\n✔ Cài đặt rủi ro cá nhân hóa\n✔ Chiến lược bảo vệ vốn\n✔ Hỗ trợ 1-1 ưu tiên\n\n👉 Liên hệ ngay: @Vitaperry`;
      await ctx.reply(text, mainMenuVipKeyboard());
    }
  }

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
    await ctx.reply('Cảm ơn bạn! Admin đã được thông báo. Chúng tôi sẽ liên hệ lại với bạn tại đây.');
  }

  @Action(CALLBACKS.vipSupport)
  async onVipSupport(ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.adminService.notifyAdmin(ctx.from!.id, ctx.from?.username, ctx.from?.first_name);
    await ctx.reply(
      '💎 Hỗ Trợ VIP\n\nBạn đã được phân bổ quản lý tài khoản riêng.\n\n👤 Liên hệ: @Vitaperry để được tư vấn 1-1!',
    );
  }

  @Action(CALLBACKS.aiSupport)
  async onAiSupport(ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.session.inAiChat = true;
    await ctx.reply(
      '💬 Hỗ Trợ AI\n\nXin chào! Tôi là trợ lý AI của BMR Trading. Hỏi tôi bất cứ điều gì về:\n\n• CopyTrading & Tín Hiệu\n• Tạo tài khoản PU Prime\n• Nạp & rút tiền\n• Kiến thức trading cơ bản\n\nGõ /human bất cứ lúc nào để nói chuyện với nhân viên.',
    );
  }

  @On('text')
  async onText(ctx: BotContext) {
    const message = (ctx.message as any)?.text;
    if (!message || !ctx.from) return;

    // User đang trong AI chat mode
    if (ctx.session.inAiChat) {
      if (message === '/human') {
        ctx.session.inAiChat = false;
        await this.adminService.notifyAdmin(ctx.from.id, ctx.from?.username, ctx.from?.first_name);
        await ctx.reply('✅ Bạn đã được kết nối với nhân viên hỗ trợ. Chúng tôi sẽ phản hồi sớm!');
        return;
      }
      const response = await this.geminiService.chatSupport(message, this.botService.getDisplayName(ctx));
      await ctx.reply(response);
      return;
    }

    // User gõ text tự do ở bước button -> forward cho admin
    const displayName = this.botService.getDisplayName(ctx);
    await this.adminService.forwardUserMessage(ctx.from.id, displayName, message);
    await ctx.reply('✅ Tin nhắn đã gửi tới admin. Vui lòng chờ phản hồi!');
  }
}
