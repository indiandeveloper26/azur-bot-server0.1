// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, SMA, MACD } = require('technicalindicators');

// // Setu
// const bot = new TelegramBot(process.env.'7739855919:AAF2JCiwZW5bXkLAcrUx6HPCMCcgE8GJ35c', { polling: true });
// const SYMBOLS = ['ETHUSDT']; // You can add BTCUSDT, etc.
// const USERS = [];
// const INTERVAL_SHORT = '1m';
// const INTERVAL_LONG = '1h';

// bot.onText(/\/start/, msg => {
//   const chatId = msg.chat.id;
//   if (!USERS.includes(chatId)) USERS.push(chatId);
//   bot.sendMessage(chatId, '✅ Crypto Signal Bot Activated');
// });

// // Fetch candles
// async function fetchCandles(symbol, interval, limit = 100) {
//   const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
//   const res = await axios.get(url);
//   return res.data.map(c => ({
//     open: parseFloat(c[1]),
//     high: parseFloat(c[2]),
//     low: parseFloat(c[3]),
//     close: parseFloat(c[4]),
//     volume: parseFloat(c[5]),
//     time: c[0],
//   }));
// }

// // Analyze & Signal
// async function analyzeSymbol(symbol) {
//   try {
//     const candles1m = await fetchCandles(symbol, INTERVAL_SHORT, 100);
//     const candles1h = await fetchCandles(symbol, INTERVAL_LONG, 200);

//     const closes1m = candles1m.map(c => c.close);
//     const volumes1m = candles1m.map(c => c.volume);
//     const closes1h = candles1h.map(c => c.close);

//     const rsi1m = RSI.calculate({ values: closes1m, period: 14 }).at(-1);
//     const ema14_1m = EMA.calculate({ values: closes1m, period: 14 }).at(-1);
//     const ema200_1h = EMA.calculate({ values: closes1h, period: 200 }).at(-1);
//     const macd = MACD.calculate({
//       values: closes1m,
//       fastPeriod: 12,
//       slowPeriod: 26,
//       signalPeriod: 9,
//       SimpleMAOscillator: false,
//       SimpleMASignal: false,
//     }).at(-1);

//     const volumeNow = volumes1m.at(-1);
//     const volumeSMA = SMA.calculate({ values: volumes1m, period: 20 }).at(-1);
//     const currentPrice = closes1m.at(-1);

//     // Signal Logic
//     const isBuy = rsi1m > 50 && currentPrice > ema14_1m && macd.MACD > macd.signal;
//     const isSell = rsi1m < 50 && currentPrice < ema14_1m && macd.MACD < macd.signal;
//     const signal = isBuy ? 'BUY' : isSell ? 'SELL' : 'HOLD';

//     const target = +(currentPrice * 1.0035).toFixed(2); // +0.35%
//     const stoploss = +(currentPrice * 0.9985).toFixed(2); // -0.15%

//     if (signal !== 'HOLD') {
//       const msg = 
// `*Crypto Signal - ${symbol} (1m + 1h)*

// 📈 Signal: *${signal}*
// 💰 Entry: *${currentPrice.toFixed(2)}*
// 🎯 Target: *${target}*
// 🛑 Stoploss: *${stoploss}*

// 📊 RSI (1m): *${rsi1m.toFixed(2)}*
// 📉 EMA14 (1m): *${ema14_1m.toFixed(2)}*
// 📈 MACD (1m): *${macd.MACD.toFixed(2)}*
// 🟡 Signal Line: *${macd.signal.toFixed(2)}*
// 📊 Volume: *${volumeNow.toFixed(0)}*
// 📉 Avg Vol SMA20: *${volumeSMA.toFixed(0)}*
// 📉 EMA200 (1h): *${ema200_1h.toFixed(2)}*`;

//       for (let chatId of USERS) {
//         await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
//         console.log(`✅ Sent signal to ${chatId}`);
//       }
//     } else {
//       console.log(`${symbol}: No signal`);
//     }
//   } catch (err) {
//     console.error(`❌ Error analyzing ${symbol}:`, err.message);
//   }
// }

// // Run scan every 5 min
// setInterval(() => {
//   SYMBOLS.forEach(symbol => analyzeSymbol(symbol));
// }, 5 * 60 * 1000);















// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, SMA, MACD } = require('technicalindicators');

// // Setup
// const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
// const SYMBOLS = ['ETHUSDT'];
// const USERS = [];
// const INTERVAL_SHORT = '1m';
// const INTERVAL_LONG = '1h';

// bot.onText(/\/start/, msg => {
//   const chatId = msg.chat.id;
//   if (!USERS.includes(chatId)) USERS.push(chatId);
//   bot.sendMessage(chatId, '✅ Crypto Signal Bot Activated');
// });

