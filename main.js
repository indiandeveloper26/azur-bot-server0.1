// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR } = require('technicalindicators');

// // Bot initialize
// const bot = new TelegramBot('7739855919:AAF2JCiwZW5bXkLAcrUx6HPCMCcgE8GJ35c', { polling: true });
// const USER_CHAT_ID = 5918728195; // Apna chat ID yahan daalein

// // Config
// const SYMBOL = 'BTCUSDT';
// const INTERVAL = '5m';  // 5 minute candle interval
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;

// // Binance se candles fetch karne ka function
// async function fetchKlines(symbol, interval, limit = 100) {
//   const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
//   try {
//     const res = await axios.get(url);
//     return res.data.map(candle => ({
//       open: parseFloat(candle[1]),
//       high: parseFloat(candle[2]),
//       low: parseFloat(candle[3]),
//       close: parseFloat(candle[4]),
//       volume: parseFloat(candle[5]),
//       time: candle[0]
//     }));
//   } catch (err) {
//     console.error("❌ Binance API error:", err.response ? err.response.data : err.message);
//     throw err;
//   }
// }

// // Binance se current price fetch karne ka function
// async function fetchCurrentPrice(symbol) {
//   const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
//   try {
//     const res = await axios.get(url);
//     return parseFloat(res.data.price);
//   } catch (err) {
//     console.error("❌ Binance current price error:", err.response ? err.response.data : err.message);
//     return null;
//   }
// }

// // Indicators analyze karne ka function
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

// // Telegram pe signal bhejne ka function
// async function sendSignal() {
//   try {
//     const candles = await fetchKlines(SYMBOL, INTERVAL, 100);
//     const currentPrice = await fetchCurrentPrice(SYMBOL);
//     const analysis = analyzeData(candles);

//     const msg = `
// *Crypto Signal for ${SYMBOL} (${INTERVAL})*
// *Signal:* ${analysis.signal}

// *Current Price:* ${currentPrice ? currentPrice.toFixed(2) : "N/A"}
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

// // Bot start karte hi signal bheje aur phir 5 minute me repeat ho
// sendSignal();
// setInterval(sendSignal, 5 * 60 * 1000); // 5 minute interval

// bot.onText(/\/start/, (msg) => {
//   bot.sendMessage(msg.chat.id, "🚀 Crypto Signal Bot is active and watching the markets!");
// });

// console.log("✅ Crypto Signal Bot chalu ho gaya...");




// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR } = require('technicalindicators');

// // Telegram Bot Token aur User Chat ID yahan daalein
// const TELEGRAM_BOT_TOKEN = '7739855919:AAF2JCiwZW5bXkLAcrUx6HPCMCcgE8GJ35c'; // apna token yahan daalein
// const USER_CHAT_ID = 5918728195; // apna chat ID yahan daalein

// // Bot initialize
// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// // Config
// const SYMBOL = 'BTCUSDT';
// const INTERVAL = '5m'; // candle interval
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;

// // Binance API se candle data fetch karne ka function
// async function fetchKlines(symbol, interval, limit = 100) {
//   const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
//   try {
//     const res = await axios.get(url);
//     return res.data.map(candle => ({
//       open: parseFloat(candle[1]),
//       high: parseFloat(candle[2]),
//       low: parseFloat(candle[3]),
//       close: parseFloat(candle[4]),
//       volume: parseFloat(candle[5]),
//       time: candle[0]
//     }));
//   } catch (err) {
//     console.error("❌ Binance API error:", err.response ? err.response.data : err.message);
//     throw err;
//   }
// }

// // Binance API se current price fetch karne ka function
// async function fetchCurrentPrice(symbol) {
//   const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
//   try {
//     const res = await axios.get(url);
//     return parseFloat(res.data.price);
//   } catch (err) {
//     console.error("❌ Binance current price error:", err.response ? err.response.data : err.message);
//     return null;
//   }
// }

// // Indicators calculate karne aur signal generate karne wala function
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

// // Telegram pe signal bhejne ka function
// async function sendSignal() {
//   try {
//     const candles = await fetchKlines(SYMBOL, INTERVAL, 100);
//     const currentPrice = await fetchCurrentPrice(SYMBOL);
//     const analysis = analyzeData(candles);

//     const msg = `
// *Crypto Signal for ${SYMBOL} (${INTERVAL})*
// *Signal:* ${analysis.signal}

// *Current Price:* ${currentPrice ? currentPrice.toFixed(2) : "N/A"}
// *Close:* ${analysis.lastClose.toFixed(2)}
// *EMA14:* ${analysis.lastEma.toFixed(2)}
// *RSI14:* ${analysis.lastRsi.toFixed(2)}
// *MACD:* ${analysis.lastMacd.MACD.toFixed(4)}
// *Signal Line:* ${analysis.lastMacd.signal.toFixed(4)}
// *ATR14:* ${analysis.lastAtr.toFixed(4)}
// ${analysis.signal !== 'HOLD' ? `\n🎯 *Target:* ${analysis.target.toFixed(2)}\n⛔ *Stoploss:* ${analysis.stoploss.toFixed(2)}` : ''}
//     `;

