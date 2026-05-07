import { Module } from '@nestjs/common';
import { OnboardingScene } from './onboarding/onboarding.scene';
import { SetupScene } from './setup/setup.scene';
import { AdminModule } from '../admin/admin.module';
import { BotService } from '../bot/bot.service';

@Module({
  imports: [AdminModule],
  providers: [OnboardingScene, SetupScene, BotService],
})
export class ScenesModule {}
