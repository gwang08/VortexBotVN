import * as path from 'path';

// PuPrime signup link
export const PUPRIME_SIGNUP_LINK =
  'https://puvip.co/la-partners/vn/bmrmaster';

// IB Code for existing PuPrime users
export const IB_CODE = 'bmrmaster';

// Broker-specific IB info
export const BROKER_IB = {
  puprime: { name: 'PU Prime', ibNumber: '83272' },
  ultima: { name: 'Ultima', ibNumber: '22593622', email: 'vietnam.cs@ultimamarkets.com' },
  vantage: { name: 'Vantage', ibNumber: '26465155', email: 'vietnam.support@vantagemarkets.com' },
};

// External links
export const BOT_TRADING_URL = 'https://bmrcopytrade.vn/';
export const MYFXBOOK_URL = 'https://www.myfxbook.com/members/bmrmaster/bmr-scalper-gold/11980201';
export const CHANNEL_URL = 'https://t.me/BMRGoldScalper';

// Follow-up cooldown schedule (hours between each follow-up)
// 10min, 6h, 24h, 72h (3 days), 120h (5 days)
export const FOLLOWUP_SCHEDULE_HOURS = [0.17, 6, 24, 72, 120];
export const MAX_FOLLOWUP_COUNT = 5;
export const VIP_MAX_FOLLOWUP_COUNT = 3;

// VN timezone: send follow-ups only during 11:30-13:30 or 20:00-23:00 ICT
export const VN_FOLLOWUP_WINDOWS = [
  { startHour: 11, startMin: 30, endHour: 13, endMin: 30 },
  { startHour: 20, startMin: 0, endHour: 23, endMin: 0 },
];

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

// Text templates for account creation (shared between CopyTrading & Signals)
export const ACCOUNT_CREATION_TEXT = `Tạo tài khoản PU Prime theo link sau: ${PUPRIME_SIGNUP_LINK}

⚠️ Nếu không truy cập được link, hãy cài app 1.1.1.1 (Cloudflare WARP) rồi bật Connect:
📱 Tải tại: https://1.1.1.1/

Video HƯỚNG DẪN:

📣 Mở Tài Khoản Live PuPrime: ${VIDEO_GUIDES.openAccount}
💋 Xác Minh Danh Tính: ${VIDEO_GUIDES.idAuth}
⭐️ Xác Minh Địa Chỉ: ${VIDEO_GUIDES.addressVerify}
🎲 Sử Dụng Khuyến Mãi: ${VIDEO_GUIDES.usePromotions}

Nếu bạn đã có tài khoản PU Prime, nhấn nút bên dưới`;

// Deposit/withdrawal video guide text (shared)
export const DEPOSIT_VIDEO_GUIDE_TEXT = `Video HƯỚNG DẪN:

🔪 Nạp Tiền Bằng Crypto: ${VIDEO_GUIDES.depositCrypto}
⭐️ Nạp Tiền Bằng Thẻ Tín Dụng: ${VIDEO_GUIDES.depositCreditCard}
💸 Nạp Tiền Bằng Ví Điện Tử: ${VIDEO_GUIDES.depositEWallet}
🍒 Nạp Tiền Qua Ngân Hàng Nội Địa: ${VIDEO_GUIDES.depositLocalBank}
💝 Nạp Tiền Qua Ngân Hàng Quốc Tế: ${VIDEO_GUIDES.depositIntlBank}
🍀 Rút Tiền Bằng Crypto: ${VIDEO_GUIDES.withdrawCrypto}
🔺 Rút Tiền Bằng Thẻ Tín Dụng: ${VIDEO_GUIDES.withdrawCreditCard}
🟫 Rút Tiền Bằng Ví Điện Tử: ${VIDEO_GUIDES.withdrawEWallet}
💠 Rút Tiền Qua Ngân Hàng Nội Địa: ${VIDEO_GUIDES.withdrawLocalBank}
💻 Rút Tiền Qua Ngân Hàng Quốc Tế: ${VIDEO_GUIDES.withdrawIntlBank}`;

// Image paths (relative to project root)
const PUBLIC = path.join(process.cwd(), 'public');