//     await bot.sendMessage(USER_CHAT_ID, msg, { parse_mode: 'Markdown' });
//     console.log(`✅ Signal sent: ${analysis.signal} at price ${currentPrice}`);
//   } catch (err) {
//     console.error("❌ Error sending signal:", err.message);
//   }
// }

// // Bot start hote hi signal bhejna aur 5 minute me repeat karna
// sendSignal();
// setInterval(sendSignal, 5 * 60 * 1000);

// // /start command handle karna
// bot.onText(/\/start/, (msg) => {
//   bot.sendMessage(msg.chat.id, "🚀 Crypto Signal Bot is active and watching the markets!");
// });

// console.log("✅ Crypto Signal Bot chalu ho gaya...");













// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR } = require('technicalindicators');

// // Telegram Bot Token aur User Chat ID yahan daalein
// const TELEGRAM_BOT_TOKEN = '7739855919:AAF2JCiwZW5bXkLAcrUx6HPCMCcgE8GJ35c'; // apna token yahan daalein
// const USER_CHAT_ID = 5918728195; // apna chat ID yahan daalein

// // Bot initialize
// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// // Config
// const SYMBOL = 'BTCUSDT';
// const INTERVAL = '5m'; // candle interval
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;

// // Global active trade state
// let activeTrade = null; 
// // activeTrade = {
// //   signal: 'BUY' or 'SELL',
// //   target: number,
// //   stoploss: number
// // }

// // Binance API se candle data fetch karne ka function
// async function fetchKlines(symbol, interval, limit = 100) {
//   const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
//   try {
//     const res = await axios.get(url);
//     return res.data.map(candle => ({
//       open: parseFloat(candle[1]),
//       high: parseFloat(candle[2]),
//       low: parseFloat(candle[3]),
//       close: parseFloat(candle[4]),
//       volume: parseFloat(candle[5]),
//       time: candle[0]
//     }));
//   } catch (err) {
//     console.error("❌ Binance API error:", err.response ? err.response.data : err.message);
//     throw err;
//   }
// }

// // Binance API se current price fetch karne ka function
// async function fetchCurrentPrice(symbol) {
//   const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
//   try {
//     const res = await axios.get(url);
//     return parseFloat(res.data.price);
//   } catch (err) {
//     console.error("❌ Binance current price error:", err.response ? err.response.data : err.message);
//     return null;
//   }
// }

// // Indicators calculate karne aur signal generate karne wala function
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

// // Target ya stoploss hit hua ya nahi check karne wala function
// function checkIfHit(price) {
//   if (!activeTrade) return false;

//   if (activeTrade.signal === 'BUY') {
//     if (price >= activeTrade.target) {
//       return 'target';
//     } else if (price <= activeTrade.stoploss) {
//       return 'stoploss';
//     }
//   } else if (activeTrade.signal === 'SELL') {
//     if (price <= activeTrade.target) {
//       return 'target';
//     } else if (price >= activeTrade.stoploss) {
//       return 'stoploss';
//     }
//   }
//   return false;
// }

// // Telegram pe signal bhejne ka function with logic to check activeTrade
// async function sendSignal() {
//   try {
//     const candles = await fetchKlines(SYMBOL, INTERVAL, 100);
//     const currentPrice = await fetchCurrentPrice(SYMBOL);
//     if (!currentPrice) return;

//     // Agar koi active trade hai to check karo target/stoploss hit hua kya
//     if (activeTrade) {
//       const hit = checkIfHit(currentPrice);
//       if (hit) {
//         await bot.sendMessage(USER_CHAT_ID, `⚠️ *${activeTrade.signal}* position closed due to *${hit.toUpperCase()}* hit at price ${currentPrice.toFixed(2)}. You can now take new signals.`, { parse_mode: 'Markdown' });
//         console.log(`⚠️ Trade closed due to ${hit} hit.`);
//         activeTrade = null; // Reset trade
//       } else {
//         // Target/stoploss nahi hit, toh abhi koi naya signal nahi bhejna
//         console.log(`⏳ Waiting for target/stoploss to hit. Current price: ${currentPrice.toFixed(2)}`);
//         return;
//       }
//     }

//     // Abhi activeTrade nahi hai, naya signal analyze karo
//     const analysis = analyzeData(candles);

//     if (analysis.signal === 'HOLD') {
//       console.log('No clear signal at the moment.');
//       return;
//     }

//     // Naya signal bhejo aur activeTrade update karo
//     const msg = `
// *Crypto Signal for ${SYMBOL} (${INTERVAL})*
// *Signal:* ${analysis.signal}