// // Inline button handler
// bot.on('callback_query', query => {
//   const chatId = query.message.chat.id;
//   const messageId = query.message.message_id;

//   if (query.data === 'active_trade_status') {
//     bot.answerCallbackQuery(query.id);
//     bot.sendMessage(chatId, '📡 Active Trade Status: *Trade Active/Monitoring*', { parse_mode: 'Markdown' });
//   }
// });

// // Fetch candles
// async function fetchCandles(symbol, interval, limit = 100) {
//   const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
//   const res = await axios.get(url);
//   return res.data.map(c => ({
//     open: parseFloat(c[1]),
//     high: parseFloat(c[2]),
//     low: parseFloat(c[3]),
//     close: parseFloat(c[4]),
//     volume: parseFloat(c[5]),
//     time: c[0],
//   }));
// }

// // Analyze & Signal
// async function analyzeSymbol(symbol) {
//   try {
//     const candles1m = await fetchCandles(symbol, INTERVAL_SHORT, 100);
//     const candles1h = await fetchCandles(symbol, INTERVAL_LONG, 200);

//     const closes1m = candles1m.map(c => c.close);
//     const volumes1m = candles1m.map(c => c.volume);
//     const closes1h = candles1h.map(c => c.close);

//     const rsi1m = RSI.calculate({ values: closes1m, period: 14 }).at(-1);
//     const ema14_1m = EMA.calculate({ values: closes1m, period: 14 }).at(-1);
//     const ema200_1h = EMA.calculate({ values: closes1h, period: 200 }).at(-1);
//     const macd = MACD.calculate({
//       values: closes1m,
//       fastPeriod: 12,
//       slowPeriod: 26,
//       signalPeriod: 9,
//       SimpleMAOscillator: false,
//       SimpleMASignal: false,
//     }).at(-1);

//     const volumeNow = volumes1m.at(-1);
//     const volumeSMA = SMA.calculate({ values: volumes1m, period: 20 }).at(-1);
//     const currentPrice = closes1m.at(-1);

//     const isBuy = rsi1m > 50 && currentPrice > ema14_1m && macd.MACD > macd.signal;
//     const isSell = rsi1m < 50 && currentPrice < ema14_1m && macd.MACD < macd.signal;
//     const signal = isBuy ? 'BUY' : isSell ? 'SELL' : 'HOLD';

//     const target = +(currentPrice * 1.0035).toFixed(2);
//     const stoploss = +(currentPrice * 0.9985).toFixed(2);

//     if (signal !== 'HOLD') {
//       const msg = 
// `*Crypto Signal - ${symbol} (1m + 1h)*

// 📈 Signal: *${signal}*
// 💰 Entry: *${currentPrice.toFixed(2)}*
// 🎯 Target: *${target}*
// 🛑 Stoploss: *${stoploss}*

// 📊 RSI (1m): *${rsi1m.toFixed(2)}*
// 📉 EMA14 (1m): *${ema14_1m.toFixed(2)}*
// 📈 MACD (1m): *${macd.MACD.toFixed(2)}*
// 🟡 Signal Line: *${macd.signal.toFixed(2)}*
// 📊 Volume: *${volumeNow.toFixed(0)}*
// 📉 Avg Vol SMA20: *${volumeSMA.toFixed(0)}*
// 📉 EMA200 (1h): *${ema200_1h.toFixed(2)}*`;

//       for (let chatId of USERS) {
//         await bot.sendMessage(chatId, msg, {
//           parse_mode: 'Markdown',
//           reply_markup: {
//             inline_keyboard: [
//               [{ text: '📡 Active Trade Status', callback_data: 'active_trade_status' }]
//             ]
//           }
//         });
//         console.log(`✅ Sent signal to ${chatId}`);
//       }
//     } else {
//       console.log(`${symbol}: No signal`);
//     }
//   } catch (err) {
//     console.error(`❌ Error analyzing ${symbol}:`, err.message);
//   }
// }

// // Run scan every 5 min
// setInterval(() => {
//   SYMBOLS.forEach(symbol => analyzeSymbol(symbol));
// }, 5 * 60 * 1000);


require('dotenv').config();
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const { RSI, EMA, SMA, MACD } = require('technicalindicators');

// Setup
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const SYMBOLS = ['ETHUSDT', 'BTCUSDT', 'BNBUSDT']; // symbols to track
const USERS = [];
const INTERVAL_SHORT = '1m';
const INTERVAL_LONG = '1h';

// Active trades storage
// example: { ETHUSDT: {signal: 'BUY', entry: 1234.56, target: 1240, stoploss: 1220} }
const activeTrades = {};

