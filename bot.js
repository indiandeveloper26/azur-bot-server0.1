
// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');

// // === CONFIG ===
// const TELEGRAM_BOT_TOKEN = '7739855919:AAF2JCiwZW5bXkLAcrUx6HPCMCcgE8GJ35c';
// const SYMBOL = 'BTCUSDT';
// const INTERVAL = '5m';
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;
// const VOLUME_SMA_PERIOD = 20;

// if (!TELEGRAM_BOT_TOKEN) {
//   console.error("❌ Error: TELEGRAM_BOT_TOKEN not provided!");
//   process.exit(1);
// }

// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// // === STATE ===
// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { signal, target, stoploss, entry } }

// // === FETCH CANDLES ===
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
//     console.error("❌ Error fetching klines:", err.message);
//     return null;
//   }
// }

// // === FETCH CURRENT PRICE ===
// async function fetchCurrentPrice(symbol) {
//   try {
//     const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
//     const res = await axios.get(url);
//     return parseFloat(res.data.price);
//   } catch (err) {
//     console.error("❌ Error fetching current price:", err.message);
//     return null;
//   }
// }

// // === ANALYZE DATA ===
// function analyzeData(candles) {
//   if (!candles) return null;

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

//   const lastClose = closes[closes.length - 1];
//   const lastEma = ema[ema.length - 1];
//   const lastRsi = rsi[rsi.length - 1];
//   const lastMacd = macd[macd.length - 1];
//   const lastAtr = atr[atr.length - 1];
//   const lastVolume = volumes[volumes.length - 1];
//   const lastVolumeSMA = volumeSMA[volumeSMA.length - 1];

//   let signal = 'HOLD';

//   if (lastClose > lastEma && lastMacd.MACD > lastMacd.signal) {
//     signal = 'BUY';
//   } else if (lastClose < lastEma && lastMacd.MACD < lastMacd.signal) {
//     signal = 'SELL';
//   }

//   let target = null;
//   let stoploss = null;
//   if (signal === 'BUY') {
//     target = lastClose + (TARGET_MULTIPLIER * lastAtr);
//     stoploss = lastClose - (STOPLOSS_MULTIPLIER * lastAtr);
//   } else if (signal === 'SELL') {
//     target = lastClose - (TARGET_MULTIPLIER * lastAtr);
//     stoploss = lastClose + (STOPLOSS_MULTIPLIER * lastAtr);
//   }

//   return {
//     signal,
//     lastClose,
//     lastEma,
//     lastRsi,
//     lastMacd,
//     lastAtr,
//     lastVolume,
//     lastVolumeSMA,
//     target,
//     stoploss
//   };
// }

// // === CHECK IF TARGET/STOPLOSS HIT ===
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

// // === SEND SIGNAL TO USERS ===
// async function sendSignal() {
//   if (USER_CHAT_IDS.length === 0) return;

//   try {
//     const candles = await fetchKlines(SYMBOL, INTERVAL);
//     const currentPrice = await fetchCurrentPrice(SYMBOL);
//     if (!candles || !currentPrice) return;

//     for (const chatId of USER_CHAT_IDS) {
//       const trade = activeTrades[chatId];

//       if (trade) {
//         const hit = checkIfHit(currentPrice, trade);
//         if (hit) {
//           await bot.sendMessage(chatId, `⚠️ *${trade.signal}* trade closed due to *${hit.toUpperCase()}* at price ${currentPrice.toFixed(2)}.`, { parse_mode: 'Markdown' });
//           delete activeTrades[chatId];
//         } else {
//           console.log(`⏳ Waiting for ${chatId}'s trade. Price: ${currentPrice}`);
//           continue;
//         }
//       }

//       if (!activeTrades[chatId]) {
//         const analysis = analyzeData(candles);
//         if (!analysis || analysis.signal === 'HOLD') continue;

//         const msg = `
// *Crypto Signal - ${SYMBOL} (${INTERVAL})*
// 📈 *Signal:* ${analysis.signal}
// 💰 *Entry:* ${currentPrice.toFixed(2)}

// 🎯 *Target:* ${analysis.target.toFixed(2)}
// 🛑 *Stoploss:* ${analysis.stoploss.toFixed(2)}

