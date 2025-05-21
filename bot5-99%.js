// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// const cron = require('node-cron');

// const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';

// const SYMBOLS = [
//   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
//   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
//   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
//   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
//   'SHIBUSDT'
// ];

// const INTERVAL_15M = '15m';
// const INTERVAL_1H = '1h';
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;
// const VOLUME_SMA_PERIOD = 20;
// const EMA_1H_PERIOD = 200;

// const bot = new TelegramBot('8003756443:AAHOP678U2KdAiTuVYQZVQ2DsYnT2Oq4PnE', { polling: true });

// let USER_CHAT_IDS = [];
// let activeTrades = {};
// let userTradeLock = {}; // { chatId: { symbol, trade } }

// function hasActiveTrade(chatId) {
//   return userTradeLock[chatId] !== undefined;
// }

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
//     console.error(`Error fetching klines for ${symbol} (${interval}):`, err.message);
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

// function analyzeData15m(candles) {
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

//   if (macd.length === 0 || rsi.length === 0 || ema.length === 0 || atr.length === 0 || volumeSMA.length === 0) {
//     return null;
//   }

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

//   return {
//     signal, lastClose, lastEma, lastRsi, lastMacd,
//     lastAtr, lastVolume, lastVolumeSMA
//   };
// }

// function analyzeData1h(candles) {
//   const closes = candles.map(c => c.close);
//   if (closes.length < EMA_1H_PERIOD) return null;
//   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
//   if (ema200.length === 0) return null;
//   return ema200.at(-1);
// }

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

// let symbolIndex = 0;

// async function checkNextSymbol() {
//   const symbol = SYMBOLS[symbolIndex];
//   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

//   for (const chatId of USER_CHAT_IDS) {
//     if (hasActiveTrade(chatId)) continue;

//     const candles15m = await fetchKlines(symbol, INTERVAL_15M);
//     const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
//     const currentPrice = await fetchCurrentPrice(symbol);

//     if (!candles15m || !candles1h || !currentPrice) return;

//     const analysis15m = analyzeData15m(candles15m);
//     if (!analysis15m) return;

//     const ema200_1h = analyzeData1h(candles1h);
//     if (!ema200_1h) return;

//     let finalSignal = 'HOLD';
//     if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
//     else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

//     if (!activeTrades[chatId]) activeTrades[chatId] = {};

//     // HOLD signal
//     // if (finalSignal === 'HOLD') {
//     //   await bot.sendMessage(chatId,
//     //     `📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})\n⚪ Signal: HOLD\n💰 Current Price: ${currentPrice.toFixed(2)}\nकोई strong signal नहीं मिला।`);
//     //   continue;
//     // }

//     if (finalSignal === 'HOLD') {
//   await bot.sendMessage(chatId,
//     `📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})\n⚪ Signal: HOLD\n💰 Current Price: ${currentPrice.toFixed(2)}\nNo strong signal found.`);
//   continue;
// }


//     if (activeTrades[chatId][symbol]) continue;

//     let target, stoploss;
//     if (finalSignal === 'BUY') {
//       target = analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr;
//       stoploss = analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
//     } else {
//       target = analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;
//       stoploss = analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
//     }

//     const msg = `
// 📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})
// 📈 Signal: ${finalSignal}
// 💰 Entry: ${currentPrice.toFixed(2)}
// 🎯 Target: ${target.toFixed(2)}
// 🛑 Stoploss: ${stoploss.toFixed(2)}

// 📊 RSI (15m): ${analysis15m.lastRsi.toFixed(2)}
// 📉 EMA14 (15m): ${analysis15m.lastEma.toFixed(2)}
// 📈 MACD (15m): ${analysis15m.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line: ${analysis15m.lastMacd.signal.toFixed(2)}
// 📊 Volume: ${analysis15m.lastVolume.toFixed(0)}
// 📉 Avg Vol SMA20: ${analysis15m.lastVolumeSMA.toFixed(0)}
// 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
//     `;

//     await bot.sendMessage(chatId, msg);

//     activeTrades[chatId][symbol] = {
//       signal: finalSignal,
//       entry: currentPrice,
//       target,
//       stoploss,
//       atr: analysis15m.lastAtr
//     };

//     userTradeLock[chatId] = { symbol, trade: activeTrades[chatId][symbol] };

//     break;
//   }
// }

// async function monitorTrades() {
//   for (const chatId of USER_CHAT_IDS) {
//     const trades = activeTrades[chatId];
//     if (!trades) continue;

//     for (const symbol in trades) {
//       const currentPrice = await fetchCurrentPrice(symbol);
//       if (!currentPrice) continue;

//       const trade = trades[symbol];
//       const hit = checkIfHit(currentPrice, trade);
//       if (hit) {
//         const msg = hit === 'target'
//           ? `✅ Target hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent: ${currentPrice.toFixed(2)}`
//           : `⚠️ Stoploss hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent: ${currentPrice.toFixed(2)}`;

//         await bot.sendMessage(chatId, msg);
//         delete activeTrades[chatId][symbol];
//         delete userTradeLock[chatId];
//       }
//     }
//   }
// }

// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) {
//     USER_CHAT_IDS.push(chatId);
//     activeTrades[chatId] = {};
//   }
//   // bot.sendMessage(chatId, "✅ बॉट चालू हो गया है। हर 1 मिनट में आपको सिग्नल मिलेंगे (अगर बनें तो)।");
//   bot.sendMessage(chatId, "✅ Bot has started. You will receive signals every 1 minute (if any are generated).");

// });

// bot.onText(/\/stop/, (msg) => {
//   const chatId = msg.chat.id;
//   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
//   delete activeTrades[chatId];
//   delete userTradeLock[chatId];
//   bot.sendMessage(chatId, "🛑 बॉट बंद कर दिया गया है।");
// });