export const IMAGES = {
  copytrading: {
    step1Ib: {
      mobile1: path.join(PUBLIC, 'copytrading/step1-ib/1.jpg'),
      mobile2: path.join(PUBLIC, 'copytrading/step1-ib/2.jpg'),
      mobile3: path.join(PUBLIC, 'copytrading/step1-ib/3.jpg'),
      mobile4: path.join(PUBLIC, 'copytrading/step1-ib/4.jpg'),
      web1: path.join(PUBLIC, 'copytrading/step1-ib/5.jpg'),
    },
    step2: {
      appLive: path.join(PUBLIC, 'copytrading/step2/1.jpg'),
      accountMgmt: path.join(PUBLIC, 'copytrading/step2/2.jpg'),
      accountOpening: path.join(PUBLIC, 'copytrading/step2/3.jpg'),
      congratulations: path.join(PUBLIC, 'copytrading/step2/4.jpg'),
    },
    step3: {
      profileTransfer: path.join(PUBLIC, 'copytrading/step3/1.jpg'),
      transferFunds: path.join(PUBLIC, 'copytrading/step3/2.jpg'),
    },
    step4: {
      copyTradingHome: path.join(PUBLIC, 'copytrading/step4/1.jpg'),
      redBullDetail: path.join(PUBLIC, 'copytrading/step4/2.jpg'),
    },
    step5: {
      copySettings1: path.join(PUBLIC, 'copytrading/step5/1.jpg'),
      copySettings2: path.join(PUBLIC, 'copytrading/step5/2.jpg'),
    },
  },
};

// Callback data keys for inline buttons
export const CALLBACKS = {
  // Hook step
  viewResults: 'view_results',
  startNow: 'start_now',

  // Proof step
  continueToCapital: 'continue_to_capital',

  // Capital selection buttons (new ranges)
  capitalUnder100: 'capital_under_100',
  capital100_500: 'capital_100_500',
  capital500_2000: 'capital_500_2000',
  capital2000_10000: 'capital_2000_10000',
  capital10000plus: 'capital_10000_plus',

  // Split action buttons
  registerAccount: 'register_account',
  viewGuide: 'view_guide',
  chatAdmin: 'chat_admin',

  // Menu selection (kept for CopyTrading/Signals scenes)
  copytrading: 'select_copytrading',
  signals: 'select_signals',
  contactAdmin: 'contact_admin',
  vipSupport: 'vip_support',
  aiSupport: 'ai_support',

  // CopyTrading steps
  alreadyHavePuPrime: 'ct_already_puprime',
  ctNextStep2: 'ct_next_step2',
  ctNextStep3: 'ct_next_step3',
  ctNextStep4: 'ct_next_step4',
  ctFinalStep: 'ct_final_step',

  // Signals steps
  sigCreatedAccount: 'sig_created_account',
  sigAlreadyHaveAccount: 'sig_already_have_account',
  sigDepositedDone: 'sig_deposited_done',
  sigVideoGuide: 'sig_video_guide',

  // Status confirmation buttons
  ctRegistered: 'ct_registered',
  ctSkipAccount: 'ct_skip_account',
  ctDeposited: 'ct_deposited',
  ctCopyEnabled: 'ct_copy_enabled',
  sigRegistered: 'sig_registered',
  sigSkipAccount: 'sig_skip_account',
  sigDeposited: 'sig_deposited',

  // New flow callbacks
  cantOpenLink: 'cant_open_link',
  installWarp: 'install_warp',
  reopenLink: 'reopen_link',
  joinVip: 'join_vip',
  startCopytradeSetup: 'start_copytrade_setup',
  depositGuide: 'deposit_guide',
  viewPerformance: 'view_performance',
  freeSignals: 'free_signals',
  upgradeVip: 'upgrade_vip',

  // Redesigned flow callbacks
  vipPackage: 'vip_package',
  support: 'support_whale',
  startSetup: 'start_setup',
  registerNew: 'register_new',
  transferIb: 'transfer_ib',
  brokerPuPrime: 'broker_puprime',
  brokerUltima: 'broker_ultima',
  brokerVantage: 'broker_vantage',
  ibSubmitted: 'ib_submitted',
  sentEmail: 'sent_email',
  sendUid: 'send_uid',
  whaleAmount500: 'whale_500',
  whaleAmount1000: 'whale_1000',
  whaleAmount5000: 'whale_5000',
  whaleAmount10000: 'whale_10000',
};
