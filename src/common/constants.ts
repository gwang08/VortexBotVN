import * as path from 'path';

// Broker signup links — VN PU Prime giữ path /vn/, Ultima/Vantage giống EN
export const PUPRIME_SIGNUP_LINK = 'https://puvip.co/la-partners/vn/boomerang';
export const ULTIMA_SIGNUP_LINK = 'https://ultgo.com/la-asia/bmrtrading';
export const VANTAGE_SIGNUP_LINK = 'https://vigco.co/la-com-inv/bmrtrading';

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
};

// External links — VN giữ domain bmrcopytrade.vn
export const BOT_TRADING_URL = 'https://bmrcopytrade.vn/';
export const MYFXBOOK_URL = 'https://www.myfxbook.com/members/bmrmaster/bmr-scalper-gold/11980201';
export const CHANNEL_URL = 'https://t.me/BMRGoldScalper';

// Follow-up schedule: 10 messages over 30 days (hours between each) — giống EN
export const FOLLOWUP_SCHEDULE_HOURS = [0.17, 1, 24, 48, 72, 120, 168, 240, 360, 480];
export const MAX_FOLLOWUP_COUNT = 10;
export const VIP_MAX_FOLLOWUP_COUNT = 5;

// Video guide URLs
export const VIDEO_GUIDES = {
  openAccount: 'https://youtu.be/VUeNnUB3H-o',
  idAuth: 'https://youtu.be/z5njeC7gMBQ',
  addressVerify: 'https://youtu.be/DnSmbl0qIAw',
  usePromotions: 'https://youtu.be/eI37GTcC7Lo',
  depositCrypto: 'https://youtu.be/mx9SljaMA5Q',
  depositCreditCard: 'https://youtu.be/lk8NUU2YiwU',
  depositEWallet: 'https://youtu.be/riuYXG0eZCs',
  depositLocalBank: 'https://youtu.be/p2hD1mI0rMo',
  depositIntlBank: 'https://youtu.be/W86fkYNEsrQ',
  withdrawCrypto: 'https://youtu.be/6TSqmaw_13o',
  withdrawCreditCard: 'https://youtu.be/LX4WmhdfToo',
  withdrawEWallet: 'https://youtu.be/WjUpZ30puz8',
  withdrawLocalBank: 'https://youtu.be/ScWcdubn7ZE',
  withdrawIntlBank: 'https://youtu.be/FocCgOkemmM',
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
  },
};

// Callback data keys for inline buttons
export const CALLBACKS = {
  // Product selection
  selectGrokAiGold: 'select_grok_ai_gold',
  selectBmrCopyTrading: 'select_bmr_copy_trading',
  selectBmrScalperGold: 'select_bmr_scalper_gold',
  vipPackage: 'vip_package',
  support: 'support_contact',
  contactAdmin: 'contact_admin',

  // Register per broker
  registerPuPrime: 'register_puprime',
  registerUltima: 'register_ultima',
  registerVantage: 'register_vantage',

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
  unlockBmrScalperGold: 'unlock_bmr_scalper_gold',
  unlockVipPackage: 'unlock_vip_package',
};
