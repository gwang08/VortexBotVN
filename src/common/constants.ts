import * as path from 'path';

// Broker signup links — VN PU Prime giữ path /vn/, Ultima/Vantage giống EN
export const PUPRIME_SIGNUP_LINK = 'https://puvip.co/la-partners/vn/boomerang';
export const ULTIMA_SIGNUP_LINK = 'https://ultgo.com/la-asia/bmrtrading';
export const VANTAGE_SIGNUP_LINK = 'https://vigco.co/la-com-inv/bmrtrading';
export const STARTRADER_SIGNUP_LINK = 'https://www.startrader.com/live-account/?affid=Mjc4MjE1ODU';

// IB Code for existing PuPrime users
export const IB_CODE = 'boomerang';

// Broker-specific IB info
export const BROKER_IB = {
  puprime: { name: 'PU Prime', ibNumber: '7389028' },
  ultima: { name: 'Ultima', ibNumber: '22593622', email: 'vietnam.cs@ultimamarkets.com' },
  vantage: { name: 'Vantage', ibNumber: '26465155', email: 'vietnam.support@vantagemarkets.com' },
};

// Broker signup links map (keyed by selectedBroker value)
export const BROKER_SIGNUP_LINKS: Record<string, string> = {
  puprime: PUPRIME_SIGNUP_LINK,
  ultima: ULTIMA_SIGNUP_LINK,
  vantage: VANTAGE_SIGNUP_LINK,
  startrader: STARTRADER_SIGNUP_LINK,
};

// Community channels
export const COMMUNITY_GLOBAL = 'https://t.me/BMRCopyTrade';
export const COMMUNITY_CHANNELS = {
  middleEast: [
    { flag: '🇮🇶', name: 'Iraq', url: 'https://t.me/BMRCopyIraq' },
    { flag: '🇹🇷', name: 'Turkey', url: 'https://t.me/BMRTurkiye' },
    { flag: '🇦🇪', name: 'UAE', url: 'https://t.me/BMRCopyTradingUAE' },
    { flag: '🇸🇦', name: 'Arabia', url: 'https://t.me/BMRCopyArabia' },
    { flag: '🌍', name: 'MENA', url: 'https://t.me/BMRCopyMENA' },
    { flag: '🇪🇬', name: 'Egypt', url: 'https://t.me/BMRCopyTradingEG' },
    { flag: '🇮🇷', name: 'Iran', url: 'https://t.me/BMRCopyTradeIR' },
  ],
  asia: [
    { flag: '🇮🇩', name: 'Indonesia', url: 'https://t.me/BMRCopyTradeID' },
    { flag: '🇻🇳', name: 'Vietnam', url: 'https://t.me/BMRCopytradevn' },
    { flag: '🇹🇭', name: 'Thailand', url: 'https://t.me/BMRCopyTradeTH' },
    { flag: '🇲🇾', name: 'Malaysia', url: 'https://t.me/BMRCopyTradingMY' },
    { flag: '🇵🇭', name: 'Philippines', url: 'https://t.me/BMRCopyTradingPH' },
    { flag: '🇮🇳', name: 'India', url: 'https://t.me/BMRCopyTradingIN' },
    { flag: '🇵🇰', name: 'Pakistan', url: 'https://t.me/BMRPakistan' },
    { flag: '🇧🇩', name: 'Bangladesh', url: 'https://t.me/BMRCopyTradeBD' },
    { flag: '🇺🇿', name: 'Uzbekistan', url: 'https://t.me/BMRCopyUZ' },
    { flag: '🇯🇵', name: 'Japan', url: 'https://t.me/BMRCopyJP' },
    { flag: '🇨🇳', name: 'China', url: 'https://t.me/BMRUltimaCN' },
  ],
  africa: [
    { flag: '🇳🇬', name: 'Nigeria', url: 'https://t.me/BMRCopyTradingNG' },
    { flag: '🇪🇬', name: 'Egypt', url: 'https://t.me/BMRCopyTradingEG' },
  ],
  latam: [
    { flag: '🇧🇷', name: 'Brazil', url: 'https://t.me/BMRCopyBrasil' },
    { flag: '🌎', name: 'LATAM', url: 'https://t.me/BMRCopyTradingLATAM' },
    { flag: '🇪🇸', name: 'Spain', url: 'https://t.me/BMRCopyTradingES' },
  ],
  europe: [
    { flag: '🇷🇺', name: 'Russia', url: 'https://t.me/BMRCopyTradingRU' },
    { flag: '🌍', name: 'CIS', url: 'https://t.me/BMRCopyTradingCIS' },
    { flag: '🇺🇿', name: 'Uzbekistan', url: 'https://t.me/BMRCopyUZ' },
    { flag: '🇫🇷', name: 'France', url: 'https://t.me/BMRCopyTradingFR' },
    { flag: '🇮🇹', name: 'Italy', url: 'https://t.me/BMRCopyTradeIT' },
  ],
};