// *Current Price:* ${currentPrice.toFixed(2)}
// *Close:* ${analysis.lastClose.toFixed(2)}
// *EMA14:* ${analysis.lastEma.toFixed(2)}
// *RSI14:* ${analysis.lastRsi.toFixed(2)}
// *MACD:* ${analysis.lastMacd.MACD.toFixed(4)}
// *Signal Line:* ${analysis.lastMacd.signal.toFixed(4)}
// *ATR14:* ${analysis.lastAtr.toFixed(4)}

// 🎯 *Target:* ${analysis.target.toFixed(2)}
// ⛔ *Stoploss:* ${analysis.stoploss.toFixed(2)}
//     `;

//     await bot.sendMessage(USER_CHAT_ID, msg, { parse_mode: 'Markdown' });
//     console.log(`✅ New signal sent: ${analysis.signal} at price ${currentPrice}`);

//     activeTrade = {
//       signal: analysis.signal,
//       target: analysis.target,
//       stoploss: analysis.stoploss
//     };

//   } catch (err) {
//     console.error("❌ Error sending signal:", err.message);
//   }
// }

// // Bot start hote hi signal bhejna aur 5 minute me repeat karna
// sendSignal();
// setInterval(sendSignal, 5 * 60 * 1000);

// // /start command handle karna
// bot.onText(/\/start/, (msg) => {
//   bot.sendMessage(msg.chat.id, "🚀 Crypto Signal Bot is active and watching the markets!");
// });

// console.log("✅ Crypto Signal Bot chalu ho gaya...");






// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR } = require('technicalindicators');

// // Telegram Bot Token yahan daalein
// const TELEGRAM_BOT_TOKEN = '7739855919:AAF2JCiwZW5bXkLAcrUx6HPCMCcgE8GJ35c'; // apna token yahan daalein

// // Bot initialize
// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// // Config
// const SYMBOL = 'BTCUSDT';
// const INTERVAL = '5m'; // candle interval
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;

// // Multiple users ke chat IDs store karne ke liye array
// let USER_CHAT_IDS = [];

// // Global active trade state for each user
// // Yeh ek object hoga jisme key = chatId aur value = activeTrade object
// let activeTrades = {};

// // Binance API se candle data fetch karne ka function
// async function fetchKlines(symbol, interval, limit = 100) {
//   const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
//   try {
//     const res = await axios.get(url);
//     return res.data.map(candle => ({
//       open: parseFloat(candle[1]),
//       high: parseFloat(candle[2]),
//       low: parseFloat(candle[3]),
//       close: parseFloat(candle[4]),
//       volume: parseFloat(candle[5]),
//       time: candle[0]
//     }));
//   } catch (err) {
//     console.error("❌ Binance API error:", err.response ? err.response.data : err.message);
//     throw err;
//   }
// }

// // Binance API se current price fetch karne ka function
// async function fetchCurrentPrice(symbol) {
//   const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
//   try {
//     const res = await axios.get(url);
//     return parseFloat(res.data.price);
//   } catch (err) {
//     console.error("❌ Binance current price error:", err.response ? err.response.data : err.message);
//     return null;
//   }
// }

// // Indicators calculate karne aur signal generate karne wala function
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

// // Target ya stoploss hit hua ya nahi check karne wala function for a given activeTrade
// function checkIfHit(price, activeTrade) {
//   if (!activeTrade) return false;

//   if (activeTrade.signal === 'BUY') {
//     if (price >= activeTrade.target) {
//       return 'target';
//     } else if (price <= activeTrade.stoploss) {
//       return 'stoploss';
//     }
//   } else if (activeTrade.signal === 'SELL') {
//     if (price <= activeTrade.target) {
//       return 'target';
//     } else if (price >= activeTrade.stoploss) {
//       return 'stoploss';
//     }
//   }
//   return false;
// }

// // Telegram pe signal bhejne ka function with logic to check activeTrade for each user
// async function sendSignal() {
//   if (USER_CHAT_IDS.length === 0) {
//     console.log("Koi user nahi jiska chat ID set ho.");
//     return;
//   }

//   try {
//     const candles = await fetchKlines(SYMBOL, INTERVAL, 100);
//     const currentPrice = await fetchCurrentPrice(SYMBOL);
//     if (!currentPrice) return;

//     for (const chatId of USER_CHAT_IDS) {
//       const activeTrade = activeTrades[chatId];

//       if (activeTrade) {
//         const hit = checkIfHit(currentPrice, activeTrade);
//         if (hit) {
//           await bot.sendMessage(chatId, `⚠️ *${activeTrade.signal}* position closed due to *${hit.toUpperCase()}* hit at price ${currentPrice.toFixed(2)}. You can now take new signals.`, { parse_mode: 'Markdown' });
//           console.log(`⚠️ Trade closed for ${chatId} due to ${hit} hit.`);
//           activeTrades[chatId] = null; // Reset trade for this user
//           continue; // next user
//         } else {
//           console.log(`⏳ Waiting for target/stoploss to hit for user ${chatId}. Current price: ${currentPrice.toFixed(2)}`);
//           continue; // Skip sending new signal until target/stoploss hit
//         }
//       }

