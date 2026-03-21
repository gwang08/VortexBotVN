import { Markup } from 'telegraf';
import { CALLBACKS, BOT_TRADING_URL } from './constants';

// Capital selection (thay thế nhập profit target)
export const capitalSelectionKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('💵 $100 – $500', CALLBACKS.capital100_500)],
    [Markup.button.callback('💰 $500 – $2,000', CALLBACKS.capital500_2000)],
    [Markup.button.callback('🏦 $2,000 – $5,000', CALLBACKS.capital2000_5000)],
    [Markup.button.callback('💎 $5,000 – $10,000', CALLBACKS.capital5000_10000)],
    [Markup.button.callback('👑 $10,000+', CALLBACKS.capital10000plus)],
    [Markup.button.url('📊 Bot Trading', BOT_TRADING_URL)],
  ]);

// Menu chính - Retail
export const mainMenuRetailKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📊 CopyTrading', CALLBACKS.copytrading)],
    [Markup.button.callback('📡 Tín Hiệu (Signals)', CALLBACKS.signals)],
    [Markup.button.callback('💬 Hỗ Trợ AI', CALLBACKS.aiSupport)],
    [Markup.button.url('📊 Bot Trading', BOT_TRADING_URL)],
  ]);

// Menu chính - Semi
export const mainMenuSemiKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📊 CopyTrading', CALLBACKS.copytrading)],
    [Markup.button.callback('📡 Tín Hiệu (Signals)', CALLBACKS.signals)],
    [Markup.button.callback('💬 Hỗ Trợ AI', CALLBACKS.aiSupport)],
    [Markup.button.url('📊 Bot Trading', BOT_TRADING_URL)],
  ]);

// Menu chính - VIP
export const mainMenuVipKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📊 CopyTrading', CALLBACKS.copytrading)],
    [Markup.button.callback('📡 Tín Hiệu (Signals)', CALLBACKS.signals)],
    [Markup.button.callback('💎 Hỗ Trợ VIP', CALLBACKS.vipSupport)],
    [Markup.button.url('📊 Bot Trading', BOT_TRADING_URL)],
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
