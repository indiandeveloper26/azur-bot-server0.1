// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// const cron = require('node-cron');

// // === CONFIG ===
// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8003756443:AAHOP678U2KdAiTuVYQZVQ2DsYnT2Oq4PnE'

// // अब 13 सिम्बल्स (3 पहले से + 10 नए)
// const SYMBOLS = [
//   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
//   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
//   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
//   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
//   'SHIBUSDT'
// ];

// const INTERVAL = '15m';
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;
// const VOLUME_SMA_PERIOD = 20;

// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
// let USER_CHAT_IDS = [];
// let activeTrades = {}; 
// // Format: { chatId: { SYMBOL: { signal, entry, target, stoploss, atr } } }

// // === FETCH FUNCTIONS ===
// async function fetchKlines(symbol, interval, limit = 100) {
//   try {
//     const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
//     const res = await axios.get(url);
//     return res.data.map(c => ({
//       open: parseFloat(c[1]),
//       high: parseFloat(c[2]),
//       low: parseFloat(c[3]),
//       close: parseFloat(c[4]),
//       volume: parseFloat(c[5]),
//       time: c[0]
//     }));
//   } catch (err) {
//     console.error(`Error fetching klines for ${symbol}:`, err.message);
//     return null;
//   }
// }

// async function fetchCurrentPrice(symbol) {
//   try {
//     const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
//     const res = await axios.get(url);
//     return parseFloat(res.data.price);
//   } catch (err) {
//     console.error(`Error fetching current price for ${symbol}:`, err.message);
//     return null;
//   }
// }

// // === ANALYSIS WITH VOLUME FILTER ===
// function analyzeData(candles) {
//   const closes = candles.map(c => c.close);
//   const highs = candles.map(c => c.high);
//   const lows = candles.map(c => c.low);
//   const volumes = candles.map(c => c.volume);

//   const rsi = RSI.calculate({ values: closes, period: 14 });
//   const ema = EMA.calculate({ values: closes, period: 14 });
//   const macd = MACD.calculate({
//     values: closes,
//     fastPeriod: 12,
//     slowPeriod: 26,
//     signalPeriod: 9,
//     SimpleMAOscillator: false,
//     SimpleMASignal: false
//   });
//   const atr = ATR.calculate({ high: highs, low: lows, close: closes, period: 14 });
//   const volumeSMA = SMA.calculate({ values: volumes, period: VOLUME_SMA_PERIOD });

//   const lastClose = closes.at(-1);
//   const lastEma = ema.at(-1);
//   const lastMacd = macd.at(-1);
//   const lastRsi = rsi.at(-1);
//   const lastAtr = atr.at(-1);
//   const lastVolume = volumes.at(-1);
//   const lastVolumeSMA = volumeSMA.at(-1);

//   let signal = 'HOLD';

//   const volumeOkay = lastVolume > lastVolumeSMA;

//   if (volumeOkay && lastClose > lastEma && lastMacd.MACD > lastMacd.signal) signal = 'BUY';
//   else if (volumeOkay && lastClose < lastEma && lastMacd.MACD < lastMacd.signal) signal = 'SELL';

//   let target = null, stoploss = null;
//   if (signal === 'BUY') {
//     target = lastClose + TARGET_MULTIPLIER * lastAtr;
//     stoploss = lastClose - STOPLOSS_MULTIPLIER * lastAtr;
//   } else if (signal === 'SELL') {
//     target = lastClose - TARGET_MULTIPLIER * lastAtr;
//     stoploss = lastClose + STOPLOSS_MULTIPLIER * lastAtr;
//   }

//   return {
//     signal, lastClose, lastEma, lastRsi, lastMacd,
//     lastAtr, lastVolume, lastVolumeSMA, target, stoploss
//   };
// }

// // === TRADE MANAGEMENT ===
// function checkIfHit(price, trade) {
//   if (!trade) return false;
//   if (trade.signal === 'BUY') {
//     if (price >= trade.target) return 'target';
//     if (price <= trade.stoploss) return 'stoploss';
//   } else if (trade.signal === 'SELL') {
//     if (price <= trade.target) return 'target';
//     if (price >= trade.stoploss) return 'stoploss';
//   }
//   return false;
// }

// // --- 5 मिनट पर HOLD मैसेज अगर कोई एक्टिव ट्रेड नहीं है --- 
// async function sendHoldMessages() {
//   for (const chatId of USER_CHAT_IDS) {
//     const trades = activeTrades[chatId];
//     let noActiveTrade = true;
//     if (trades && Object.keys(trades).length > 0) {
//       noActiveTrade = false;
//     }

