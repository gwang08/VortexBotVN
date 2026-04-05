import { Markup } from 'telegraf';
import { CALLBACKS, BOT_TRADING_URL, MYFXBOOK_URL, CHANNEL_URL } from './constants';

// ── REDESIGNED FLOW KEYBOARDS (Vietnamese) ──

// Screen 1: Welcome (4 options)
export const welcomeKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🚀 VIP Package', CALLBACKS.vipPackage)],
    [Markup.button.callback('🤖 Copytrade', CALLBACKS.copytrading)],
    [Markup.button.callback('📊 Free Signals', CALLBACKS.freeSignals)],
    [Markup.button.callback('🧑‍💼 Support', CALLBACKS.support)],
  ]);

// Screen 2: VIP Package
export const vipPackageKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🔥 Vào VIP', CALLBACKS.joinVip)],
    [Markup.button.callback('🤖 Copytrade', CALLBACKS.startSetup)],
  ]);

// Screen 3: Copytrade Info
export const copytradeInfoKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🔥 Bắt đầu', CALLBACKS.startSetup)],
  ]);

// Screen 4: Free Signals
export const freeSignalsKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.url('📊 Join Free', CHANNEL_URL)],
    [Markup.button.callback('🚀 VIP', CALLBACKS.vipPackage)],
  ]);

// Screen 5: Broker Question
export const brokerQuestionKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📝 Đăng ký mới', CALLBACKS.registerNew)],
    [Markup.button.callback('🔄 Chuyển IB', CALLBACKS.transferIb)],
  ]);

// Screen 6: Register
export const registerKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Đã đăng ký', CALLBACKS.ctRegistered)],
    [Markup.button.callback('🌐 Lỗi link', CALLBACKS.cantOpenLink)],
  ]);

// Screen 7: 1.1.1.1 WARP
export const warpKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.url('📲 Cài 1.1.1.1', 'https://1.1.1.1/')],
    [Markup.button.callback('🔄 Mở lại link', CALLBACKS.reopenLink)],
  ]);

// Screen 8: Transfer IB - Choose Broker
export const transferBrokerKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🟢 PU Prime', CALLBACKS.brokerPuPrime)],
    [Markup.button.callback('🔵 Ultima', CALLBACKS.brokerUltima)],
    [Markup.button.callback('🟠 Vantage', CALLBACKS.brokerVantage)],
  ]);

// Screen 9: PU Prime Transfer
export const puPrimeTransferKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📮 Tôi đã Submit', CALLBACKS.ibSubmitted)],
  ]);

// Screen 10: Ultima Transfer
export const ultimaTransferKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📮 Đã gửi Email', CALLBACKS.sentEmail)],
  ]);

// Screen 11 (Deposit)
export const depositKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Đã nạp tiền', CALLBACKS.ctDeposited)],
  ]);

// Screen 13: Unlock
export const unlockKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🤖 Copytrade', CALLBACKS.startCopytradeSetup)],
    [Markup.button.callback('🚀 VIP', CALLBACKS.joinVip)],
  ]);

// Whale flow: Investment amount
export const whaleAmountKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('💵 $500', CALLBACKS.whaleAmount500)],
    [Markup.button.callback('💰 $1000', CALLBACKS.whaleAmount1000)],
    [Markup.button.callback('💎 $5000+', CALLBACKS.whaleAmount5000)],
    [Markup.button.callback('👑 $10000+', CALLBACKS.whaleAmount10000)],
  ]);

// ── LEGACY KEYBOARDS (kept for detailed copy steps 2-5) ──

export const ctIbKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('💬 Liên Hệ Admin', CALLBACKS.contactAdmin)],
  ]);

export const ctAccountKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('⏭ Bỏ qua', CALLBACKS.ctSkipAccount)],
  ]);

export const ctStep2Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('➡️ Bước 3', CALLBACKS.ctNextStep3)],
  ]);

export const ctStep3Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('💰 Tôi đã nạp tiền', CALLBACKS.ctDeposited)],
    [Markup.button.callback('➡️ Bước 4', CALLBACKS.ctNextStep4)],
  ]);

export const ctStep4Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🏁 Bước Cuối Cùng', CALLBACKS.ctFinalStep)],
  ]);

export const ctFinalKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Tôi đã bật CopyTrade', CALLBACKS.ctCopyEnabled)],
  ]);

// AI Chat keyboards
export const aiChatRetailKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🚀 Đăng ký ngay', CALLBACKS.registerNew)],
    [Markup.button.url('📈 Xem Myfxbook', MYFXBOOK_URL)],
  ]);

export const aiChatVipKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🤝 Chat admin', CALLBACKS.contactAdmin)],
    [Markup.button.url('📈 Xem Myfxbook', MYFXBOOK_URL)],
  ]);

export const aiChatWhaleKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🤝 Chat admin ngay', CALLBACKS.contactAdmin)],
  ]);

// Signals keyboards
export const sigStep1Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Tôi đã đăng ký', CALLBACKS.sigRegistered)],
    [Markup.button.callback('✅ Tôi đã có PU Prime', CALLBACKS.sigAlreadyHaveAccount)],
    [Markup.button.callback('💬 Liên Hệ Admin', CALLBACKS.contactAdmin)],
  ]);

export const sigAccountKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('⏭ Bỏ qua', CALLBACKS.sigSkipAccount)],
  ]);

export const sigStep2Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('💰 Tôi đã nạp tiền', CALLBACKS.sigDeposited)],
    [Markup.button.callback('🎥 Video hướng dẫn nạp tiền', CALLBACKS.sigVideoGuide)],
  ]);

// VIP Signals info (legacy)
export const vipSignalsKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.url('📈 Join VIP', CHANNEL_URL)],
    [Markup.button.url('📊 Performance', MYFXBOOK_URL)],
    [Markup.button.callback('🧑‍💼 Support', CALLBACKS.contactAdmin)],
  ]);

// Capital selection (legacy, kept for AI chat)
export const capitalSelectionKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('💵 Dưới $100 (Test nhẹ)', CALLBACKS.capitalUnder100)],
    [Markup.button.callback('💰 $100 – $500', CALLBACKS.capital100_500)],
    [Markup.button.callback('💎 $500 – $2,000', CALLBACKS.capital500_2000)],
    [Markup.button.callback('🏦 $2,000 – $10,000', CALLBACKS.capital2000_10000)],
    [Markup.button.callback('👑 Trên $10,000', CALLBACKS.capital10000plus)],
  ]);