//       // Abhi activeTrade nahi hai user ke liye, naya signal analyze karo
//       const analysis = analyzeData(candles);

//       if (analysis.signal === 'HOLD') {
//         console.log(`No clear signal at the moment for user ${chatId}.`);
//         continue;
//       }

//       // Naya signal bhejo aur activeTrade update karo
//       const msg = `
// *Crypto Signal for ${SYMBOL} (${INTERVAL})*
// *Signal:* ${analysis.signal}

// *Current Price:* ${currentPrice.toFixed(2)}
// *Close:* ${analysis.lastClose.toFixed(2)}
// *EMA14:* ${analysis.lastEma.toFixed(2)}
// *RSI14:* ${analysis.lastRsi.toFixed(2)}
// *MACD:* ${analysis.lastMacd.MACD.toFixed(4)}
// *Signal Line:* ${analysis.lastMacd.signal.toFixed(4)}
// *ATR14:* ${analysis.lastAtr.toFixed(4)}

// 🎯 *Target:* ${analysis.target.toFixed(2)}
// ⛔ *Stoploss:* ${analysis.stoploss.toFixed(2)}
//       `;

//       await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
//       console.log(`✅ New signal sent to user ${chatId}: ${analysis.signal} at price ${currentPrice}`);

//       activeTrades[chatId] = {
//         signal: analysis.signal,
//         target: analysis.target,
//         stoploss: analysis.stoploss
//       };
//     }
//   } catch (err) {
//     console.error("❌ Error sending signal:", err.message);
//   }
// }