//     if (noActiveTrade) {
//       for (const symbol of SYMBOLS) {
//         const candles = await fetchKlines(symbol, INTERVAL, 20);
//         if (!candles) continue;
//         const analysis = analyzeData(candles);
//         if (!analysis) continue;

//         const msg = `
// ⚠️ *${symbol}* - कोई नया ट्रेड सिग्नल नहीं मिला। मार्केट स्थिर है। (HOLD)
// 📈 Price: ${analysis.lastClose.toFixed(2)}
// 📊 RSI: ${analysis.lastRsi.toFixed(2)}
// 📉 EMA14: ${analysis.lastEma.toFixed(2)}
// 📈 MACD: ${analysis.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line: ${analysis.lastMacd.signal.toFixed(2)}
//         `;
//         await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
//       }
//     }
//   }
// }

// async function sendSignal() {
//   try {
//     console.log("⏰ Checking signals for all symbols...");

//     for (const symbol of SYMBOLS) {
//       const candles = await fetchKlines(symbol, INTERVAL);
//       const currentPrice = await fetchCurrentPrice(symbol);
//       if (!candles || !currentPrice) continue;

//       for (const chatId of USER_CHAT_IDS) {
//         if (!activeTrades[chatId]) activeTrades[chatId] = {};

//         const trade = activeTrades[chatId][symbol];

//         if (trade) {
//           const hit = checkIfHit(currentPrice, trade);
//           if (hit) {
//             await bot.sendMessage(chatId, `⚠️ *${symbol}* - *${trade.signal}* trade बंद हुआ (${hit.toUpperCase()}) at ${currentPrice.toFixed(2)}`, { parse_mode: 'Markdown' });
//             delete activeTrades[chatId][symbol];
//             continue;
//           }

//           // Trailing Stoploss logic
//           const newSL = trade.signal === 'BUY' ? currentPrice - trade.atr : currentPrice + trade.atr;
//           const shouldTrail = (
//             (trade.signal === 'BUY' && currentPrice > trade.entry + trade.atr && newSL > trade.stoploss) ||
//             (trade.signal === 'SELL' && currentPrice < trade.entry - trade.atr && newSL < trade.stoploss)
//           );
//           if (shouldTrail) {
//             trade.stoploss = newSL;
//             await bot.sendMessage(chatId, `🔁 *${symbol}* - Trailing Stoploss अपडेट हुआ!\nNew Stoploss: ${newSL.toFixed(2)}`, { parse_mode: 'Markdown' });
//           }
//         } else {
//           const analysis = analyzeData(candles);
//           if (!analysis) continue;

//           // अगर HOLD सिग्नल है तो HOLD मैसेज भेजें
//           if (analysis.signal === 'HOLD') {
//             const msgHold = `
// ⚠️ *${symbol}* - ट्रेड सिग्नल नहीं मिला। (HOLD)
// 📈 Price: ${analysis.lastClose.toFixed(2)}
// 📊 RSI: ${analysis.lastRsi.toFixed(2)}
// 📉 EMA14: ${analysis.lastEma.toFixed(2)}
// 📈 MACD: ${analysis.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line: ${analysis.lastMacd.signal.toFixed(2)}
//             `;
//             await bot.sendMessage(chatId, msgHold, { parse_mode: 'Markdown' });
//             continue;
//           }

//           const msg = `
// 📡 *Crypto Signal - ${symbol} (${INTERVAL})*
// 📈 Signal: *${analysis.signal}*
// 💰 Entry: ${currentPrice.toFixed(2)}
// 🎯 Target: ${analysis.target.toFixed(2)}
// 🛑 Stoploss: ${analysis.stoploss.toFixed(2)}

// 📊 RSI: ${analysis.lastRsi.toFixed(2)}
// 📉 EMA14: ${analysis.lastEma.toFixed(2)}
// 📈 MACD: ${analysis.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line: ${analysis.lastMacd.signal.toFixed(2)}
// 📊 Volume: ${analysis.lastVolume.toFixed(0)}
// 📉 Avg Vol (SMA20): ${analysis.lastVolumeSMA.toFixed(0)}
//           `;

//           await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

//           activeTrades[chatId][symbol] = {
//             signal: analysis.signal,
//             entry: currentPrice,
//             target: analysis.target,
//             stoploss: analysis.stoploss,
//             atr: analysis.lastAtr
//           };
//         }
//       }
//     }
//   } catch (err) {
//     console.error("🚨 sendSignal error:", err.message);
//   }
// }

