import { Markup } from 'telegraf';
import { CALLBACKS } from './constants';

// Main menu - VIP (deposit >= $5k)
export const mainMenuVipKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📊 CopyTrading', CALLBACKS.copytrading)],
    [Markup.button.callback('📡 Tín Hiệu (Signals)', CALLBACKS.signals)],
    [Markup.button.callback('💎 Hỗ Trợ VIP', CALLBACKS.vipSupport)],
  ]);

// Main menu - Standard (deposit < $5k)
export const mainMenuStandardKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📊 CopyTrading', CALLBACKS.copytrading)],
    [Markup.button.callback('📡 Tín Hiệu (Signals)', CALLBACKS.signals)],
    [Markup.button.callback('💬 Hỗ Trợ', CALLBACKS.aiSupport)],
  ]);

// CopyTrading Step 1
export const ctStep1Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Tôi đã có tài khoản PU Prime', CALLBACKS.alreadyHavePuPrime)],
    [Markup.button.callback('➡️ Bước 2', CALLBACKS.ctNextStep2)],
    [Markup.button.callback('💬 Liên Hệ Admin', CALLBACKS.contactAdmin)],
  ]);

// CopyTrading IB sub-flow (after "Already have Pu Prime")
export const ctIbKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('💬 Liên Hệ Admin', CALLBACKS.contactAdmin)],
  ]);

// CopyTrading Step 2 → 3
export const ctStep2Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('➡️ Bước 3', CALLBACKS.ctNextStep3)],
  ]);

// CopyTrading Step 3 → 4
export const ctStep3Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('➡️ Bước 4', CALLBACKS.ctNextStep4)],
  ]);

// CopyTrading Step 4 → Final
export const ctStep4Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🏁 Bước Cuối Cùng', CALLBACKS.ctFinalStep)],
  ]);

// Signals Step 1
export const sigStep1Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Tôi đã tạo tài khoản xong', CALLBACKS.sigCreatedAccount)],
    [Markup.button.callback('✅ Tôi đã có tài khoản PU Prime', CALLBACKS.sigAlreadyHaveAccount)],
    [Markup.button.callback('💬 Liên Hệ Admin', CALLBACKS.contactAdmin)],
  ]);

// Signals Step 2 (deposit)
export const sigStep2Keyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Tôi đã nạp tiền xong', CALLBACKS.sigDepositedDone)],
    [Markup.button.callback('🎥 Video hướng dẫn nạp tiền', CALLBACKS.sigVideoGuide)],
  ]);
