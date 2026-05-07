import { Context, Scenes } from 'telegraf';

export interface BotSession extends Scenes.WizardSession {
  selectedProduct?: 'grok' | 'bmr_copy' | 'bmr_scalper';
  selectedBroker?: 'puprime' | 'ultima' | 'vantage';
  isVipFlow?: boolean;
  currentStep?: string;
  awaitingUid?: boolean;
  awaitingLinkSource?: boolean;
  tier?: string;
}

export interface BotContext extends Context {
  session: BotSession;
  scene: Scenes.SceneContextScene<BotContext, Scenes.WizardSessionData>;
  wizard: Scenes.WizardContextWizard<BotContext>;
}