// // === TELEGRAM COMMANDS ===
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);
//   bot.sendMessage(chatId, "🤖 बॉट चालू हो गया है! हर 15 मिनट में नए सिग्नल मिलेंगे।\n/status <symbol> से किसी भी सिम्बल की स्थिति जानें।");
// });

// // /status <symbol> कमांड
// bot.onText(/\/status(?:\s+(\w+))?/, async (msg, match) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);

//   const symbol = match[1] ? match[1].toUpperCase() : null;
//   if (!symbol || !SYMBOLS.includes(symbol)) {
//     return bot.sendMessage(chatId, `⚠️ कृपया मान्य सिम्बल दें। उपलब्ध: ${SYMBOLS.join(', ')}`);
//   }

//   const trade = activeTrades[chatId]?.[symbol];
//   if (!trade) {
//     return bot.sendMessage(chatId, `ℹ️ *${symbol}* के लिए कोई एक्टिव ट्रेड नहीं है।`, { parse_mode: 'Markdown' });
//   }

//   const currentPrice = await fetchCurrentPrice(symbol);
//   if (!currentPrice) {
//     return bot.sendMessage(chatId, `⚠️ वर्तमान प्राइस प्राप्त करने में समस्या। कृपया बाद में प्रयास करें।`);
//   }

//   const hitStatus = checkIfHit(currentPrice, trade);

//   let statusMsg = `📊 *${symbol}* ट्रेड स्थिति:\n`;
//   statusMsg += `🔹 Signal: *${trade.signal}*\n`;
//   statusMsg += `🔹 Entry Price: ${trade.entry.toFixed(2)}\n`;
//   statusMsg += `🔹 Current Price: ${currentPrice.toFixed(2)}\n`;
//   statusMsg += `🔹 Target: ${trade.target.toFixed(2)}\n`;
//   statusMsg += `🔹 Stoploss: ${trade.stoploss.toFixed(2)}\n`;

//   if (hitStatus === 'target') {
//     statusMsg += `✅ लक्ष्य हिट हो गया है! ट्रेड सफलतापूर्वक पूरा हुआ।`;
//   } else if (hitStatus === 'stoploss') {
//     statusMsg += `❌ स्टॉपलॉस हिट हो गया है! ट्रेड बंद कर दिया गया।`;
//   } else {
//     statusMsg += `⚠️ ट्रेड अभी सक्रिय है।`;
//   }

//   bot.sendMessage(chatId, statusMsg, { parse_mode: 'Markdown' });
// });

// // === SCHEDULE TASKS ===
// // हर 15 मिनट पर सिग्नल चेक और भेजें
// cron.schedule('*/15 * * * *', () => {
//   sendSignal();
// });

// // हर 5 मिनट पर HOLD मैसेज भेजें अगर कोई ट्रेड नहीं है
// cron.schedule('*/5 * * * *', () => {
//   sendHoldMessages();
// });

// // === ERROR HANDLING ===
// bot.on('polling_error', (error) => {
//   console.error('Polling error:', error.message);
// });

// console.log("🤖 Telegram Crypto Trading Bot चल रहा है...");







require('dotenv').config();
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
const cron = require('node-cron');

// === CONFIG ===
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8003756443:AAHOP678U2KdAiTuVYQZVQ2DsYnT2Oq4PnE'

const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
  'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
  'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
  'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
  'SHIBUSDT'
];

const INTERVAL = '15m';
const TARGET_MULTIPLIER = 1.5;
const STOPLOSS_MULTIPLIER = 1.0;
const VOLUME_SMA_PERIOD = 20;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
let USER_CHAT_IDS = [];
let activeTrades = {}; 

// === FETCH FUNCTIONS ===
async function fetchKlines(symbol, interval, limit = 100) {
  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await axios.get(url);
    return res.data.map(c => ({
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseFloat(c[5]),
      time: c[0]
    }));
  } catch (err) {
    console.error(`Error fetching klines for ${symbol}:`, err.message);
    return null;
  }
}

async function fetchCurrentPrice(symbol) {
  try {
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
    const res = await axios.get(url);
    return parseFloat(res.data.price);
  } catch (err) {
    console.error(`Error fetching current price for ${symbol}:`, err.message);
    return null;
  }
}