// // /start command handle karna aur user chat ID store karna
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) {
//     USER_CHAT_IDS.push(chatId);
//     console.log(`New user added: ${chatId}`);
//   }
//   bot.sendMessage(chatId, "🚀 Crypto Signal Bot is active and watching the markets!");
// });

// console.log("✅ Crypto Signal Bot chalu ho gaya...");

// // Bot start hote hi signal bhejna aur 5 minute me repeat karna
// sendSignal();
// setInterval(sendSignal, 5 * 60 * 1000);







// const axios = require("axios");
// const { EMA, RSI, MACD, ATR } = require("technicalindicators");
// const TelegramBot = require("node-telegram-bot-api");

// // 🔐 Telegram Bot Config
// const TELEGRAM_BOT_TOKEN ='8003756443:AAHOP678U2KdAiTuVYQZVQ2DsYnT2Oq4PnE'
// const CHAT_ID =  5918728195
// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// // 🔁 Global Variables
// const symbol = "BTCUSDT";
// let lastSignal = null;

// // 🕯️ Fetch 5m Candle Data from Binance
// async function fetchCandleData() {
//   const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&limit=100`;
//   const response = await axios.get(url);
//   return response.data.map(candle => ({
//     time: candle[0],
//     open: parseFloat(candle[1]),
//     high: parseFloat(candle[2]),
//     low: parseFloat(candle[3]),
//     close: parseFloat(candle[4]),
//     volume: parseFloat(candle[5]),
//   }));
// }

// // 📊 Calculate Indicators
// function calculateIndicators(data) {
//   const closes = data.map(c => c.close);
//   const highs = data.map(c => c.high);
//   const lows = data.map(c => c.low);

//   const emaFast = EMA.calculate({ period: 9, values: closes });
//   const emaSlow = EMA.calculate({ period: 21, values: closes });
//   const rsi = RSI.calculate({ period: 14, values: closes });
//   const macd = MACD.calculate({
//     values: closes,
//     fastPeriod: 12,
//     slowPeriod: 26,
//     signalPeriod: 9,
//     SimpleMAOscillator: false,
//     SimpleMASignal: false,
//   });
//   const atr = ATR.calculate({ high: highs, low: lows, close: closes, period: 14 });

//   return {
//     emaFast: emaFast.at(-1),
//     emaSlow: emaSlow.at(-1),
//     rsi: rsi.at(-1),
//     macd: macd.at(-1),
//     atr: atr.at(-1),
//   };
// }

// // 🚀 Send Signal to Telegram
// async function sendSignalToTelegram(signal, price, target, stoploss) {
//   const message = `📢 *${signal} Signal* for *${symbol}*\n\n💰 Entry: *${price}*\n🎯 Target: *${target.toFixed(2)}*\n🛑 Stoploss: *${stoploss.toFixed(2)}*`;
//   await bot.sendMessage(CHAT_ID, message, { parse_mode: "Markdown" });
// }

// // 🎯/🛑 Target or Stoploss Hit Alert
// async function sendTargetStoplossAlert(type, price) {
//   const emoji = type === "Target" ? "🎯" : "🛑";
//   const message = `${emoji} *${type} hit* for *${symbol}* at *${price.toFixed(2)}*`;
//   await bot.sendMessage(CHAT_ID, message, { parse_mode: "Markdown" });
// }

// // 🟡 Send HOLD Signal
// async function sendHoldSignal(price) {
//   const message = `⏸️ *HOLD* — No clear signal for *${symbol}*\n📉 Current Price: *${price.toFixed(2)}*`;
//   await bot.sendMessage(CHAT_ID, message, { parse_mode: "Markdown" });
// }

// // 🔍 Analyze Market
// async function analyze() {
//   try {
//     const candles = await fetchCandleData();
//     const indicators = calculateIndicators(candles);
//     const currentPrice = candles.at(-1).close;

//     if (!indicators.emaFast || !indicators.emaSlow || !indicators.macd || !indicators.rsi || !indicators.atr) return;

//     let signal = null;

//     if (
//       indicators.emaFast > indicators.emaSlow &&
//       indicators.macd.MACD > indicators.macd.signal &&
//       indicators.rsi > 50
//     ) {
//       signal = "BUY";
//     } else if (
//       indicators.emaFast < indicators.emaSlow &&
//       indicators.macd.MACD < indicators.macd.signal &&
//       indicators.rsi < 50
//     ) {
//       signal = "SELL";
//     }

//     if (signal && lastSignal?.type !== signal) {
//       const entryPrice = currentPrice;
//       const atr = indicators.atr;
//       const stoploss = signal === "BUY" ? entryPrice - 1.5 * atr : entryPrice + 1.5 * atr;
//       const target = signal === "BUY" ? entryPrice + 3 * atr : entryPrice - 3 * atr;

//       lastSignal = {
//         type: signal,
//         entry: entryPrice,
//         stoploss,
//         target,
//         active: true,
//       };

//       await sendSignalToTelegram(signal, entryPrice, target, stoploss);
//     }

//     // 🎯 Check if Target or Stoploss Hit
//     if (lastSignal?.active) {
//       if (
//         (lastSignal.type === "BUY" && currentPrice >= lastSignal.target) ||
//         (lastSignal.type === "SELL" && currentPrice <= lastSignal.target)
//       ) {
//         await sendTargetStoplossAlert("Target", currentPrice);
//         lastSignal.active = false;
//       } else if (
//         (lastSignal.type === "BUY" && currentPrice <= lastSignal.stoploss) ||
//         (lastSignal.type === "SELL" && currentPrice >= lastSignal.stoploss)
//       ) {
//         await sendTargetStoplossAlert("Stoploss", currentPrice);
//         lastSignal.active = false;
//       }
//     }

//     // ⏸️ HOLD Signal
//     if (!signal && (!lastSignal || lastSignal.type !== "HOLD")) {
//       lastSignal = { type: "HOLD" };
//       await sendHoldSignal(currentPrice);
//     }

//   } catch (error) {
//     console.error("❌ Error during analysis:", error.message);
//   }
// }

// // 🔁 Run every 5 minutes
// setInterval(analyze, 5 * 60 * 1000);

// // Initial call
// analyze();















// const axios = require("axios");
// const { EMA, RSI, MACD, ATR } = require("technicalindicators");
// const TelegramBot = require("node-telegram-bot-api");

// // Telegram credentials
// const TELEGRAM_BOT_TOKEN = '8003756443:AAHOP678U2KdAiTuVYQZVQ2DsYnT2Oq4PnE'
// const CHAT_ID =  5918728195
// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// // Crypto symbol
// const symbol = "BTCUSDT";

// // Track last signal and candle
// let lastSignal = null;
// let lastCandleTime = null;

// async function fetchCandleData() {
//   const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&limit=100`;
//   const response = await axios.get(url);
//   return response.data.map(candle => ({
//     time: candle[0],
//     open: parseFloat(candle[1]),
//     high: parseFloat(candle[2]),
//     low: parseFloat(candle[3]),
//     close: parseFloat(candle[4]),
//     volume: parseFloat(candle[5]),
//   }));
// }

// function calculateIndicators(data) {
//   const closes = data.map(c => c.close);
//   const highs = data.map(c => c.high);
//   const lows = data.map(c => c.low);

//   return {
//     emaFast: EMA.calculate({ period: 9, values: closes }).at(-1),
//     emaSlow: EMA.calculate({ period: 21, values: closes }).at(-1),
//     rsi: RSI.calculate({ period: 14, values: closes }).at(-1),
//     macd: MACD.calculate({
//       values: closes,
//       fastPeriod: 12,
//       slowPeriod: 26,
//       signalPeriod: 9,
//       SimpleMAOscillator: false,
//       SimpleMASignal: false,
//     }).at(-1),
//     atr: ATR.calculate({ high: highs, low: lows, close: closes, period: 14 }).at(-1),
//   };
// }

// async function sendSignalToTelegram(signal, price, target, stoploss) {
//   const message = `📢 *${signal} Signal* for *${symbol}*\n\n💰 Entry: *${price}*\n🎯 Target: *${target.toFixed(2)}*\n🛑 Stoploss: *${stoploss.toFixed(2)}*`;
//   await bot.sendMessage(CHAT_ID, message, { parse_mode: "Markdown" });
// }

// async function sendTargetStoplossAlert(type, price) {
//   const emoji = type === "Target" ? "🎯" : "🛑";
//   const message = `${emoji} *${type} hit* for *${symbol}* at *${price.toFixed(2)}*`;
//   await bot.sendMessage(CHAT_ID, message, { parse_mode: "Markdown" });
// }

// async function analyze() {
//   try {
//     const candles = await fetchCandleData();
//     const currentCandle = candles.at(-1);
//     const currentPrice = currentCandle.close;

//     // Check if new candle arrived
//     if (lastCandleTime === currentCandle.time) {
//       return setTimeout(analyze, 15 * 1000);
//     }
//     lastCandleTime = currentCandle.time;

//     const indicators = calculateIndicators(candles);
//     if (!indicators.emaFast || !indicators.emaSlow || !indicators.macd || !indicators.rsi || !indicators.atr) {
//       return setTimeout(analyze, 15 * 1000);
//     }

//     let signal = null;

//     // Signal detection
//     if (
//       indicators.emaFast > indicators.emaSlow &&
//       indicators.macd.MACD > indicators.macd.signal &&
//       indicators.rsi > 50
//     ) {
//       signal = "BUY";
//     } else if (
//       indicators.emaFast < indicators.emaSlow &&
//       indicators.macd.MACD < indicators.macd.signal &&
//       indicators.rsi < 50
//     ) {
//       signal = "SELL";
//     }

//     if (signal && lastSignal?.type !== signal) {
//       const entryPrice = currentPrice;
//       const stoploss = signal === "BUY" ? entryPrice - 1.5 * indicators.atr : entryPrice + 1.5 * indicators.atr;
//       const target = signal === "BUY" ? entryPrice + 3 * indicators.atr : entryPrice - 3 * indicators.atr;

//       lastSignal = {
//         type: signal,
//         entry: entryPrice,
//         stoploss,
//         target,
//         active: true,
//       };

//       await sendSignalToTelegram(signal, entryPrice, target, stoploss);
//     }

//     // Check for target or stoploss hit
//     if (lastSignal?.active) {
//       if (
//         (lastSignal.type === "BUY" && currentPrice >= lastSignal.target) ||
//         (lastSignal.type === "SELL" && currentPrice <= lastSignal.target)
//       ) {
//         await sendTargetStoplossAlert("Target", currentPrice);
//         lastSignal.active = false;
//       } else if (
//         (lastSignal.type === "BUY" && currentPrice <= lastSignal.stoploss) ||
//         (lastSignal.type === "SELL" && currentPrice >= lastSignal.stoploss)
//       ) {
//         await sendTargetStoplossAlert("Stoploss", currentPrice);
//         lastSignal.active = false;
//       }
//     }

//     // Send HOLD if no signal
//     if (!signal) {
//       await bot.sendMessage(
//         CHAT_ID,
//         `⏸️ *HOLD* — No clear signal for *${symbol}* at price *${currentPrice.toFixed(2)}*`,
//         { parse_mode: "Markdown" }
//       );
//     }

//   } catch (error) {
//     console.error("❌ Error:", error.message);
//   }

//   setTimeout(analyze, 15 * 1000); // Run again after 15 sec
// }

// // 🔁 Start bot
// analyze();





// const axios = require("axios");
// const { EMA, RSI, MACD, ATR } = require("technicalindicators");
// const TelegramBot = require("node-telegram-bot-api");

// const TELEGRAM_BOT_TOKEN = '8003756443:AAHOP678U2KdAiTuVYQZVQ2DsYnT2Oq4PnE';
// const CHAT_ID = 5918728195;
// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// // Symbols list jinka aap trade karna chahte ho
// const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];

// let lastSignals = {};  // Har symbol ka last signal
// let lastCandleTimes = {}; // Har symbol ka last candle time

// async function fetchCandleData(symbol) {
//   const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&limit=100`;
//   const response = await axios.get(url);
//   return response.data.map(candle => ({
//     time: candle[0],
//     open: parseFloat(candle[1]),
//     high: parseFloat(candle[2]),
//     low: parseFloat(candle[3]),
//     close: parseFloat(candle[4]),
//     volume: parseFloat(candle[5]),
//   }));
// }

// function calculateIndicators(data) {
//   const closes = data.map(c => c.close);
//   const highs = data.map(c => c.high);
//   const lows = data.map(c => c.low);

//   return {
//     emaFast: EMA.calculate({ period: 9, values: closes }).at(-1),
//     emaSlow: EMA.calculate({ period: 21, values: closes }).at(-1),
//     rsi: RSI.calculate({ period: 14, values: closes }).at(-1),
//     macd: MACD.calculate({
//       values: closes,
//       fastPeriod: 12,
//       slowPeriod: 26,
//       signalPeriod: 9,
//       SimpleMAOscillator: false,
//       SimpleMASignal: false,
//     }).at(-1),
//     atr: ATR.calculate({ high: highs, low: lows, close: closes, period: 14 }).at(-1),
//   };
// }

// async function sendSignalToTelegram(symbol, signal, price, target, stoploss) {
//   const message = `📢 *${signal} Signal* for *${symbol}*\n\n💰 Entry: *${price.toFixed(2)}*\n🎯 Target: *${target.toFixed(2)}*\n🛑 Stoploss: *${stoploss.toFixed(2)}*`;
//   await bot.sendMessage(CHAT_ID, message, { parse_mode: "Markdown" });
// }

// async function sendTargetStoplossAlert(symbol, type, price) {
//   const emoji = type === "Target" ? "🎯" : "🛑";
//   const message = `${emoji} *${type} hit* for *${symbol}* at *${price.toFixed(2)}*`;
//   await bot.sendMessage(CHAT_ID, message, { parse_mode: "Markdown" });
// }

// async function analyzeSymbol(symbol) {
//   try {
//     const candles = await fetchCandleData(symbol);
//     const currentCandle = candles.at(-1);
//     const currentPrice = currentCandle.close;

//     if (lastCandleTimes[symbol] === currentCandle.time) {
//       // Candle same hai, skip
//       return;
//     }
//     lastCandleTimes[symbol] = currentCandle.time;

//     const indicators = calculateIndicators(candles);
//     if (!indicators.emaFast || !indicators.emaSlow || !indicators.macd || !indicators.rsi || !indicators.atr) {
//       return;
//     }

//     let signal = null;

//     if (
//       indicators.emaFast > indicators.emaSlow &&
//       indicators.macd.MACD > indicators.macd.signal &&
//       indicators.rsi > 50
//     ) {
//       signal = "BUY";
//     } else if (
//       indicators.emaFast < indicators.emaSlow &&
//       indicators.macd.MACD < indicators.macd.signal &&
//       indicators.rsi < 50
//     ) {
//       signal = "SELL";
//     }

//     if (signal && lastSignals[symbol]?.type !== signal) {
//       const entryPrice = currentPrice;
//       const stoploss = signal === "BUY" ? entryPrice - 1.5 * indicators.atr : entryPrice + 1.5 * indicators.atr;
//       const target = signal === "BUY" ? entryPrice + 3 * indicators.atr : entryPrice - 3 * indicators.atr;

//       lastSignals[symbol] = {
//         type: signal,
//         entry: entryPrice,
//         stoploss,
//         target,
//         active: true,
//       };

//       await sendSignalToTelegram(symbol, signal, entryPrice, target, stoploss);
//     }

//     if (lastSignals[symbol]?.active) {
//       if (
//         (lastSignals[symbol].type === "BUY" && currentPrice >= lastSignals[symbol].target) ||
//         (lastSignals[symbol].type === "SELL" && currentPrice <= lastSignals[symbol].target)
//       ) {
//         await sendTargetStoplossAlert(symbol, "Target", currentPrice);
//         lastSignals[symbol].active = false;
//       } else if (
//         (lastSignals[symbol].type === "BUY" && currentPrice <= lastSignals[symbol].stoploss) ||
//         (lastSignals[symbol].type === "SELL" && currentPrice >= lastSignals[symbol].stoploss)
//       ) {
//         await sendTargetStoplossAlert(symbol, "Stoploss", currentPrice);
//         lastSignals[symbol].active = false;
//       }
//     }

//     // Agar koi signal nahi hai, toh HOLD message bhejne ka option hai, aap chaho toh isko enable kar sakte hain
//     // await bot.sendMessage(CHAT_ID, `⏸️ *HOLD* — No clear signal for *${symbol}* at price *${currentPrice.toFixed(2)}*`, { parse_mode: "Markdown" });

//   } catch (error) {
//     console.error(`Error in symbol ${symbol}:`, error.message);
//   }
// }

// async function analyze() {
//   for (const symbol of symbols) {
//     await analyzeSymbol(symbol);
//   }
//   setTimeout(analyze, 15 * 1000); // 15 sec baad dubara run karo
// }

// // Start the analysis loop
// analyze();




const axios = require("axios");
const { EMA, RSI, MACD, ATR } = require("technicalindicators");
const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_BOT_TOKEN = '8003756443:AAHOP678U2KdAiTuVYQZVQ2DsYnT2Oq4PnE';
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });  // Polling true to listen commands

