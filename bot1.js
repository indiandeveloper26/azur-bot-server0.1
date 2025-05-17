// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');

// // === CONFIG ===
// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN_HERE';
// const SYMBOL = 'BTCUSDT';
// const INTERVAL = '15m';
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;
// const VOLUME_SMA_PERIOD = 20;

// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { signal, entry, target, stoploss, atr } }

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
//     console.error("Error fetching klines:", err.message);
//     return null;
//   }
// }

// async function fetchCurrentPrice(symbol) {
//   try {
//     const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
//     const res = await axios.get(url);
//     return parseFloat(res.data.price);
//   } catch (err) {
//     console.error("Error fetching current price:", err.message);
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

//   // === Volume confirmation with MACD and EMA ===
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

// async function sendSignal() {
//   try {
//     console.log("⏰ Checking signal...");
//     const candles = await fetchKlines(SYMBOL, INTERVAL);
//     const currentPrice = await fetchCurrentPrice(SYMBOL);
//     if (!candles || !currentPrice) return;

//     for (const chatId of USER_CHAT_IDS) {
//       const trade = activeTrades[chatId];

//       if (trade) {
//         const hit = checkIfHit(currentPrice, trade);
//         if (hit) {
//           await bot.sendMessage(chatId, `⚠️ *${trade.signal}* trade closed due to *${hit.toUpperCase()}* at ${currentPrice.toFixed(2)}`, { parse_mode: 'Markdown' });
//           delete activeTrades[chatId];
//           continue;
//         }

//         // Trailing Stoploss
//         const newSL = trade.signal === 'BUY' ? currentPrice - trade.atr : currentPrice + trade.atr;
//         const shouldTrail = (
//           (trade.signal === 'BUY' && currentPrice > trade.entry + trade.atr && newSL > trade.stoploss) ||
//           (trade.signal === 'SELL' && currentPrice < trade.entry - trade.atr && newSL < trade.stoploss)
//         );
//         if (shouldTrail) {
//           trade.stoploss = newSL;
//           await bot.sendMessage(chatId, `🔁 *Trailing Stoploss Updated!*\nNew Stoploss: ${newSL.toFixed(2)}`, { parse_mode: 'Markdown' });
//         }

//       } else {
//         const analysis = analyzeData(candles);
//         if (!analysis) continue;

//         if (analysis.signal === 'HOLD') {
//           await bot.sendMessage(chatId, `⚠️ कोई नया ट्रेड सिग्नल नहीं मिला। मार्केट स्थिर है। (HOLD)\n\n📈 Price: ${currentPrice.toFixed(2)}\n📊 RSI: ${analysis.lastRsi.toFixed(2)}\n📉 EMA14: ${analysis.lastEma.toFixed(2)}\n📈 MACD: ${analysis.lastMacd.MACD.toFixed(2)}\n🟡 Signal Line: ${analysis.lastMacd.signal.toFixed(2)}`);
//           continue;
//         }

//         const msg = `
// 📡 *Crypto Signal - ${SYMBOL} (${INTERVAL})*
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
//         `;

//         await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

//         activeTrades[chatId] = {
//           signal: analysis.signal,
//           entry: currentPrice,
//           target: analysis.target,
//           stoploss: analysis.stoploss,
//           atr: analysis.lastAtr
//         };
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
//   bot.sendMessage(chatId, "🤖 बॉट चालू हो गया है! हर 15 मिनट में नया सिग्नल मिलेगा।\n/status से स्थिति जानें।");
// });

// bot.onText(/\/status/, async (msg) => {
//   const chatId = msg.chat.id;
//   const trade = activeTrades[chatId];
//   if (!trade) return bot.sendMessage(chatId, "ℹ️ कोई एक्टिव ट्रेड नहीं है।");

//   const currentPrice = await fetchCurrentPrice(SYMBOL);
//   const msgText = `
// 📍 Active Trade
// 🔄 Type: ${trade.signal}
// 💰 Entry: ${trade.entry.toFixed(2)}
// 📈 Now: ${currentPrice.toFixed(2)}
// 🎯 Target: ${trade.target.toFixed(2)}
// 🛑 Stoploss: ${trade.stoploss.toFixed(2)}
//   `;
//   bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
// });

// // === RUN LOOP ===
// console.log("🚀 Bot started on 15m chart with trailing stoploss and volume filter...");
// sendSignal();
// setInterval(sendSignal, 15 * 60 * 1000);








require('dotenv').config();
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
const http = require('http'); // ✅ Dummy HTTP server for Render

