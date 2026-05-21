import { Markup } from 'telegraf';
import { CALLBACKS } from './constants';

// ── Screen 1: Welcome ──
export const welcomeKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🏆 BMR Copy Trading', CALLBACKS.selectBmrCopyTrading)],
    [Markup.button.callback('🔥 Dulcie Gold', CALLBACKS.selectBmrCopy)],
    // [Markup.button.callback('🤖 Grok AI Gold', CALLBACKS.selectGrokAiGold)], // tạm ẩn, chờ sản phẩm mới
    // [Markup.button.callback('🚀 BMR Scalper Gold', CALLBACKS.selectBmrScalperGold)], // tạm ẩn
    [Markup.button.callback('👑 Gói VIP', CALLBACKS.vipPackage)],
    [Markup.button.callback('👨‍💻 Hỗ trợ', CALLBACKS.support)],
  ]);

// ── Screen 2: Grok AI Gold (PU Prime) ──
export const grokAiGoldKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🔥 Đăng ký PU Prime', CALLBACKS.registerPuPrime)],
    [Markup.button.callback('🔄 Đã Có Tài Khoản', CALLBACKS.alreadyHaveAccount)],
    [Markup.button.callback('👨‍💻 Hỗ trợ', CALLBACKS.contactAdmin)],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 3: BMR Copy Trading (Ultima) ──
export const bmrCopyTradingKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🔥 Đăng ký Ultima Markets', CALLBACKS.registerUltima)],
    [Markup.button.callback('🔄 Đã có tài khoản Ultima', CALLBACKS.alreadyHaveAccount)],
    [Markup.button.callback('👨‍💻 Hỗ trợ', CALLBACKS.contactAdmin)],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 3b: Dulcie Gold (STARTRADER) ──
export const dulcieGoldKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🔥 Đăng ký STARTRADER', CALLBACKS.registerStarTrader)],
    [Markup.button.callback('🔄 Đã Có Tài Khoản', CALLBACKS.alreadyHaveAccount)],
    [Markup.button.callback('👨‍💻 Hỗ trợ', CALLBACKS.contactAdmin)],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 4: BMR Scalper Gold (PU Prime + Vantage) ──
export const bmrScalperGoldKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🚀 Đăng ký PU Prime', CALLBACKS.registerPuPrime)],
    [Markup.button.callback('🔥 Đăng ký Vantage', CALLBACKS.registerVantage)],
    [Markup.button.callback('🔄 Đã Có Tài Khoản', CALLBACKS.alreadyHaveAccount)],
    [Markup.button.callback('👨‍💻 Hỗ trợ', CALLBACKS.contactAdmin)],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 5: VIP Package (choose broker) ──
export const vipPackageKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🤖 PU Prime', CALLBACKS.registerPuPrime)],
    [Markup.button.callback('🚀 Ultima', CALLBACKS.registerUltima)],
    [Markup.button.callback('🏆 Vantage', CALLBACKS.registerVantage)],
    [Markup.button.callback('👨‍💻 Hỗ trợ', CALLBACKS.contactAdmin)],
    [Markup.button.callback('🔙 Quay Lại Menu', CALLBACKS.backToMenu)],
  ]);

// ── Screen 6/7/8: Register (shared for all brokers) ──
export const registerKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Đã đăng ký', CALLBACKS.ctRegistered)],
    [Markup.button.callback('🌐 Không mở được link', CALLBACKS.cantOpenLink)],
  ]);

// ── WARP fallback ──
export const warpKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.url('📲 Cài đặt 1.1.1.1', 'https://1.1.1.1/')],
    [Markup.button.callback('🔄 Mở link', CALLBACKS.reopenLink)],
  ]);

// ── Screen 9: Already have account (choose broker to transfer) ──
export const alreadyHaveAccountKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('PU Prime', CALLBACKS.brokerPuPrime)],
    [Markup.button.callback('Ultima Markets', CALLBACKS.brokerUltima)],
    [Markup.button.callback('Vantage', CALLBACKS.brokerVantage)],
  ]);

// ── Screen 10: PU Prime Transfer ──
export const puPrimeTransferKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📩 Đã gửi', CALLBACKS.ibSubmitted)],
    [Markup.button.callback('👨‍💻 Hỗ trợ', CALLBACKS.contactAdmin)],
  ]);

// ── Screen 11/12: Ultima / Vantage Transfer ──
export const emailTransferKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📩 Đã gửi email', CALLBACKS.sentEmail)],
    [Markup.button.callback('👨‍💻 Hỗ trợ', CALLBACKS.contactAdmin)],
  ]);

// ── Screen 13: Deposit ──
export const depositKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Đã nạp', CALLBACKS.ctDeposited)],
  ]);

// ── Screen 14: Verify (Send UID) ──
export const verifyKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📮 Gửi UID', CALLBACKS.sendUid)],
  ]);

// ── Screen 15: Unlock (choose system) ──
export const unlockKeyboard = () =>
  Markup.inlineKeyboard([
    // [Markup.button.callback('🤖 Grok AI Gold', CALLBACKS.unlockGrokAiGold)], // tạm ẩn, chờ sản phẩm mới
    [Markup.button.callback('🏆 BMR Copy Trading', CALLBACKS.unlockBmrCopyTrading)],
    [Markup.button.callback('🔥 Dulcie Gold', CALLBACKS.unlockBmrCopy)],
    // [Markup.button.callback('🚀 BMR Scalper Gold', CALLBACKS.unlockBmrScalperGold)], // tạm ẩn
    [Markup.button.callback('👑 Gói VIP', CALLBACKS.unlockVipPackage)],
  ]);
