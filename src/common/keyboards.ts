import { Markup } from 'telegraf';
import { CALLBACKS, COMMUNITY_CHANNELS, COMMUNITY_GLOBAL } from './constants';

// ── Screen 1: Welcome ──
export const welcomeKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🏆 BMR Copy Trading', CALLBACKS.selectBmrCopyTrading)],
    [Markup.button.callback('🔥 Dulcie Gold', CALLBACKS.selectBmrCopy)],
    // [Markup.button.callback('🤖 Grok AI Gold', CALLBACKS.selectGrokAiGold)], // tạm ẩn, chờ sản phẩm mới
    // [Markup.button.callback('🚀 BMR Scalper Gold', CALLBACKS.selectBmrScalperGold)], // tạm ẩn
    [Markup.button.callback('👑 Gói VIP', CALLBACKS.vipPackage)],
    [Markup.button.callback('🌍 Community Access', CALLBACKS.communityAccess)],
  ]);

// ── Screen 2: Grok AI Gold (PU Prime) ──
export const grokAiGoldKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🔥 Đăng ký PU Prime', CALLBACKS.registerPuPrime)],
    [Markup.button.callback('🔄 Đã Có Tài Khoản', CALLBACKS.alreadyHaveAccount)],
    [Markup.button.url('👨‍💻 Hỗ trợ', 'https://t.me/FinBMR')],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 3: BMR Copy Trading (Ultima) ──
export const bmrCopyTradingKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🔥 Đăng ký Ultima Markets', CALLBACKS.registerUltima)],
    [Markup.button.callback('🔄 Đã có tài khoản Ultima', CALLBACKS.alreadyHaveUltima)],
    [Markup.button.url('👨‍💻 Hỗ trợ', 'https://t.me/FinBMR')],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 3b: Dulcie Gold (STARTRADER) ──
export const dulcieGoldKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🔥 Đăng ký STARTRADER', CALLBACKS.registerStarTrader)],
    [Markup.button.callback('🔄 Đã Có Tài Khoản', CALLBACKS.alreadyHaveStartrader)],
    [Markup.button.url('👨‍💻 Hỗ trợ', 'https://t.me/FinBMR')],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 4: BMR Scalper Gold (PU Prime + Vantage) ──
export const bmrScalperGoldKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🚀 Đăng ký PU Prime', CALLBACKS.registerPuPrime)],
    [Markup.button.callback('🔥 Đăng ký Vantage', CALLBACKS.registerVantage)],
    [Markup.button.callback('🔄 Đã Có Tài Khoản', CALLBACKS.alreadyHaveAccount)],
    [Markup.button.url('👨‍💻 Hỗ trợ', 'https://t.me/FinBMR')],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 5: VIP Package (choose broker) ──
export const vipPackageKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🤖 PU Prime', CALLBACKS.registerPuPrime)],
    [Markup.button.callback('🚀 Ultima', CALLBACKS.registerUltima)],
    [Markup.button.callback('🏆 Vantage', CALLBACKS.registerVantage)],
    [Markup.button.url('👨‍💻 Hỗ trợ', 'https://t.me/FinBMR')],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 6/7/8: Register (shared for all brokers) ──
export const registerKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Đã đăng ký', CALLBACKS.ctRegistered)],
    [Markup.button.callback('🌐 Không mở được link', CALLBACKS.cantOpenLink)],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── WARP fallback ──
export const warpKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.url('📲 Cài đặt 1.1.1.1', 'https://1.1.1.1/')],
    [Markup.button.callback('🔄 Mở link', CALLBACKS.reopenLink)],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 9: Already have account (choose broker to transfer) ──
export const alreadyHaveAccountKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('PU Prime', CALLBACKS.brokerPuPrime)],
    [Markup.button.callback('Ultima Markets', CALLBACKS.brokerUltima)],
    [Markup.button.callback('Vantage', CALLBACKS.brokerVantage)],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 10: PU Prime Transfer ──
export const puPrimeTransferKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📩 Đã gửi', CALLBACKS.ibSubmitted)],
    [Markup.button.url('👨‍💻 Hỗ trợ', 'https://t.me/FinBMR')],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 11/12: Ultima / Vantage / STARTRADER Transfer ──
// Optional mailtoUrl shows an "Open Email App" button that pre-fills subject + body.
export const emailTransferKeyboard = (mailtoUrl?: string) => {
  const rows: any[][] = [];
  if (mailtoUrl) rows.push([Markup.button.url('📧 Mở App Email', mailtoUrl)]);
  rows.push([Markup.button.callback('📩 Đã gửi email', CALLBACKS.sentEmail)]);
  rows.push([Markup.button.url('👨‍💻 Hỗ trợ', 'https://t.me/FinBMR')]);
  rows.push([Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)]);
  return Markup.inlineKeyboard(rows);
};

// ── Screen 11b: Screenshot confirmation (sau khi "Đã gửi email") ──
export const screenshotConfirmKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.url('💬 Nhắn @FinBMR', 'https://t.me/FinBMR')],
    [Markup.button.url('👨‍💻 Hỗ trợ', 'https://t.me/FinBMR')],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 13: Deposit ──
export const depositKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Đã nạp', CALLBACKS.ctDeposited)],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 14: Verify (Send UID) ──
export const verifyKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📮 Gửi UID', CALLBACKS.sendUid)],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 15: Unlock (choose system) ──
export const unlockKeyboard = () =>
  Markup.inlineKeyboard([
    // [Markup.button.callback('🤖 Grok AI Gold', CALLBACKS.unlockGrokAiGold)], // tạm ẩn, chờ sản phẩm mới
    [Markup.button.callback('🏆 BMR Copy Trading', CALLBACKS.unlockBmrCopyTrading)],
    [Markup.button.callback('🔥 Dulcie Gold', CALLBACKS.unlockBmrCopy)],
    // [Markup.button.callback('🚀 BMR Scalper Gold', CALLBACKS.unlockBmrScalperGold)], // tạm ẩn
    [Markup.button.callback('👑 Gói VIP', CALLBACKS.unlockVipPackage)],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Community: Region picker ──
export const communityRegionsKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.url('🌐 Global', COMMUNITY_GLOBAL)],
    [Markup.button.callback('🌍 Middle East & MENA', CALLBACKS.communityMiddleEast)],
    [Markup.button.callback('🌏 Asia', CALLBACKS.communityAsia)],
    [Markup.button.callback('🌍 Africa', CALLBACKS.communityAfrica)],
    [Markup.button.callback('🌎 LATAM', CALLBACKS.communityLatam)],
    [Markup.button.callback('🇪🇺 Europe & CIS', CALLBACKS.communityEurope)],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// Helper: build country list keyboard with back buttons
function regionKeyboard(channels: Array<{ flag: string; name: string; url: string }>) {
  const buttons: any[][] = channels.map((c) => [Markup.button.url(`${c.flag} ${c.name}`, c.url)]);
  buttons.push([Markup.button.callback('🔙 Quay Lại Khu Vực', CALLBACKS.communityAccess)]);
  buttons.push([Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)]);
  return Markup.inlineKeyboard(buttons);
}

export const middleEastKeyboard = () => regionKeyboard(COMMUNITY_CHANNELS.middleEast);
export const asiaKeyboard = () => regionKeyboard(COMMUNITY_CHANNELS.asia);
export const africaKeyboard = () => regionKeyboard(COMMUNITY_CHANNELS.africa);
export const latamKeyboard = () => regionKeyboard(COMMUNITY_CHANNELS.latam);
export const europeKeyboard = () => regionKeyboard(COMMUNITY_CHANNELS.europe);
