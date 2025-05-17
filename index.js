



// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR } = require('technicalindicators');

// // Bot initialize
// const bot = new TelegramBot('7739855919:AAF2JCiwZW5bXkLAcrUx6HPCMCcgE8GJ35c', { polling: true });
// const USER_CHAT_ID = parseInt(5918728195
// );

// // Config
// const SYMBOL = 'BTCUSDT';
// const INTERVAL = '5min';
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;

// // Fetch candles from Binance
// async function fetchKlines(symbol, interval, limit = 100) {
//   const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
//   const res = await axios.get(url);
//   return res.data.map(candle => ({
//     open: parseFloat(candle[1]),
//     high: parseFloat(candle[2]),
//     low: parseFloat(candle[3]),
//     close: parseFloat(candle[4]),
//     volume: parseFloat(candle[5]),
//     time: candle[0]
//   }));
// }

// // Analyze indicators
// function analyzeData(candles) {
//   const closes = candles.map(c => c.close);
//   const highs = candles.map(c => c.high);
//   const lows = candles.map(c => c.low);

//   const rsi = RSI.calculate({ values: closes, period: 14 });
//   const ema14 = EMA.calculate({ values: closes, period: 14 });
//   const macd = MACD.calculate({
//     values: closes,
//     fastPeriod: 12,
//     slowPeriod: 26,
//     signalPeriod: 9,
//     SimpleMAOscillator: false,
//     SimpleMASignal: false
//   });
//   const atr = ATR.calculate({ high: highs, low: lows, close: closes, period: 14 });

//   const lastClose = closes[closes.length - 1];
//   const lastEma = ema14[ema14.length - 1];
//   const lastRsi = rsi[rsi.length - 1];
//   const lastMacd = macd[macd.length - 1];
//   const lastAtr = atr[atr.length - 1];

//   let signal = 'HOLD';
//   if (lastClose > lastEma && lastRsi > 50 && lastMacd.MACD > lastMacd.signal) {
//     signal = 'BUY';
//   } else if (lastClose < lastEma && lastRsi < 50 && lastMacd.MACD < lastMacd.signal) {
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
//     target,
//     stoploss
//   };
// }

// // Send to Telegram
// async function sendSignal() {
//   try {
//     const candles = await fetchKlines(SYMBOL, INTERVAL, 100);
//     const analysis = analyzeData(candles);

//     const msg = `
// *Crypto Signal for ${SYMBOL} (${INTERVAL})*
// *Signal:* ${analysis.signal}

// *Close:* ${analysis.lastClose.toFixed(2)}
// *EMA14:* ${analysis.lastEma.toFixed(2)}
// *RSI14:* ${analysis.lastRsi.toFixed(2)}
// *MACD:* ${analysis.lastMacd.MACD.toFixed(4)}
// *Signal Line:* ${analysis.lastMacd.signal.toFixed(4)}
// *ATR14:* ${analysis.lastAtr.toFixed(4)}
// ${analysis.signal !== 'HOLD' ? `\n🎯 *Target:* ${analysis.target.toFixed(2)}\n⛔ *Stoploss:* ${analysis.stoploss.toFixed(2)}` : ''}
//     `;

//     await bot.sendMessage(USER_CHAT_ID, msg, { parse_mode: 'Markdown' });
//   } catch (err) {
//     console.error("❌ Error sending signal:", err.message);
//   }
// }

// // Run immediately and then every 1 hour
// sendSignal();
// setInterval(sendSignal, 5 * 60 * 1000);


// bot.onText(/\/start/, (msg) => {
//   bot.sendMessage(msg.chat.id, "🚀 Crypto Signal Bot is active and watching the markets!");
// });

// console.log("✅ Crypto Signal Bot chalu ho gaya...");








require('dotenv').config();
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const { RSI, EMA, MACD, ATR } = require('technicalindicators');

// Bot initialize
const bot = new TelegramBot('7739855919:AAF2JCiwZW5bXkLAcrUx6HPCMCcgE8GJ35c', { polling: true });
const USER_CHAT_ID = 5918728195; // Number ke form me

// Config
const SYMBOL = 'BTCUSDT';
const INTERVAL = '5m';  // 5 minute candle interval set kiya
const TARGET_MULTIPLIER = 1.5;
const STOPLOSS_MULTIPLIER = 1.0;

// Fetch candles from Binance
async function fetchKlines(symbol, interval, limit = 100) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  try {
    const res = await axios.get(url);
    return res.data.map(candle => ({
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5]),
      time: candle[0]
    }));
  } catch (err) {
    console.error("❌ Binance API error:", err.response ? err.response.data : err.message);
    throw err;
  }
}

// Analyze indicators
function analyzeData(candles) {
  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  const rsi = RSI.calculate({ values: closes, period: 14 });
  const ema14 = EMA.calculate({ values: closes, period: 14 });
  const macd = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });
  const atr = ATR.calculate({ high: highs, low: lows, close: closes, period: 14 });

  const lastClose = closes[closes.length - 1];
  const lastEma = ema14[ema14.length - 1];
  const lastRsi = rsi[rsi.length - 1];
  const lastMacd = macd[macd.length - 1];
  const lastAtr = atr[atr.length - 1];

  let signal = 'HOLD';
  if (lastClose > lastEma && lastRsi > 50 && lastMacd.MACD > lastMacd.signal) {
    signal = 'BUY';
  } else if (lastClose < lastEma && lastRsi < 50 && lastMacd.MACD < lastMacd.signal) {
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
    target,
    stoploss
  };
}

// Send signal to Telegram
async function sendSignal() {
  try {
    const candles = await fetchKlines(SYMBOL, INTERVAL, 100);
    const analysis = analyzeData(candles);

    const msg = `
*Crypto Signal for ${SYMBOL} (${INTERVAL})*
*Signal:* ${analysis.signal}

*Close:* ${analysis.lastClose.toFixed(2)}
*EMA14:* ${analysis.lastEma.toFixed(2)}
*RSI14:* ${analysis.lastRsi.toFixed(2)}
*MACD:* ${analysis.lastMacd.MACD.toFixed(4)}
*Signal Line:* ${analysis.lastMacd.signal.toFixed(4)}
*ATR14:* ${analysis.lastAtr.toFixed(4)}
${analysis.signal !== 'HOLD' ? `\n🎯 *Target:* ${analysis.target.toFixed(2)}\n⛔ *Stoploss:* ${analysis.stoploss.toFixed(2)}` : ''}
    `;

    await bot.sendMessage(USER_CHAT_ID, msg, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error("❌ Error sending signal:", err.message);
  }
}

// Start immediately and repeat every 5 minutes
sendSignal();
setInterval(sendSignal, 5 * 60 * 1000); // 5 minute interval

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🚀 Crypto Signal Bot is active and watching the markets!");
});

console.log("✅ Crypto Signal Bot chalu ho gaya...");