// /start command - add user to USERS
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (!USERS.includes(chatId)) USERS.push(chatId);
  bot.sendMessage(chatId, '✅ Crypto Signal Bot Activated');
});

// /status command - send active trades status
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  let statusMsg = '📡 Bot is running and monitoring the market ✅\n\n';

  if (Object.keys(activeTrades).length === 0) {
    statusMsg += 'No active trades at the moment.';
  } else {
    for (const symbol of Object.keys(activeTrades)) {
      const t = activeTrades[symbol];
      statusMsg += `🔔 *${symbol}*\nSignal: *${t.signal}*\nEntry: ${t.entry.toFixed(2)}\nTarget: ${t.target.toFixed(2)}\nStoploss: ${t.stoploss.toFixed(2)}\n\n`;
    }
  }

  bot.sendMessage(chatId, statusMsg, { parse_mode: 'Markdown' });
});

// Fetch candle data from Binance
async function fetchCandles(symbol, interval, limit = 100) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await axios.get(url);
  return res.data.map(c => ({
    open: parseFloat(c[1]),
    high: parseFloat(c[2]),
    low: parseFloat(c[3]),
    close: parseFloat(c[4]),
    volume: parseFloat(c[5]),
    time: c[0],
  }));
}

// Analyze symbol and send signals
async function analyzeSymbol(symbol) {
  try {
    const candles1m = await fetchCandles(symbol, INTERVAL_SHORT, 100);
    const candles1h = await fetchCandles(symbol, INTERVAL_LONG, 200);

    const closes1m = candles1m.map(c => c.close);
    const volumes1m = candles1m.map(c => c.volume);
    const closes1h = candles1h.map(c => c.close);

    const rsi1m = RSI.calculate({ values: closes1m, period: 14 }).slice(-1)[0];
    const ema14_1m = EMA.calculate({ values: closes1m, period: 14 }).slice(-1)[0];
    const ema200_1h = EMA.calculate({ values: closes1h, period: 200 }).slice(-1)[0];
    const macdArr = MACD.calculate({
      values: closes1m,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });
    const macd = macdArr.length > 0 ? macdArr.slice(-1)[0] : null;

    if (!macd) {
      console.log(`Insufficient MACD data for ${symbol}`);
      return;
    }

    const volumeNow = volumes1m.slice(-1)[0];
    const volumeSMA = SMA.calculate({ values: volumes1m, period: 20 }).slice(-1)[0];
    const currentPrice = closes1m.slice(-1)[0];

    // Signal logic
    const isBuy = rsi1m > 50 && currentPrice > ema14_1m && macd.MACD > macd.signal;
    const isSell = rsi1m < 50 && currentPrice < ema14_1m && macd.MACD < macd.signal;
    const signal = isBuy ? 'BUY' : isSell ? 'SELL' : 'HOLD';

    const target = +(currentPrice * 1.0035).toFixed(2);
    const stoploss = +(currentPrice * 0.9985).toFixed(2);

    if (signal === 'BUY' || signal === 'SELL') {
      if (!activeTrades[symbol] || activeTrades[symbol].signal !== signal) {
        activeTrades[symbol] = { signal, entry: currentPrice, target, stoploss };

        const msg =
`*Crypto Signal - ${symbol} (1m + 1h)*

📈 Signal: *${signal}*
💰 Entry: *${currentPrice.toFixed(2)}*
🎯 Target: *${target}*
🛑 Stoploss: *${stoploss}*

📊 RSI (1m): *${rsi1m.toFixed(2)}*
📉 EMA14 (1m): *${ema14_1m.toFixed(2)}*
📈 MACD (1m): *${macd.MACD.toFixed(2)}*
🟡 Signal Line: *${macd.signal.toFixed(2)}*
📊 Volume: *${volumeNow.toFixed(0)}*
📉 Avg Vol SMA20: *${volumeSMA.toFixed(0)}*
📉 EMA200 (1h): *${ema200_1h.toFixed(2)}*`;

        // Send signal message to all users
        for (const chatId of USERS) {
          await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
          console.log(`✅ Sent signal to ${chatId} for ${symbol}`);
        }
      }
    } else {
      // If HOLD, you can optionally clear trade:
      // delete activeTrades[symbol];
      console.log(`${symbol}: No strong signal, HOLD`);
    }
  } catch (err) {
    console.error(`❌ Error analyzing ${symbol}:`, err.message);
  }
}

// Run analyzeSymbol for all symbols every 5 minutes
setInterval(() => {
  SYMBOLS.forEach(symbol => analyzeSymbol(symbol));
}, 5 * 60 * 1000);

// Optional: Run immediately at start
(async () => {
  for (const symbol of SYMBOLS) {
    await analyzeSymbol(symbol);
  }
})();
