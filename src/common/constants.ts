import * as path from 'path';

// PuPrime signup link
export const PUPRIME_SIGNUP_LINK =
  'https://www.puprime.com/campaign?cs=BMRMasterTrader';

// IB Code for existing PuPrime users
export const IB_CODE = 'hmZDV5Xa';

// Video guide URLs
export const VIDEO_GUIDES = {
  openAccount: 'https://youtu.be/_nCn1NHuLHI',
  idAuth: 'https://youtu.be/jJ6IFPOjGDE',
  addressVerify: 'https://youtu.be/XhDtV0h_tqo',
  usePromotions: 'https://youtu.be/4Z3q9yFRdPA',
  depositCrypto: 'https://youtu.be/pG1k2xPpzRQ',
  depositCreditCard: 'https://youtu.be/5LYD7DYW3tA',
  depositEWallet: 'https://youtu.be/VYlr2KPg19w',
  depositLocalBank: 'https://youtu.be/P2dtW_ccXMs',
  depositIntlBank: 'https://youtu.be/wQD1dWhuaqA',
  withdrawCrypto: 'https://youtu.be/pykRHpOsyqA',
  withdrawCreditCard: 'https://youtu.be/NakNND_T_ZA',
  withdrawEWallet: 'https://youtu.be/ZZ9zWmWcCKo',
  withdrawLocalBank: 'https://youtu.be/VNQyoTr7bfQ',
  withdrawIntlBank: 'https://youtu.be/R48576DzGqo',
};

// Text templates for account creation (shared between CopyTrading & Signals)
export const ACCOUNT_CREATION_TEXT = `Tạo tài khoản Pu Prime theo link sau: ${PUPRIME_SIGNUP_LINK}

Video HƯỚNG DẪN:

📣 Mở Tài Khoản Live PuPrime: ${VIDEO_GUIDES.openAccount}
💋 Xác Minh Danh Tính: ${VIDEO_GUIDES.idAuth}
⭐️ Xác Minh Địa Chỉ: ${VIDEO_GUIDES.addressVerify}
🎲 Sử Dụng Khuyến Mãi: ${VIDEO_GUIDES.usePromotions}

Nếu bạn đã có tài khoản Pu Prime, nhấn nút bên dưới`;

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