// 📊 *RSI:* ${analysis.lastRsi.toFixed(2)}
// 📉 *EMA14:* ${analysis.lastEma.toFixed(2)}
// 📈 *MACD:* ${analysis.lastMacd.MACD.toFixed(2)}
// 🟡 *Signal Line:* ${analysis.lastMacd.signal.toFixed(2)}
// 📊 *Volume:* ${analysis.lastVolume.toFixed(0)}
// 📉 *Avg Volume (SMA20):* ${analysis.lastVolumeSMA.toFixed(0)}
//         `;

//         await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

//         activeTrades[chatId] = {
//           signal: analysis.signal,
//           entry: currentPrice,
//           target: analysis.target,
//           stoploss: analysis.stoploss
//         };

//         console.log(`✅ Signal sent to ${chatId}: ${analysis.signal}`);
//       }
//     }
//   } catch (err) {
//     console.error("❌ Error in sendSignal:", err.message);
//   }
// }

// // === TELEGRAM COMMAND HANDLERS ===
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) {
//     USER_CHAT_IDS.push(chatId);
//     console.log(`✅ New user added: ${chatId}`);
//   }
//   bot.sendMessage(chatId, "🤖 Crypto Signal Bot चालू है! हर 5 मिनट में सिग्नल मिलेगा।\n/status टाइप करके अपना एक्टिव ट्रेड देख सकते हो।");
// });

// bot.onText(/\/status/, async (msg) => {
//   const chatId = msg.chat.id;
//   const trade = activeTrades[chatId];

//   if (!trade) {
//     bot.sendMessage(chatId, "ℹ️ इस समय कोई एक्टिव ट्रेड नहीं है।");
//     return;
//   }

//   const currentPrice = await fetchCurrentPrice(SYMBOL);

//   const statusMsg = `
// 📍 *Active Trade Status*
// 🔄 *Type:* ${trade.signal}
// 💰 *Entry:* ${trade.entry.toFixed(2)}
// 📈 *Current:* ${currentPrice.toFixed(2)}

// 🎯 *Target:* ${trade.target.toFixed(2)}
// 🛑 *Stoploss:* ${trade.stoploss.toFixed(2)}
//   `;
//   bot.sendMessage(chatId, statusMsg, { parse_mode: 'Markdown' });
// });

// // === START LOOP ===
// console.log("🚀 Crypto Signal Bot started...");
// sendSignal(); // Initial call
// setInterval(sendSignal, 5 * 60 * 1000); // Every 5 minutes




require('dotenv').config();
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');

// === CONFIG ===
const TELEGRAM_BOT_TOKEN ='7739855919:AAF2JCiwZW5bXkLAcrUx6HPCMCcgE8GJ35c' // <- Replace this with your actual token
const SYMBOL = 'BTCUSDT';
const INTERVAL = '5m';
const TARGET_MULTIPLIER = 1.5;
const STOPLOSS_MULTIPLIER = 1.0;
const VOLUME_SMA_PERIOD = 20;

if (!TELEGRAM_BOT_TOKEN) {
  console.error("❌ Error: TELEGRAM_BOT_TOKEN not provided!");
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// === STATE ===
let USER_CHAT_IDS = [];
let activeTrades = {}; // { chatId: { signal, target, stoploss, entry } }

// === FETCH CANDLES ===
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
    console.error("❌ Error fetching klines:", err.message);
    return null;
  }
}

// === FETCH CURRENT PRICE ===
async function fetchCurrentPrice(symbol) {
  try {
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
    const res = await axios.get(url);
    return parseFloat(res.data.price);
  } catch (err) {
    console.error("❌ Error fetching current price:", err.message);
    return null;
  }
}