const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];

let lastSignals = {};  
let lastCandleTimes = {}; 

async function fetchCandleData(symbol) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&limit=100`;
  const response = await axios.get(url);
  return response.data.map(candle => ({
    time: candle[0],
    open: parseFloat(candle[1]),
    high: parseFloat(candle[2]),
    low: parseFloat(candle[3]),
    close: parseFloat(candle[4]),
    volume: parseFloat(candle[5]),
  }));
}

function calculateIndicators(data) {
  const closes = data.map(c => c.close);
  const highs = data.map(c => c.high);
  const lows = data.map(c => c.low);

  return {
    emaFast: EMA.calculate({ period: 9, values: closes }).at(-1),
    emaSlow: EMA.calculate({ period: 21, values: closes }).at(-1),
    rsi: RSI.calculate({ period: 14, values: closes }).at(-1),
    macd: MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    }).at(-1),
    atr: ATR.calculate({ high: highs, low: lows, close: closes, period: 14 }).at(-1),
  };
}

async function sendSignalToTelegram(chatId, symbol, signal, price, target, stoploss) {
  const message = `📢 *${signal} Signal* for *${symbol}*\n\n💰 Entry: *${price.toFixed(2)}*\n🎯 Target: *${target.toFixed(2)}*\n🛑 Stoploss: *${stoploss.toFixed(2)}*`;
  await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
}

async function sendTargetStoplossAlert(chatId, symbol, type, price) {
  const emoji = type === "Target" ? "🎯" : "🛑";
  const message = `${emoji} *${type} hit* for *${symbol}* at *${price.toFixed(2)}*`;
  await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
}

async function analyzeSymbol(symbol) {
  try {
    const candles = await fetchCandleData(symbol);
    const currentCandle = candles.at(-1);
    const currentPrice = currentCandle.close;

    if (lastCandleTimes[symbol] === currentCandle.time) {
      return;
    }
    lastCandleTimes[symbol] = currentCandle.time;

    const indicators = calculateIndicators(candles);
    if (!indicators.emaFast || !indicators.emaSlow || !indicators.macd || !indicators.rsi || !indicators.atr) {
      return;
    }

    let signal = null;

    if (
      indicators.emaFast > indicators.emaSlow &&
      indicators.macd.MACD > indicators.macd.signal &&
      indicators.rsi > 50
    ) {
      signal = "BUY";
    } else if (
      indicators.emaFast < indicators.emaSlow &&
      indicators.macd.MACD < indicators.macd.signal &&
      indicators.rsi < 50
    ) {
      signal = "SELL";
    }

    if (signal && lastSignals[symbol]?.type !== signal) {
      const entryPrice = currentPrice;
      const stoploss = signal === "BUY" ? entryPrice - 1.5 * indicators.atr : entryPrice + 1.5 * indicators.atr;
      const target = signal === "BUY" ? entryPrice + 3 * indicators.atr : entryPrice - 3 * indicators.atr;

      lastSignals[symbol] = {
        type: signal,
        entry: entryPrice,
        stoploss,
        target,
        active: true,
      };

      // Auto-send signal to main CHAT_ID (optional)
      // await sendSignalToTelegram(CHAT_ID, symbol, signal, entryPrice, target, stoploss);
    }

    if (lastSignals[symbol]?.active) {
      if (
        (lastSignals[symbol].type === "BUY" && currentPrice >= lastSignals[symbol].target) ||
        (lastSignals[symbol].type === "SELL" && currentPrice <= lastSignals[symbol].target)
      ) {
        // Auto alert for target hit
        // await sendTargetStoplossAlert(CHAT_ID, symbol, "Target", currentPrice);
        lastSignals[symbol].active = false;
      } else if (
        (lastSignals[symbol].type === "BUY" && currentPrice <= lastSignals[symbol].stoploss) ||
        (lastSignals[symbol].type === "SELL" && currentPrice >= lastSignals[symbol].stoploss)
      ) {
        // Auto alert for stoploss hit
        // await sendTargetStoplossAlert(CHAT_ID, symbol, "Stoploss", currentPrice);
        lastSignals[symbol].active = false;
      }
    }

  } catch (error) {
    console.error(`Error in symbol ${symbol}:`, error.message);
  }
}

async function analyze() {
  for (const symbol of symbols) {
    await analyzeSymbol(symbol);
  }
  setTimeout(analyze, 15 * 1000);
}
analyze();


// Telegram command handler for /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  // Pehle latest signals ke liye data update karwa lete hain
  for (const symbol of symbols) {
    await analyzeSymbol(symbol);
  }

  // Fir user ko current signal bhejte hain
  let response = "📊 *Current Signals:*\n\n";

  for (const symbol of symbols) {
    const signalData = lastSignals[symbol];
    if (signalData) {
      response += `*${symbol}*\nSignal: ${signalData.type}\nEntry: ${signalData.entry.toFixed(2)}\nTarget: ${signalData.target.toFixed(2)}\nStoploss: ${signalData.stoploss.toFixed(2)}\n\n`;
    } else {
      response += `*${symbol}*\nSignal: No signal yet\n\n`;
    }
  }

  bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
});
