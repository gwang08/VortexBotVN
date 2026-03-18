import { InputMediaPhoto } from 'telegraf/types';
import { IMAGES } from './constants';
import * as fs from 'fs';

// Helper to create InputMediaPhoto from file path
function photo(filePath: string, caption?: string): InputMediaPhoto {
  if (!fs.existsSync(filePath)) {
    return { type: 'photo', media: filePath, caption };
  }
  return {
    type: 'photo',
    media: { source: filePath },
    caption,
  };
}

// CopyTrading "Đã có Pu Prime" - Hướng dẫn chuyển IB trên Mobile (4 ảnh)
export function ctIbMobileMedia(): InputMediaPhoto[] {
  const imgs = IMAGES.copytrading.step1Ib;
  return [
    photo(imgs.mobile1, '⚡️ HƯỚNG DẪN CHUYỂN MÃ HỖ TRỢ TRÊN ĐIỆN THOẠI'),
    photo(imgs.mobile2),
    photo(imgs.mobile3),
    photo(imgs.mobile4),
  ];
}

// CopyTrading "Đã có Pu Prime" - Hướng dẫn chuyển IB trên Web (1 ảnh)
export function ctIbWebMedia(): InputMediaPhoto[] {
  const imgs = IMAGES.copytrading.step1Ib;
  return [photo(imgs.web1, '⚡️ HƯỚNG DẪN CHUYỂN MÃ HỖ TRỢ TRÊN WEB')];
}

// CopyTrading Bước 2 - Mở Tài Khoản Copy Trading (4 ảnh)
export function ctStep2Media(): InputMediaPhoto[] {
  const imgs = IMAGES.copytrading.step2;
  return [
    photo(imgs.appLive, 'BƯỚC 2: Mở Tài Khoản Copy Trading'),
    photo(imgs.accountMgmt),
    photo(imgs.accountOpening),
    photo(imgs.congratulations),
  ];
}

// CopyTrading Bước 3 - Chuyển Tiền (2 ảnh)
export function ctStep3Media(): InputMediaPhoto[] {
  const imgs = IMAGES.copytrading.step3;
  return [
    photo(imgs.profileTransfer, 'BƯỚC 3: Chuyển Tiền Vào Tài Khoản Copy Trading'),
    photo(imgs.transferFunds),
  ];
}

// CopyTrading Bước 4 - Tìm Master Trader (2 ảnh)
export function ctStep4Media(): InputMediaPhoto[] {
  const imgs = IMAGES.copytrading.step4;
  return [
    photo(imgs.copyTradingHome, 'Bước 4: Tìm Master Trader'),
    photo(imgs.redBullDetail),
  ];
}

// CopyTrading Bước Cuối - Cấu Hình Copy (2 ảnh)
export function ctFinalMedia(): InputMediaPhoto[] {
  const imgs = IMAGES.copytrading.step5;
  return [
    photo(imgs.copySettings1, 'BƯỚC CUỐI: Cấu Hình và Bắt Đầu Copy'),
    photo(imgs.copySettings2),
  ];
}