// === ANALYSIS WITH VOLUME FILTER ===
function analyzeData(candles) {
  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const volumes = candles.map(c => c.volume);

  const rsi = RSI.calculate({ values: closes, period: 14 });
  const ema = EMA.calculate({ values: closes, period: 14 });
  const macd = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });
  const atr = ATR.calculate({ high: highs, low: lows, close: closes, period: 14 });
  const volumeSMA = SMA.calculate({ values: volumes, period: VOLUME_SMA_PERIOD });

  if (macd.length === 0 || rsi.length === 0 || ema.length === 0 || atr.length === 0 || volumeSMA.length === 0) {
    // अगर कोई indicator खाली है तो null वापस करें
    return null;
  }

  const lastClose = closes.at(-1);
  const lastEma = ema.at(-1);
  const lastMacd = macd.at(-1);
  const lastRsi = rsi.at(-1);
  const lastAtr = atr.at(-1);
  const lastVolume = volumes.at(-1);
  const lastVolumeSMA = volumeSMA.at(-1);

  let signal = 'HOLD';

  const volumeOkay = lastVolume > lastVolumeSMA;

  if (volumeOkay && lastClose > lastEma && lastMacd.MACD > lastMacd.signal) signal = 'BUY';
  else if (volumeOkay && lastClose < lastEma && lastMacd.MACD < lastMacd.signal) signal = 'SELL';

  let target = null, stoploss = null;
  if (signal === 'BUY') {
    target = lastClose + TARGET_MULTIPLIER * lastAtr;
    stoploss = lastClose - STOPLOSS_MULTIPLIER * lastAtr;
  } else if (signal === 'SELL') {
    target = lastClose - TARGET_MULTIPLIER * lastAtr;
    stoploss = lastClose + STOPLOSS_MULTIPLIER * lastAtr;
  }

  return {
    signal, lastClose, lastEma, lastRsi, lastMacd,
    lastAtr, lastVolume, lastVolumeSMA, target, stoploss
  };
}

// === TRADE MANAGEMENT ===
function checkIfHit(price, trade) {
  if (!trade) return false;
  if (trade.signal === 'BUY') {
    if (price >= trade.target) return 'target';
    if (price <= trade.stoploss) return 'stoploss';
  } else if (trade.signal === 'SELL') {
    if (price <= trade.target) return 'target';
    if (price >= trade.stoploss) return 'stoploss';
  }
  return false;
}

// --- 5 मिनट पर HOLD मैसेज अगर कोई एक्टिव ट्रेड नहीं है --- 
async function sendHoldMessages() {
  for (const chatId of USER_CHAT_IDS) {
    const trades = activeTrades[chatId];
    let noActiveTrade = true;
    if (trades && Object.keys(trades).length > 0) {
      noActiveTrade = false;
    }

    if (noActiveTrade) {
      for (const symbol of SYMBOLS) {
        const candles = await fetchKlines(symbol, INTERVAL, 20);
        if (!candles) continue;
        const analysis = analyzeData(candles);
        if (!analysis) continue;

        const msg = `
⚠️ *${symbol}* - कोई नया ट्रेड सिग्नल नहीं मिला। मार्केट स्थिर है। (HOLD)
📈 Price: ${analysis.lastClose.toFixed(2)}
📊 RSI: ${analysis.lastRsi.toFixed(2)}
📉 EMA14: ${analysis.lastEma.toFixed(2)}
📈 MACD: ${analysis.lastMacd.MACD.toFixed(2)}
🟡 Signal Line: ${analysis.lastMacd.signal.toFixed(2)}
        `;
        await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
      }
    }
  }
}