// cron.schedule('*/1 * * * *', async () => {
//   try {
//     await checkNextSymbol();
//     await monitorTrades();
//   } catch (err) {
//     console.error('Error in cron task:', err.message);
//   }
// });








require('dotenv').config();
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
const cron = require('node-cron');

const TELEGRAM_BOT_TOKEN = '8003756443:AAHOP678U2KdAiTuVYQZVQ2DsYnT2Oq4PnE' // 🔁 Replace with your bot token

const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
  'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
  'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
  'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
  'SHIBUSDT'
];

const INTERVAL_15M = '15m';
const INTERVAL_1H = '1h';
const TARGET_MULTIPLIER = 1.5;
const STOPLOSS_MULTIPLIER = 1.0;
const VOLUME_SMA_PERIOD = 20;
const EMA_1H_PERIOD = 200;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

let USER_CHAT_IDS = [];
let activeTrades = {};
let userTradeLock = {};

function hasActiveTrade(chatId) {
  return userTradeLock[chatId] !== undefined;
}

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

function analyzeData15m(candles) {
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

  if (!rsi.length || !ema.length || !macd.length || !atr.length || !volumeSMA.length) return null;

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

  return { signal, lastClose, lastEma, lastRsi, lastMacd, lastAtr, lastVolume, lastVolumeSMA };
}

function analyzeData1h(candles) {
  const closes = candles.map(c => c.close);
  if (closes.length < EMA_1H_PERIOD) return null;
  const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
  return ema200.at(-1);
}

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

let symbolIndex = 0;

async function checkNextSymbol() {
  const symbol = SYMBOLS[symbolIndex];
  symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

  for (const chatId of USER_CHAT_IDS) {
    if (hasActiveTrade(chatId)) continue;

    const candles15m = await fetchKlines(symbol, INTERVAL_15M);
    const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
    const currentPrice = await fetchCurrentPrice(symbol);

    if (!candles15m || !candles1h || !currentPrice) continue;

    const analysis15m = analyzeData15m(candles15m);
    const ema200_1h = analyzeData1h(candles1h);

    if (!analysis15m || !ema200_1h) continue;

    let finalSignal = 'HOLD';
    if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
    else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

    if (!activeTrades[chatId]) activeTrades[chatId] = {};
    if (finalSignal === 'HOLD') continue;
    if (activeTrades[chatId][symbol]) continue;

    let target, stoploss;
    if (finalSignal === 'BUY') {
      target = analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr;
      stoploss = analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
    } else {
      target = analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;
      stoploss = analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
    }

    const msg = `
📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})
📈 Signal: ${finalSignal}
💰 Entry: ${currentPrice.toFixed(2)}
🎯 Target: ${target.toFixed(2)}
🛑 Stoploss: ${stoploss.toFixed(2)}

📊 RSI (15m): ${analysis15m.lastRsi.toFixed(2)}
📉 EMA14 (15m): ${analysis15m.lastEma.toFixed(2)}
📈 MACD (15m): ${analysis15m.lastMacd.MACD.toFixed(2)}
🟡 Signal Line: ${analysis15m.lastMacd.signal.toFixed(2)}
📊 Volume: ${analysis15m.lastVolume.toFixed(0)}
📉 Avg Vol SMA20: ${analysis15m.lastVolumeSMA.toFixed(0)}
📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
    `;

    await bot.sendMessage(chatId, msg);

    activeTrades[chatId][symbol] = {
      signal: finalSignal,
      entry: currentPrice,
      target,
      stoploss,
      atr: analysis15m.lastAtr
    };

    userTradeLock[chatId] = { symbol, trade: activeTrades[chatId][symbol] };
    break;
  }
}

async function monitorTrades() {
  for (const chatId of USER_CHAT_IDS) {
    const trades = activeTrades[chatId];
    if (!trades) continue;

    for (const symbol in trades) {
      const currentPrice = await fetchCurrentPrice(symbol);
      if (!currentPrice) continue;

      const trade = trades[symbol];
      const hit = checkIfHit(currentPrice, trade);
      if (hit) {
        const msg = hit === 'target'
          ? `✅ Target hit for ${symbol}!\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nCurrent: ${currentPrice.toFixed(2)}`
          : `⚠️ Stoploss hit for ${symbol}!\nEntry: ${trade.entry.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent: ${currentPrice.toFixed(2)}`;
        await bot.sendMessage(chatId, msg);
        delete activeTrades[chatId][symbol];
        delete userTradeLock[chatId];
      }
    }
  }
}

// ✅ Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (!USER_CHAT_IDS.includes(chatId)) {
    USER_CHAT_IDS.push(chatId);
    activeTrades[chatId] = {};
  }

  bot.sendMessage(chatId, "✅ Bot has started. You will receive signals every minute (if any).");
});

// 🛑 Stop command
bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
  delete activeTrades[chatId];
  delete userTradeLock[chatId];
  bot.sendMessage(chatId, "🛑 Bot has been stopped.");
});

// 🎛️ Start Button UI
bot.onText(/\/menu/, (msg) => {
  bot.sendMessage(msg.chat.id, "👇 Click the button to start the bot", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🚀 Start Bot", callback_data: "start_bot" }]
      ]
    }
  });
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  if (query.data === 'start_bot') {
    bot.sendMessage(chatId, "You clicked start! Bot is starting...");
    bot.emit('text', { chat: { id: chatId }, text: '/start' }); // triggers /start command
  }
});

// 🕐 Scheduler every 1 minute
cron.schedule('*/1 * * * *', async () => {
  try {
    await checkNextSymbol();
    await monitorTrades();
  } catch (err) {
    console.error('Scheduler error:', err.message);
  }
});