// External links — VN giữ domain bmrcopytrade.vn
export const BOT_TRADING_URL = 'https://bmrcopytrade.vn/';
export const MYFXBOOK_URL = 'https://www.myfxbook.com/members/bmrmaster/bmr-scalper-gold/11980201';
export const CHANNEL_URL = 'https://t.me/BMRGoldScalper';

// Follow-up schedule: 10 messages over 30 days (hours between each) — giống EN
export const FOLLOWUP_SCHEDULE_HOURS = [0.17, 1, 24, 48, 72, 120, 168, 240, 360, 480];
export const MAX_FOLLOWUP_COUNT = 10;
export const VIP_MAX_FOLLOWUP_COUNT = 5;

// Video guide URLs (Telegram channel @bmrvideos)
export const VIDEO_GUIDES = {
  openAccount: 'https://t.me/bmrvideos/6',
  idAuth: 'https://t.me/bmrvideos/10',
  addressVerify: 'https://t.me/bmrvideos/11',
  usePromotions: 'https://t.me/bmrvideos/14',
  depositCrypto: 'https://t.me/bmrvideos/15',
  depositCreditCard: 'https://t.me/bmrvideos/16',
  depositEWallet: 'https://t.me/bmrvideos/17',
  depositLocalBank: 'https://t.me/bmrvideos/18',
  depositIntlBank: 'https://t.me/bmrvideos/19',
  withdrawCrypto: 'https://t.me/bmrvideos/20',
  withdrawCreditCard: 'https://t.me/bmrvideos/21',
  withdrawLocalBank: 'https://t.me/bmrvideos/22',
  withdrawIntlBank: 'https://t.me/bmrvideos/23',
  // Ultima-specific videos
  signUpUltima: 'https://t.me/bmrvideos/27',
  depositUltimaApp: 'https://t.me/bmrvideos/28',
  loginMt5: 'https://t.me/bmrvideos/29',
  loginMt5Laptop: 'https://t.me/bmrvideos/30',
  ultimaPromotion: 'https://t.me/bmrvideos/31',
};

// Image paths
const PUBLIC = path.join(process.cwd(), 'public');

export const IMAGES = {
  grok: {
    product1: path.join(PUBLIC, 'grok/1.jpg'),
    product2: path.join(PUBLIC, 'grok/2.jpg'),
    product3: path.join(PUBLIC, 'grok/3.jpg'),
    vip: path.join(PUBLIC, 'grok/4.jpg'),
    transfer1: path.join(PUBLIC, 'grok/5.jpg'),
    transfer2: path.join(PUBLIC, 'grok/6.jpg'),
    transfer3: path.join(PUBLIC, 'grok/7.jpg'),
    transfer4: path.join(PUBLIC, 'grok/8.jpg'),
    dulcieGold: path.join(PUBLIC, 'grok/9.jpg'),
  },
};

// Callback data keys for inline buttons
export const CALLBACKS = {
  // Product selection
  selectGrokAiGold: 'select_grok_ai_gold',
  selectBmrCopyTrading: 'select_bmr_copy_trading',
  selectBmrCopy: 'select_bmr_copy',
  selectBmrScalperGold: 'select_bmr_scalper_gold',
  vipPackage: 'vip_package',
  support: 'support_contact',
  contactAdmin: 'contact_admin',
  backToMenu: 'back_to_menu',
  communityAccess: 'community_access',
  communityMiddleEast: 'community_middle_east',
  communityAsia: 'community_asia',
  communityAfrica: 'community_africa',
  communityLatam: 'community_latam',
  communityEurope: 'community_europe',

  // Register per broker
  registerPuPrime: 'register_puprime',
  registerUltima: 'register_ultima',
  registerVantage: 'register_vantage',
  registerStarTrader: 'register_startrader',

  // Already have account
  alreadyHaveAccount: 'already_have_account',

  // Transfer IB - choose broker
  brokerPuPrime: 'broker_puprime',
  brokerUltima: 'broker_ultima',
  brokerVantage: 'broker_vantage',

  // Status confirmations
  ctRegistered: 'ct_registered',
  ctDeposited: 'ct_deposited',
  ibSubmitted: 'ib_submitted',
  sentEmail: 'sent_email',
  sendUid: 'send_uid',

  // Navigation
  cantOpenLink: 'cant_open_link',
  reopenLink: 'reopen_link',

  // Unlock system selection
  unlockGrokAiGold: 'unlock_grok_ai_gold',
  unlockBmrCopyTrading: 'unlock_bmr_copy_trading',
  unlockBmrCopy: 'unlock_bmr_copy',
  unlockBmrScalperGold: 'unlock_bmr_scalper_gold',
  unlockVipPackage: 'unlock_vip_package',
};
