import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import { RateLimitService } from '../common/rate-limit.service';
import { BotHealthService } from '../common/bot-health.service';
import { AdminModule } from '../admin/admin.module';
import { GoogleSheetsModule } from '../google-sheets/google-sheets.module';

@Module({
  imports: [AdminModule, GoogleSheetsModule],
  providers: [BotUpdate, BotService, RateLimitService, BotHealthService],
  exports: [BotService],
})
export class BotModule {}