// === CONFIG ===
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7739855919:AAF2JCiwZW5bXkLAcrUx6HPCMCcgE8GJ35c'
const SYMBOL = 'BTCUSDT';
const INTERVAL = '15m';
const TARGET_MULTIPLIER = 1.5;
const STOPLOSS_MULTIPLIER = 1.0;
const VOLUME_SMA_PERIOD = 20;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
let USER_CHAT_IDS = [];
let activeTrades = {}; // { chatId: { signal, entry, target, stoploss, atr } }

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
    console.error("Error fetching klines:", err.message);
    return null;
  }
}

async function fetchCurrentPrice(symbol) {
  try {
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
    const res = await axios.get(url);
    return parseFloat(res.data.price);
  } catch (err) {
    console.error("Error fetching current price:", err.message);
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

  const lastClose = closes.at(-1);
  const lastEma = ema.at(-1);
  const lastMacd = macd.at(-1);
  const lastRsi = rsi.at(-1);
  const lastAtr = atr.at(-1);
  const lastVolume = volumes.at(-1);
  const lastVolumeSMA = volumeSMA.at(-1);

  let signal = 'HOLD';

  // === Volume confirmation with MACD and EMA ===
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

async function sendSignal() {
  try {
    console.log("⏰ Checking signal...");
    const candles = await fetchKlines(SYMBOL, INTERVAL);
    const currentPrice = await fetchCurrentPrice(SYMBOL);
    if (!candles || !currentPrice) return;

    for (const chatId of USER_CHAT_IDS) {
      const trade = activeTrades[chatId];

      if (trade) {
        const hit = checkIfHit(currentPrice, trade);
        if (hit) {
          await bot.sendMessage(chatId, `⚠️ *${trade.signal}* trade closed due to *${hit.toUpperCase()}* at ${currentPrice.toFixed(2)}`, { parse_mode: 'Markdown' });
          delete activeTrades[chatId];
          continue;
        }

        // Trailing Stoploss
        const newSL = trade.signal === 'BUY' ? currentPrice - trade.atr : currentPrice + trade.atr;
        const shouldTrail = (
          (trade.signal === 'BUY' && currentPrice > trade.entry + trade.atr && newSL > trade.stoploss) ||
          (trade.signal === 'SELL' && currentPrice < trade.entry - trade.atr && newSL < trade.stoploss)
        );
        if (shouldTrail) {
          trade.stoploss = newSL;
          await bot.sendMessage(chatId, `🔁 *Trailing Stoploss Updated!*\nNew Stoploss: ${newSL.toFixed(2)}`, { parse_mode: 'Markdown' });
        }

      } else {
        const analysis = analyzeData(candles);
        if (!analysis) continue;

        if (analysis.signal === 'HOLD') {
          await bot.sendMessage(chatId, `⚠️ कोई नया ट्रेड सिग्नल नहीं मिला। मार्केट स्थिर है। (HOLD)\n\n📈 Price: ${currentPrice.toFixed(2)}\n📊 RSI: ${analysis.lastRsi.toFixed(2)}\n📉 EMA14: ${analysis.lastEma.toFixed(2)}\n📈 MACD: ${analysis.lastMacd.MACD.toFixed(2)}\n🟡 Signal Line: ${analysis.lastMacd.signal.toFixed(2)}`);
          continue;
        }

        const msg = `
📡 *Crypto Signal - ${SYMBOL} (${INTERVAL})*
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

        activeTrades[chatId] = {
          signal: analysis.signal,
          entry: currentPrice,
          target: analysis.target,
          stoploss: analysis.stoploss,
          atr: analysis.lastAtr
        };
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
  bot.sendMessage(chatId, "🤖 बॉट चालू हो गया है! हर 15 मिनट में नया सिग्नल मिलेगा।\n/status से स्थिति जानें।");
});

bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const trade = activeTrades[chatId];
  if (!trade) return bot.sendMessage(chatId, "ℹ️ कोई एक्टिव ट्रेड नहीं है।");

  const currentPrice = await fetchCurrentPrice(SYMBOL);
  const msgText = `
📍 Active Trade
🔄 Type: ${trade.signal}
💰 Entry: ${trade.entry.toFixed(2)}
📈 Now: ${currentPrice.toFixed(2)}
🎯 Target: ${trade.target.toFixed(2)}
🛑 Stoploss: ${trade.stoploss.toFixed(2)}
  `;
  bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
});

// === RUN LOOP ===
console.log("🚀 Bot started on 15m chart with trailing stoploss and volume filter...");
sendSignal();
setInterval(sendSignal, 15 * 60 * 1000);

// === ✅ Dummy HTTP server for Render ===
const PORT = process.env.PORT || 5000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("Bot is running.");
}).listen(PORT, () => {
  console.log(`🌐 Dummy HTTP server running on port ${PORT}`);
});
