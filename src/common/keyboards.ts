import { Markup } from 'telegraf';
import { CALLBACKS, BOT_TRADING_URL, MYFXBOOK_URL, CHANNEL_URL, PUPRIME_SIGNUP_LINK } from './constants';

// Step 1: Hook - Xem kết quả / Bắt đầu ngay
export const hookKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📈 Xem kết quả', CALLBACKS.viewResults)],
    [Markup.button.callback('🚀 Bắt đầu ngay', CALLBACKS.startNow)],
  ]);

// Step 2: Proof - Myfxbook / Channel / Website
export const proofKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.url('📈 Myfxbook (Track record)', MYFXBOOK_URL)],
    [Markup.button.url('📊 Channel (Update mỗi ngày)', CHANNEL_URL)],
    [Markup.button.url('🌐 Website (Thông tin chi tiết)', BOT_TRADING_URL)],
    [Markup.button.callback('➡️ Tiếp tục', CALLBACKS.continueToCapital)],
  ]);

// Step 3: Capital selection (new ranges)
export const capitalSelectionKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('💵 Dưới $100 (Test nhẹ)', CALLBACKS.capitalUnder100)],
    [Markup.button.callback('💰 $100 – $500', CALLBACKS.capital100_500)],
    [Markup.button.callback('💎 $500 – $2,000', CALLBACKS.capital500_2000)],
    [Markup.button.callback('🏦 $2,000 – $10,000', CALLBACKS.capital2000_10000)],
    [Markup.button.callback('👑 Trên $10,000', CALLBACKS.capital10000plus)],
  ]);

// Step 4: Retail split (<2k$) - Đăng ký / Xem hướng dẫn / AI Support
export const retailActionKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🚀 Đăng ký tài khoản', CALLBACKS.registerAccount)],
    [Markup.button.callback('📋 Xem hướng dẫn', CALLBACKS.viewGuide)],
    [Markup.button.callback('💬 Hỗ Trợ AI', CALLBACKS.aiSupport)],
  ]);

// Step 4: VIP split (>=2k$) - Trao đổi riêng với admin + AI
export const vipActionKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🤝 Trao đổi riêng với admin', CALLBACKS.chatAdmin)],
    [Markup.button.callback('💬 Hỗ Trợ AI', CALLBACKS.aiSupport)],
  ]);

// CopyTrading Bước 1 - với nút xác nhận đăng ký
export const ctStep1Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Tôi đã đăng ký', CALLBACKS.ctRegistered)],
    [Markup.button.callback('✅ Tôi đã có PU Prime', CALLBACKS.alreadyHavePuPrime)],
    [Markup.button.callback('💬 Liên Hệ Admin', CALLBACKS.contactAdmin)],
  ]);

// CopyTrading IB sub-flow
export const ctIbKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('💬 Liên Hệ Admin', CALLBACKS.contactAdmin)],
  ]);

// Thu thập tài khoản trading - nút bỏ qua
export const ctAccountKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('⏭ Bỏ qua', CALLBACKS.ctSkipAccount)],
  ]);

// CopyTrading Bước 2 -> 3
export const ctStep2Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('➡️ Bước 3', CALLBACKS.ctNextStep3)],
  ]);

// CopyTrading Bước 3 -> 4 (với xác nhận nạp tiền)
export const ctStep3Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('💰 Tôi đã nạp tiền', CALLBACKS.ctDeposited)],
    [Markup.button.callback('➡️ Bước 4', CALLBACKS.ctNextStep4)],
  ]);

// CopyTrading Bước 4 -> Cuối
export const ctStep4Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🏁 Bước Cuối Cùng', CALLBACKS.ctFinalStep)],
  ]);

// CopyTrading cuối - xác nhận bật copy
export const ctFinalKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Tôi đã bật CopyTrade', CALLBACKS.ctCopyEnabled)],
  ]);

// AI Chat - tier-aware inline keyboards shown after AI responses
export const aiChatRetailKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🚀 Đăng ký ngay', CALLBACKS.registerAccount)],
    [Markup.button.url('📈 Xem Myfxbook', MYFXBOOK_URL)],
  ]);

export const aiChatVipKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🤝 Chat admin', CALLBACKS.chatAdmin)],
    [Markup.button.url('📈 Xem Myfxbook', MYFXBOOK_URL)],
  ]);

export const aiChatWhaleKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🤝 Chat admin ngay', CALLBACKS.chatAdmin)],
  ]);

// Signals Bước 1
export const sigStep1Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Tôi đã đăng ký', CALLBACKS.sigRegistered)],
    [Markup.button.callback('✅ Tôi đã có PU Prime', CALLBACKS.sigAlreadyHaveAccount)],
    [Markup.button.callback('💬 Liên Hệ Admin', CALLBACKS.contactAdmin)],
  ]);

// Signals thu thập tài khoản - nút bỏ qua
export const sigAccountKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('⏭ Bỏ qua', CALLBACKS.sigSkipAccount)],
  ]);

// Signals Bước 2 (nạp tiền với xác nhận)
export const sigStep2Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('💰 Tôi đã nạp tiền', CALLBACKS.sigDeposited)],
    [Markup.button.callback('🎥 Video hướng dẫn nạp tiền', CALLBACKS.sigVideoGuide)],
  ]);