// === ANALYZE DATA ===
function analyzeData(candles) {
  if (!candles) return null;

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

  const lastClose = closes[closes.length - 1];
  const lastEma = ema[ema.length - 1];
  const lastRsi = rsi[rsi.length - 1];
  const lastMacd = macd[macd.length - 1];
  const lastAtr = atr[atr.length - 1];
  const lastVolume = volumes[volumes.length - 1];
  const lastVolumeSMA = volumeSMA[volumeSMA.length - 1];

  let signal = 'HOLD';

  if (lastClose > lastEma && lastMacd.MACD > lastMacd.signal) {
    signal = 'BUY';
  } else if (lastClose < lastEma && lastMacd.MACD < lastMacd.signal) {
    signal = 'SELL';
  }

  let target = null;
  let stoploss = null;
  if (signal === 'BUY') {
    target = lastClose + (TARGET_MULTIPLIER * lastAtr);
    stoploss = lastClose - (STOPLOSS_MULTIPLIER * lastAtr);
  } else if (signal === 'SELL') {
    target = lastClose - (TARGET_MULTIPLIER * lastAtr);
    stoploss = lastClose + (STOPLOSS_MULTIPLIER * lastAtr);
  }

  return {
    signal,
    lastClose,
    lastEma,
    lastRsi,
    lastMacd,
    lastAtr,
    lastVolume,
    lastVolumeSMA,
    target,
    stoploss
  };
}

// === CHECK IF TARGET/STOPLOSS HIT ===
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

// === SEND SIGNAL TO USERS ===
async function sendSignal() {
  if (USER_CHAT_IDS.length === 0) return;

  try {
    const candles = await fetchKlines(SYMBOL, INTERVAL);
    const currentPrice = await fetchCurrentPrice(SYMBOL);
    if (!candles || !currentPrice) return;

    for (const chatId of USER_CHAT_IDS) {
      const trade = activeTrades[chatId];

      if (trade) {
        const hit = checkIfHit(currentPrice, trade);
        if (hit) {
          await bot.sendMessage(chatId, `⚠️ *${trade.signal}* trade closed due to *${hit.toUpperCase()}* at price ${currentPrice.toFixed(2)}.`, { parse_mode: 'Markdown' });
          delete activeTrades[chatId];
        } else {
          continue;
        }
      }

      if (!activeTrades[chatId]) {
        const analysis = analyzeData(candles);
        if (!analysis) continue;

        const msg = `
*Crypto Signal - ${SYMBOL} (${INTERVAL})*
📈 *Signal:* ${analysis.signal}
💰 *Price:* ${currentPrice.toFixed(2)}

📊 *RSI:* ${analysis.lastRsi.toFixed(2)}
📉 *EMA14:* ${analysis.lastEma.toFixed(2)}
📈 *MACD:* ${analysis.lastMacd.MACD.toFixed(2)}
🟡 *Signal Line:* ${analysis.lastMacd.signal.toFixed(2)}
📊 *Volume:* ${analysis.lastVolume.toFixed(0)}
📉 *Avg Volume (SMA20):* ${analysis.lastVolumeSMA.toFixed(0)}
        `;

        await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

        if (analysis.signal !== 'HOLD') {
          activeTrades[chatId] = {
            signal: analysis.signal,
            entry: currentPrice,
            target: analysis.target,
            stoploss: analysis.stoploss
          };
        }
      }
    }
  } catch (err) {
    console.error("❌ Error in sendSignal:", err.message);
  }
}

// === TELEGRAM COMMAND HANDLERS ===
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (!USER_CHAT_IDS.includes(chatId)) {
    USER_CHAT_IDS.push(chatId);
    console.log(`✅ New user added: ${chatId}`);
  }
  bot.sendMessage(chatId, "🤖 Crypto Signal Bot चालू है! हर 5 मिनट में सिग्नल मिलेगा।\n/status टाइप करके अपना एक्टिव ट्रेड देख सकते हो।");
});

bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const trade = activeTrades[chatId];

  if (!trade) {
    bot.sendMessage(chatId, "ℹ️ इस समय कोई एक्टिव ट्रेड नहीं है।");
    return;
  }

  const currentPrice = await fetchCurrentPrice(SYMBOL);

  const statusMsg = `
📍 *Active Trade Status*
🔄 *Type:* ${trade.signal}
💰 *Entry:* ${trade.entry.toFixed(2)}
📈 *Current:* ${currentPrice.toFixed(2)}

🎯 *Target:* ${trade.target.toFixed(2)}
🛑 *Stoploss:* ${trade.stoploss.toFixed(2)}
  `;
  bot.sendMessage(chatId, statusMsg, { parse_mode: 'Markdown' });
});

// === START LOOP ===
console.log("🚀 Crypto Signal Bot started...");
sendSignal(); // Initial call
setInterval(sendSignal, 5 * 60 * 1000); // Every 5 minutes
