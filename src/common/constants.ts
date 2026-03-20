import * as path from 'path';

// PuPrime signup link
export const PUPRIME_SIGNUP_LINK =
  'https://puprime.pro/forex-trading-account/?cs=bmrcopytrade';

// IB Code for existing PuPrime users
export const IB_CODE = 'bmrmaster';

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
  copytrading: 'select_copytrading',
  signals: 'select_signals',
  contactAdmin: 'contact_admin',
  vipSupport: 'vip_support',
  aiSupport: 'ai_support',
  alreadyHavePuPrime: 'ct_already_puprime',
  ctNextStep2: 'ct_next_step2',
  ctNextStep3: 'ct_next_step3',
  ctNextStep4: 'ct_next_step4',
  ctFinalStep: 'ct_final_step',
  sigCreatedAccount: 'sig_created_account',
  sigAlreadyHaveAccount: 'sig_already_have_account',
  sigDepositedDone: 'sig_deposited_done',
  sigVideoGuide: 'sig_video_guide',
};
