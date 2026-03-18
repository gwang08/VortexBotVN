import { Update, Start, On, Ctx, Command } from 'nestjs-telegraf';
import type { BotContext } from '../common/interfaces/session.interface';
import { GeminiService } from '../gemini/gemini.service';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(
    private geminiService: GeminiService,
    private botService: BotService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: BotContext) {
    try {
      await ctx.scene.leave();
    } catch {}

    ctx.session.profitTarget = undefined;
    ctx.session.selectedFlow = undefined;
    ctx.session.email = undefined;
    ctx.session.awaitingEmail = false;
    ctx.session.awaitingProfitTarget = false;
    ctx.session.currentStep = undefined;

    await ctx.scene.enter('onboarding');
  }

  @On('text')
  async onText(@Ctx() ctx: BotContext) {
    const message = (ctx.message as any)?.text;
    if (!message) return;

    const response = await this.geminiService.handleFreeText({
      userMessage: message,
      currentStep: 'Không có flow nào đang hoạt động - người dùng nên /start',
      userName: this.botService.getDisplayName(ctx),
      availableActions: ['Gõ /start để bắt đầu'],
    });
    await ctx.reply(response);
  }
}