async function sendSignal() {
  try {
    console.log("⏰ Checking signals for all symbols...");

    for (const symbol of SYMBOLS) {
      const candles = await fetchKlines(symbol, INTERVAL);
      const currentPrice = await fetchCurrentPrice(symbol);
      if (!candles || !currentPrice) continue;

      for (const chatId of USER_CHAT_IDS) {
        if (!activeTrades[chatId]) activeTrades[chatId] = {};

        const trade = activeTrades[chatId][symbol];

        if (trade) {
          const hit = checkIfHit(currentPrice, trade);
          if (hit) {
            await bot.sendMessage(chatId, `⚠️ *${symbol}* - *${trade.signal}* trade बंद हुआ (${hit.toUpperCase()}) at ${currentPrice.toFixed(2)}`, { parse_mode: 'Markdown' });
            delete activeTrades[chatId][symbol];
            continue;
          }

          const newSL = trade.signal === 'BUY' ? currentPrice - trade.atr : currentPrice + trade.atr;
          const shouldTrail = (
            (trade.signal === 'BUY' && currentPrice > trade.entry + trade.atr && newSL > trade.stoploss) ||
            (trade.signal === 'SELL' && currentPrice < trade.entry - trade.atr && newSL < trade.stoploss)
          );
          if (shouldTrail) {
            trade.stoploss = newSL;
            await bot.sendMessage(chatId, `🔁 *${symbol}* - Trailing Stoploss अपडेट हुआ!\nNew Stoploss: ${newSL.toFixed(2)}`, { parse_mode: 'Markdown' });
          }
        } else {
          const analysis = analyzeData(candles);
          if (!analysis) continue;

          if (analysis.signal === 'HOLD') {
            const msgHold = `
⚠️ *${symbol}* - ट्रेड सिग्नल नहीं मिला। (HOLD)
📈 Price: ${analysis.lastClose.toFixed(2)}
📊 RSI: ${analysis.lastRsi.toFixed(2)}
📉 EMA14: ${analysis.lastEma.toFixed(2)}
📈 MACD: ${analysis.lastMacd.MACD.toFixed(2)}
🟡 Signal Line: ${analysis.lastMacd.signal.toFixed(2)}
            `;
            await bot.sendMessage(chatId, msgHold, { parse_mode: 'Markdown' });
            continue;
          }

          const msg = `
📡 *Crypto Signal - ${symbol} (${INTERVAL})*
📈 Signal: *${analysis.signal}*
💰 Entry: ${currentPrice.toFixed(2)}
🎯 Target: ${analysis.target.toFixed(2)}
🛑 Stoploss: ${analysis.stoploss.toFixed(2)}

📊 RSI: ${analysis.lastRsi.toFixed(2)}
📉 EMA14: ${analysis.lastEma.toFixed(2)}
📈 MACD: ${analysis.lastMacd.MACD.toFixed(2)}
🟡 Signal Line: ${analysis.lastMacd.signal.toFixed(2)}
📊 Volume: ${analysis.lastVolume.toFixed(0)}
📉 Avg Vol (SMA20): ${analysis.lastVolumeSMA.toFixed(0)}
          `;

          await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

          activeTrades[chatId][symbol] = {
            signal: analysis.signal,
            entry: currentPrice,
            target: analysis.target,
            stoploss: analysis.stoploss,
            atr: analysis.lastAtr
          };
        }
      }
    }
  } catch (err) {
    console.error("🚨 sendSignal error:", err.message);
  }
}

// === TELEGRAM COMMANDS ===
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);
  bot.sendMessage(chatId, "🤖 बॉट चालू हो गया है! हर 15 मिनट में नए सिग्नल मिलेंगे।\n/status <symbol> से किसी भी सिम्बल की स्थिति जानें।");
});

bot.onText(/\/status(?:\s+(\w+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);

  const symbol = match[1] ? match[1].toUpperCase() : null;
  if (!symbol || !SYMBOLS.includes(symbol)) {
    return bot.sendMessage(chatId, `⚠️ कृपया सही सिम्बल दें। उपलब्ध सिम्बल: ${SYMBOLS.join(', ')}`);
  }

  const candles = await fetchKlines(symbol, INTERVAL);
  if (!candles) return bot.sendMessage(chatId, `⚠️ ${symbol} का डेटा प्राप्त नहीं हो पाया।`);

  const analysis = analyzeData(candles);
  if (!analysis) return bot.sendMessage(chatId, `⚠️ ${symbol} का विश्लेषण नहीं कर पाए।`);

  const statusMsg = `
📡 *${symbol}* - Current Status:
📈 Signal: *${analysis.signal}*
💰 Close Price: ${analysis.lastClose.toFixed(2)}
🎯 Target: ${analysis.target ? analysis.target.toFixed(2) : 'N/A'}
🛑 Stoploss: ${analysis.stoploss ? analysis.stoploss.toFixed(2) : 'N/A'}
📊 RSI: ${analysis.lastRsi.toFixed(2)}
📉 EMA14: ${analysis.lastEma.toFixed(2)}
📈 MACD: ${analysis.lastMacd.MACD.toFixed(2)}
🟡 Signal Line: ${analysis.lastMacd.signal.toFixed(2)}
  `;
  bot.sendMessage(chatId, statusMsg, { parse_mode: 'Markdown' });
});

// === CRON JOB ===
// हर 15 मिनट पर ट्रेडिंग सिग्नल भेजो
cron.schedule('*/15 * * * *', () => {
  sendSignal();
});

// हर 5 मिनट पर HOLD मैसेज भेजें अगर कोई active ट्रेड नहीं है
cron.schedule('*/5 * * * *', () => {
  sendHoldMessages();
});

console.log('🤖 Telegram Crypto Signal Bot is running...');
