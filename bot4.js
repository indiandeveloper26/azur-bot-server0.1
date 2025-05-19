// // require('dotenv').config();
// // const axios = require('axios');
// // const TelegramBot = require('node-telegram-bot-api');
// // const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// // const cron = require('node-cron');

// // // === CONFIG ===
// // const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_TOKEN';
// // const SYMBOLS = [
// //   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
// //   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
// //   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
// //   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
// //   'SHIBUSDT'
// // ];
// // const INTERVAL_15M = '15m';
// // const INTERVAL_1H = '1h';
// // const TARGET_MULTIPLIER = 1.5;
// // const STOPLOSS_MULTIPLIER = 1.0;
// // const VOLUME_SMA_PERIOD = 20;
// // const EMA_1H_PERIOD = 200;

// // const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// // let USER_CHAT_IDS = [];
// // let activeTrades = {}; // { chatId: { symbol: tradeObject } }

// // // Binance se candles data lana
// // async function fetchKlines(symbol, interval, limit = 100) {
// //   try {
// //     const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
// //     const res = await axios.get(url);
// //     return res.data.map(c => ({
// //       open: parseFloat(c[1]),
// //       high: parseFloat(c[2]),
// //       low: parseFloat(c[3]),
// //       close: parseFloat(c[4]),
// //       volume: parseFloat(c[5]),
// //       time: c[0]
// //     }));
// //   } catch (err) {
// //     console.error(`Error fetching klines for ${symbol} (${interval}):`, err.message);
// //     return null;
// //   }
// // }

// // // Binance se current price lana
// // async function fetchCurrentPrice(symbol) {
// //   try {
// //     const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
// //     const res = await axios.get(url);
// //     return parseFloat(res.data.price);
// //   } catch (err) {
// //     console.error(`Error fetching current price for ${symbol}:`, err.message);
// //     return null;
// //   }
// // }

// // // 15m candle data analysis
// // function analyzeData15m(candles) {
// //   const closes = candles.map(c => c.close);
// //   const highs = candles.map(c => c.high);
// //   const lows = candles.map(c => c.low);
// //   const volumes = candles.map(c => c.volume);

// //   const rsi = RSI.calculate({ values: closes, period: 14 });
// //   const ema = EMA.calculate({ values: closes, period: 14 });
// //   const macd = MACD.calculate({
// //     values: closes,
// //     fastPeriod: 12,
// //     slowPeriod: 26,
// //     signalPeriod: 9,
// //     SimpleMAOscillator: false,
// //     SimpleMASignal: false
// //   });
// //   const atr = ATR.calculate({ high: highs, low: lows, close: closes, period: 14 });
// //   const volumeSMA = SMA.calculate({ values: volumes, period: VOLUME_SMA_PERIOD });

// //   if (macd.length === 0 || rsi.length === 0 || ema.length === 0 || atr.length === 0 || volumeSMA.length === 0) {
// //     return null;
// //   }

// //   const lastClose = closes.at(-1);
// //   const lastEma = ema.at(-1);
// //   const lastMacd = macd.at(-1);
// //   const lastRsi = rsi.at(-1);
// //   const lastAtr = atr.at(-1);
// //   const lastVolume = volumes.at(-1);
// //   const lastVolumeSMA = volumeSMA.at(-1);

// //   let signal = 'HOLD';
// //   const volumeOkay = lastVolume > lastVolumeSMA;

// //   if (volumeOkay && lastClose > lastEma && lastMacd.MACD > lastMacd.signal) signal = 'BUY';
// //   else if (volumeOkay && lastClose < lastEma && lastMacd.MACD < lastMacd.signal) signal = 'SELL';

// //   return {
// //     signal, lastClose, lastEma, lastRsi, lastMacd,
// //     lastAtr, lastVolume, lastVolumeSMA
// //   };
// // }

// // // 1h candle data se EMA200 calculate karna
// // function analyzeData1h(candles) {
// //   const closes = candles.map(c => c.close);
// //   if (closes.length < EMA_1H_PERIOD) return null;
// //   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
// //   if (ema200.length === 0) return null;
// //   return ema200.at(-1);
// // }

// // // Target ya stoploss hit hua ya nahi check karna
// // function checkIfHit(price, trade) {
// //   if (!trade) return false;
// //   if (trade.signal === 'BUY') {
// //     if (price >= trade.target) return 'target';
// //     if (price <= trade.stoploss) return 'stoploss';
// //   } else if (trade.signal === 'SELL') {
// //     if (price <= trade.target) return 'target';
// //     if (price >= trade.stoploss) return 'stoploss';
// //   }
// //   return false;
// // }

// // // 1-minute pe naye signals check karna aur bhejna
// // async function checkAllSymbolsForUsers() {
// //   for (const chatId of USER_CHAT_IDS) {
// //     if (!activeTrades[chatId]) activeTrades[chatId] = {};

// //     // Agar user ke paas active trade hai to naye signal nahi bhejna
// //     if (Object.keys(activeTrades[chatId]).length > 0) {
// //       continue;
// //     }

// //     for (const symbol of SYMBOLS) {
// //       const candles15m = await fetchKlines(symbol, INTERVAL_15M);
// //       const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
// //       const currentPrice = await fetchCurrentPrice(symbol);

// //       if (!candles15m || !candles1h || !currentPrice) continue;

// //       const analysis15m = analyzeData15m(candles15m);
// //       if (!analysis15m) continue;

// //       const ema200_1h = analyzeData1h(candles1h);
// //       if (!ema200_1h) continue;

// //       let finalSignal = 'HOLD';
// //       if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
// //       else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

// //       if (finalSignal === 'HOLD') {
// //         continue;
// //       }

// //       let target, stoploss;
// //       if (finalSignal === 'BUY') {
// //         target = analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr;
// //         stoploss = analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
// //       } else {
// //         target = analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;
// //         stoploss = analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
// //       }

// //       const msg = `
// // 📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})
// // 📈 Signal: *${finalSignal}*
// // 💰 Entry: ${currentPrice.toFixed(2)}
// // 🎯 Target: ${target.toFixed(2)}
// // 🛑 Stoploss: ${stoploss.toFixed(2)}

// // 📊 RSI (15m): ${analysis15m.lastRsi.toFixed(2)}
// // 📉 EMA14 (15m): ${analysis15m.lastEma.toFixed(2)}
// // 📈 MACD (15m): ${analysis15m.lastMacd.MACD.toFixed(2)}
// // 🟡 Signal Line (15m): ${analysis15m.lastMacd.signal.toFixed(2)}
// // 📊 Volume (15m): ${analysis15m.lastVolume.toFixed(0)}
// // 📉 Avg Vol SMA20 (15m): ${analysis15m.lastVolumeSMA.toFixed(0)}
// // 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
// //       `;

// //       await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

// //       activeTrades[chatId][symbol] = {
// //         signal: finalSignal,
// //         entry: currentPrice,
// //         target,
// //         stoploss,
// //         atr: analysis15m.lastAtr
// //       };

// //       break; // Ek user ko sirf ek signal har 1 min me
// //     }
// //   }
// // }

// // // Har 1 minute me active trades monitor karna, target ya stoploss hit hua kya
// // async function monitorTrades() {
// //   for (const chatId of USER_CHAT_IDS) {
// //     const trades = activeTrades[chatId];
// //     if (!trades) continue;

// //     for (const symbol in trades) {
// //       const currentPrice = await fetchCurrentPrice(symbol);
// //       if (!currentPrice) continue;

// //       const trade = trades[symbol];
// //       const hit = checkIfHit(currentPrice, trade);
// //       if (hit) {
// //         let msg = '';
// //         if (hit === 'target') {
// //           msg = `✅ Target hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
// //         } else if (hit === 'stoploss') {
// //           msg = `⚠️ Stoploss hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
// //         }
// //         await bot.sendMessage(chatId, msg);

// //         // Trade close kar diya
// //         delete activeTrades[chatId][symbol];
// //       }
// //     }
// //   }
// // }

// // // Telegram start command se user add karna
// // bot.onText(/\/start/, (msg) => {
// //   const chatId = msg.chat.id;
// //   if (!USER_CHAT_IDS.includes(chatId)) {
// //     USER_CHAT_IDS.push(chatId);
// //     bot.sendMessage(chatId, "Welcome! Aapko ab signals milna shuru ho jayenge.");
// //   } else {
// //     bot.sendMessage(chatId, "Aap already registered hain.");
// //   }
// // });

// // // Agar user /stop bole to signals band karna
// // bot.onText(/\/stop/, (msg) => {
// //   const chatId = msg.chat.id;
// //   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
// //   delete activeTrades[chatId];
// //   bot.sendMessage(chatId, "Aapke signals band kar diye gaye hain. Jab bhi start karna ho, /start likhen.");
// // });

// // // Cron schedule - har 1 minute signal check karna
// // cron.schedule('*/1 * * * *', async () => {
// //   try {
// //     await checkAllSymbolsForUsers();
// //   } catch (err) {
// //     console.error('Error in checkAllSymbolsForUsers:', err);
// //   }
// // });

// // // Cron schedule - har 1 minute active trades monitor karna
// // cron.schedule('*/1 * * * *', async () => {
// //   try {
// //     await monitorTrades();
// //   } catch (err) {
// //     console.error('Error in monitorTrades:', err);
// //   }
// // });

// // console.log('Telegram trading signal bot chal raha hai...');











// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// const cron = require('node-cron');

// // === CONFIG ===
// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_TOKEN';
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

// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { symbol: tradeObject } }

// // Binance se candles data lana
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

// // Binance se current price lana
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

// // 15m candle data analysis
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

// // 1h candle data se EMA200 calculate karna
// function analyzeData1h(candles) {
//   const closes = candles.map(c => c.close);
//   if (closes.length < EMA_1H_PERIOD) return null;
//   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
//   if (ema200.length === 0) return null;
//   return ema200.at(-1);
// }

// // Target ya stoploss hit hua ya nahi check karna
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

// // 1-minute pe naye signals check karna aur bhejna
// async function checkAllSymbolsForUsers() {
//   for (const chatId of USER_CHAT_IDS) {
//     if (!activeTrades[chatId]) activeTrades[chatId] = {};

//     // Agar user ke paas active trade hai to naye signal nahi bhejna
//     if (Object.keys(activeTrades[chatId]).length > 0) {
//       continue;
//     }

//     for (const symbol of SYMBOLS) {
//       const candles15m = await fetchKlines(symbol, INTERVAL_15M);
//       const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
//       const currentPrice = await fetchCurrentPrice(symbol);

//       if (!candles15m || !candles1h || !currentPrice) continue;

//       const analysis15m = analyzeData15m(candles15m);
//       if (!analysis15m) continue;

//       const ema200_1h = analyzeData1h(candles1h);
//       if (!ema200_1h) continue;

//       let finalSignal = 'HOLD';
//       if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
//       else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

//       if (finalSignal === 'HOLD') {
//         continue;
//       }

//       let target, stoploss;
//       if (finalSignal === 'BUY') {
//         target = analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr;
//         stoploss = analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
//       } else {
//         target = analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;
//         stoploss = analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
//       }

//       const msg = `
// 📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})
// 📈 Signal: *${finalSignal}*
// 💰 Entry: ${currentPrice.toFixed(2)}
// 🎯 Target: ${target.toFixed(2)}
// 🛑 Stoploss: ${stoploss.toFixed(2)}

// 📊 RSI (15m): ${analysis15m.lastRsi.toFixed(2)}
// 📉 EMA14 (15m): ${analysis15m.lastEma.toFixed(2)}
// 📈 MACD (15m): ${analysis15m.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line (15m): ${analysis15m.lastMacd.signal.toFixed(2)}
// 📊 Volume (15m): ${analysis15m.lastVolume.toFixed(0)}
// 📉 Avg Vol SMA20 (15m): ${analysis15m.lastVolumeSMA.toFixed(0)}
// 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
//       `;

//       await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

//       activeTrades[chatId][symbol] = {
//         signal: finalSignal,
//         entry: currentPrice,
//         target,
//         stoploss,
//         atr: analysis15m.lastAtr
//       };

//       break; // Ek user ko sirf ek signal har 1 min me
//     }
//   }
// }

// // Har 1 minute me active trades monitor karna, target ya stoploss hit hua kya
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
//         let msg = '';
//         if (hit === 'target') {
//           msg = `✅ Target hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
//         } else if (hit === 'stoploss') {
//           msg = `⚠️ Stoploss hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
//         }
//         await bot.sendMessage(chatId, msg);

//         // Trade close kar diya
//         delete activeTrades[chatId][symbol];
//       }
//     }
//   }
// }

// // Telegram start command se user add karna
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) {
//     USER_CHAT_IDS.push(chatId);
//     bot.sendMessage(chatId, "Welcome! Aapko ab signals milna shuru ho jayenge.");
//   } else {
//     bot.sendMessage(chatId, "Aap already registered hain.");
//   }
// });

// // Agar user /stop bole to signals band karna
// bot.onText(/\/stop/, (msg) => {
//   const chatId = msg.chat.id;
//   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
//   delete activeTrades[chatId];
//   bot.sendMessage(chatId, "Aapke signals band kar diye gaye hain. Jab bhi start karna ho, /start likhen.");
// });

// // Cron schedule - har 1 minute signal check karna
// cron.schedule('*/1 * * * *', async () => {
//   try {
//     await checkAllSymbolsForUsers();
//   } catch (err) {
//     console.error('Error in checkAllSymbolsForUsers:', err);
//   }
// });

// // Cron schedule - har 1 minute active trades monitor karna
// cron.schedule('*/1 * * * *', async () => {
//   try {
//     await monitorTrades();
//   } catch (err) {
//     console.error('Error in monitorTrades:', err);
//   }
// });

// console.log('Telegram trading signal bot chal raha hai...');






// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// const cron = require('node-cron');

// // === CONFIG ===
// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_TOKEN';
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

// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { symbol: tradeObject } }

// // Binance se candles data lana
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

// // Binance se current price lana
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

// // 15m candle data analysis
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

// // 1h candle data se EMA200 calculate karna
// function analyzeData1h(candles) {
//   const closes = candles.map(c => c.close);
//   if (closes.length < EMA_1H_PERIOD) return null;
//   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
//   if (ema200.length === 0) return null;
//   return ema200.at(-1);
// }

// // Target ya stoploss hit hua ya nahi check karna
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

// // 1-minute pe naye signals check karna aur bhejna
// async function checkAllSymbolsForUsers() {
//   for (const chatId of USER_CHAT_IDS) {
//     if (!activeTrades[chatId]) activeTrades[chatId] = {};

//     // Agar user ke paas active trade hai to naye signal nahi bhejna
//     if (Object.keys(activeTrades[chatId]).length > 0) {
//       continue;
//     }

//     for (const symbol of SYMBOLS) {
//       const candles15m = await fetchKlines(symbol, INTERVAL_15M);
//       const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
//       const currentPrice = await fetchCurrentPrice(symbol);

//       if (!candles15m || !candles1h || !currentPrice) continue;

//       const analysis15m = analyzeData15m(candles15m);
//       if (!analysis15m) continue;

//       const ema200_1h = analyzeData1h(candles1h);
//       if (!ema200_1h) continue;

//       let finalSignal = 'HOLD';
//       if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
//       else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

//       if (finalSignal === 'HOLD') {
//         continue;
//       }

//       let target, stoploss;
//       if (finalSignal === 'BUY') {
//         target = analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr;
//         stoploss = analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
//       } else {
//         target = analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;
//         stoploss = analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
//       }

//       const msg = `
// 📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})
// 📈 Signal: *${finalSignal}*
// 💰 Entry: ${currentPrice.toFixed(2)}
// 🎯 Target: ${target.toFixed(2)}
// 🛑 Stoploss: ${stoploss.toFixed(2)}

// 📊 RSI (15m): ${analysis15m.lastRsi.toFixed(2)}
// 📉 EMA14 (15m): ${analysis15m.lastEma.toFixed(2)}
// 📈 MACD (15m): ${analysis15m.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line (15m): ${analysis15m.lastMacd.signal.toFixed(2)}
// 📊 Volume (15m): ${analysis15m.lastVolume.toFixed(0)}
// 📉 Avg Vol SMA20 (15m): ${analysis15m.lastVolumeSMA.toFixed(0)}
// 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
//       `;

//       await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

//       activeTrades[chatId][symbol] = {
//         signal: finalSignal,
//         entry: currentPrice,
//         target,
//         stoploss,
//         atr: analysis15m.lastAtr
//       };

//       break; // Ek user ko sirf ek signal har 1 min me
//     }
//   }
// }

// // Har 1 minute me active trades monitor karna, target ya stoploss hit hua kya
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
//         let msg = '';
//         if (hit === 'target') {
//           msg = `✅ Target hit for ${symbol}!\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nCurrent: ${currentPrice.toFixed(2)}`;
//         } else {
//           msg = `🛑 Stoploss hit for ${symbol}!\nEntry: ${trade.entry.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent: ${currentPrice.toFixed(2)}`;
//         }
//         await bot.sendMessage(chatId, msg);
//         delete activeTrades[chatId][symbol];
//       }
//     }
//   }
// }

// // Telegram commands
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);
//   bot.sendMessage(chatId, `Welcome! You will receive crypto trading signals for symbols:\n${SYMBOLS.join(', ')}`);
// });

// bot.onText(/\/stop/, (msg) => {
//   const chatId = msg.chat.id;
//   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
//   delete activeTrades[chatId];
//   bot.sendMessage(chatId, `You will no longer receive trading signals. To restart, send /start`);
// });

// // Debug command for current active trades
// bot.onText(/\/trades/, (msg) => {
//   const chatId = msg.chat.id;
//   const trades = activeTrades[chatId];
//   if (!trades || Object.keys(trades).length === 0) {
//     bot.sendMessage(chatId, `No active trades.`);
//   } else {
//     let reply = `Active trades:\n`;
//     for (const sym in trades) {
//       const t = trades[sym];
//       reply += `${sym}: Signal=${t.signal}, Entry=${t.entry.toFixed(2)}, Target=${t.target.toFixed(2)}, Stoploss=${t.stoploss.toFixed(2)}\n`;
//     }
//     bot.sendMessage(chatId, reply);
//   }
// });

// // === CRON JOBS ===
// // Har 1 minute me naye signals check karna (sirf jab active trades na ho)
// cron.schedule('* * * * *', async () => {
//   console.log('Checking new signals for users...');
//   try {
//     await checkAllSymbolsForUsers();
//   } catch (e) {
//     console.error('Error in checking signals:', e);
//   }
// });

// // Har 30 second me active trades monitor karna
// cron.schedule('*/30 * * * * *', async () => {
//   console.log('Monitoring active trades...');
//   try {
//     await monitorTrades();
//   } catch (e) {
//     console.error('Error in monitoring trades:', e);
//   }
// });

// console.log('Telegram crypto signal bot started...');






// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// const cron = require('node-cron');

// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_TOKEN';
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

// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { symbol: tradeObject } }

// // === Data Fetching ===
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

// // === Indicators ===
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

// // === Signal Generator ===
// async function checkAllSymbolsForUsers() {
//   for (const chatId of USER_CHAT_IDS) {
//     if (!activeTrades[chatId]) activeTrades[chatId] = {};

//     for (const symbol of SYMBOLS) {
//       if (activeTrades[chatId][symbol]) continue; // Skip if trade active

//       const [candles15m, candles1h, currentPrice] = await Promise.all([
//         fetchKlines(symbol, INTERVAL_15M),
//         fetchKlines(symbol, INTERVAL_1H, 300),
//         fetchCurrentPrice(symbol)
//       ]);

//       if (!candles15m || !candles1h || !currentPrice) continue;

//       const analysis15m = analyzeData15m(candles15m);
//       const ema200_1h = analyzeData1h(candles1h);
//       if (!analysis15m || !ema200_1h) continue;

//       let finalSignal = 'HOLD';
//       if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
//       else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

//       if (finalSignal === 'HOLD') continue;

//       let target, stoploss;
//       if (finalSignal === 'BUY') {
//         target = analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr;
//         stoploss = analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
//       } else {
//         target = analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;
//         stoploss = analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
//       }

//       const msg = `
// 📡 Crypto Signal - ${symbol}
// 🕒 Interval: 15m + 1h
// 📈 Signal: *${finalSignal}*
// 💰 Entry: ${currentPrice.toFixed(2)}
// 🎯 Target: ${target.toFixed(2)}
// 🛑 Stoploss: ${stoploss.toFixed(2)}

// 📊 RSI: ${analysis15m.lastRsi.toFixed(2)}
// 📉 EMA14: ${analysis15m.lastEma.toFixed(2)}
// 📈 MACD: ${analysis15m.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line: ${analysis15m.lastMacd.signal.toFixed(2)}
// 📊 Volume: ${analysis15m.lastVolume.toFixed(0)}
// 📉 Vol SMA20: ${analysis15m.lastVolumeSMA.toFixed(0)}
// 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
//       `;

//       await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

//       activeTrades[chatId][symbol] = {
//         signal: finalSignal,
//         entry: currentPrice,
//         target,
//         stoploss,
//         atr: analysis15m.lastAtr
//       };
//     }
//   }
// }

// // === Monitor Active Trades ===
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
//         let msg = '';
//         if (hit === 'target') {
//           msg = `✅ Target hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
//         } else {
//           msg = `⚠️ Stoploss hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
//         }
//         await bot.sendMessage(chatId, msg);
//         delete activeTrades[chatId][symbol];
//       }
//     }
//   }
// }

// // === Telegram Commands ===
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) {
//     USER_CHAT_IDS.push(chatId);
//     bot.sendMessage(chatId, "✅ Aapka signal subscription active ho gaya hai.");
//   } else {
//     bot.sendMessage(chatId, "🔄 Aap already registered hain.");
//   }
// });

// bot.onText(/\/stop/, (msg) => {
//   const chatId = msg.chat.id;
//   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
//   delete activeTrades[chatId];
//   bot.sendMessage(chatId, "🛑 Aapke signals band kar diye gaye hain.");
// });

// // === Cron Jobs ===
// cron.schedule('*/1 * * * *', async () => {
//   await checkAllSymbolsForUsers();
// });

// cron.schedule('*/1 * * * *', async () => {
//   await monitorTrades();
// });

// console.log('📊 Telegram Crypto Signal Bot started...');















// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// const cron = require('node-cron');

// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_TOKEN';
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

// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { symbol: tradeObject } }

// // === Data Fetching ===
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

// // === Indicators ===
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

// // === Signal Generator (BUY/SELL/HOLD) ===
// async function checkAllSymbolsForUsers() {
//   for (const chatId of USER_CHAT_IDS) {
//     if (!activeTrades[chatId]) activeTrades[chatId] = {};

//     for (const symbol of SYMBOLS) {
//       const [candles15m, candles1h, currentPrice] = await Promise.all([
//         fetchKlines(symbol, INTERVAL_15M),
//         fetchKlines(symbol, INTERVAL_1H, 300),
//         fetchCurrentPrice(symbol)
//       ]);

//       if (!candles15m || !candles1h || !currentPrice) continue;

//       const analysis15m = analyzeData15m(candles15m);
//       const ema200_1h = analyzeData1h(candles1h);
//       if (!analysis15m || !ema200_1h) continue;

//       let finalSignal = 'HOLD';
//       if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
//       else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

//       let target = 0, stoploss = 0;
//       if (finalSignal === 'BUY') {
//         target = analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr;
//         stoploss = analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
//       } else if (finalSignal === 'SELL') {
//         target = analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;
//         stoploss = analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
//       }

//       const msg = `
// 📡 *Crypto Signal - ${symbol}*
// 🕒 Interval: 15m + 1h
// 📈 Signal: *${finalSignal}*
// 💰 Entry: ${currentPrice.toFixed(2)}
// 🎯 Target: ${target ? target.toFixed(2) : '-'}
// 🛑 Stoploss: ${stoploss ? stoploss.toFixed(2) : '-'}

// 📊 RSI: ${analysis15m.lastRsi.toFixed(2)}
// 📉 EMA14: ${analysis15m.lastEma.toFixed(2)}
// 📈 MACD: ${analysis15m.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line: ${analysis15m.lastMacd.signal.toFixed(2)}
// 📊 Volume: ${analysis15m.lastVolume.toFixed(0)}
// 📉 Vol SMA20: ${analysis15m.lastVolumeSMA.toFixed(0)}
// 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
//       `;

//       await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

//       if (finalSignal !== 'HOLD') {
//         activeTrades[chatId][symbol] = {
//           signal: finalSignal,
//           entry: currentPrice,
//           target,
//           stoploss,
//           atr: analysis15m.lastAtr
//         };
//       }
//     }
//   }
// }

// // === Monitor Active Trades ===
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
//         let msg = '';
//         if (hit === 'target') {
//           msg = `✅ Target hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
//         } else {
//           msg = `⚠️ Stoploss hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
//         }
//         await bot.sendMessage(chatId, msg);
//         delete activeTrades[chatId][symbol];
//       }
//     }
//   }
// }

// // === Telegram Commands ===
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) {
//     USER_CHAT_IDS.push(chatId);
//     bot.sendMessage(chatId, "✅ Aapka signal subscription active ho gaya hai.");
//   } else {
//     bot.sendMessage(chatId, "🔄 Aap already registered hain.");
//   }
// });

// bot.onText(/\/stop/, (msg) => {
//   const chatId = msg.chat.id;
//   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
//   delete activeTrades[chatId];
//   bot.sendMessage(chatId, "🛑 Aapke signals band kar diye gaye hain.");
// });

// // === Cron Jobs ===
// cron.schedule('*/1 * * * *', async () => {
//   await checkAllSymbolsForUsers();
//   await monitorTrades();
// });

// console.log('📊 Telegram Crypto Signal Bot started...');



















// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// const cron = require('node-cron');

// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_TOKEN';
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

// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { symbol: tradeObject } }

// // === Data Fetching ===
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

// // === Indicators ===
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

// // === Signal Generator ===
// async function checkAllSymbolsForUsers() {
//   for (const chatId of USER_CHAT_IDS) {
//     if (!activeTrades[chatId]) activeTrades[chatId] = {};

//     for (const symbol of SYMBOLS) {
//       const [candles15m, candles1h, currentPrice] = await Promise.all([
//         fetchKlines(symbol, INTERVAL_15M),
//         fetchKlines(symbol, INTERVAL_1H, 300),
//         fetchCurrentPrice(symbol)
//       ]);

//       if (!candles15m || !candles1h || !currentPrice) continue;

//       const analysis15m = analyzeData15m(candles15m);
//       const ema200_1h = analyzeData1h(candles1h);
//       if (!analysis15m || !ema200_1h) continue;

//       let finalSignal = 'HOLD';
//       if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
//       else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

//       if (finalSignal === 'HOLD') {
//         await bot.sendMessage(chatId, `📊 *${symbol}* - Signal: *HOLD*`, { parse_mode: 'Markdown' });
//         continue;
//       }

//       const target = finalSignal === 'BUY'
//         ? analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr
//         : analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;

//       const stoploss = finalSignal === 'BUY'
//         ? analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr
//         : analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;

//       const msg = `
// 📡 *Crypto Signal - ${symbol}*
// 🕒 Interval: 15m + 1h
// 📈 Signal: *${finalSignal}*
// 💰 Entry: ${currentPrice.toFixed(2)}
// 🎯 Target: ${target.toFixed(2)}
// 🛑 Stoploss: ${stoploss.toFixed(2)}

// 📊 RSI: ${analysis15m.lastRsi.toFixed(2)}
// 📉 EMA14: ${analysis15m.lastEma.toFixed(2)}
// 📈 MACD: ${analysis15m.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line: ${analysis15m.lastMacd.signal.toFixed(2)}
// 📊 Volume: ${analysis15m.lastVolume.toFixed(0)}
// 📉 Vol SMA20: ${analysis15m.lastVolumeSMA.toFixed(0)}
// 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
//       `;
//       await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

//       activeTrades[chatId][symbol] = {
//         signal: finalSignal,
//         entry: currentPrice,
//         target,
//         stoploss,
//         atr: analysis15m.lastAtr
//       };
//     }
//   }
// }

// // === Monitor Trades ===
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
//         let msg = '';
//         if (hit === 'target') {
//           msg = `✅ *Target hit* for *${symbol}*!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\n🎯 Target: ${trade.target.toFixed(2)}\n🛑 Stoploss: ${trade.stoploss.toFixed(2)}\n📈 Current Price: ${currentPrice.toFixed(2)}`;
//         } else {
//           msg = `⚠️ *Stoploss hit* for *${symbol}*!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\n🎯 Target: ${trade.target.toFixed(2)}\n🛑 Stoploss: ${trade.stoploss.toFixed(2)}\n📉 Current Price: ${currentPrice.toFixed(2)}`;
//         }
//         await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
//         delete activeTrades[chatId][symbol];
//       }
//     }
//   }
// }

// // === Telegram Commands ===
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) {
//     USER_CHAT_IDS.push(chatId);
//     bot.sendMessage(chatId, "✅ Aapka signal subscription active ho gaya hai.");
//   } else {
//     bot.sendMessage(chatId, "🔄 Aap already registered hain.");
//   }
// });

// bot.onText(/\/stop/, (msg) => {
//   const chatId = msg.chat.id;
//   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
//   delete activeTrades[chatId];
//   bot.sendMessage(chatId, "🛑 Aapke signals band kar diye gaye hain.");
// });

// // === Cron Jobs ===
// cron.schedule('*/1 * * * *', async () => {
//   await checkAllSymbolsForUsers();
//   await monitorTrades();
// });

// console.log('📊 Telegram Crypto Signal Bot started...');






// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// const cron = require('node-cron');

// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_TOKEN_HERE';

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

// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { symbol: tradeObject } }

// // Fetch candlestick data from Binance
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

// // Fetch current price from Binance
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

// // Analyze 15m candles and calculate indicators
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

// // Analyze 1h candles for EMA 200
// function analyzeData1h(candles) {
//   const closes = candles.map(c => c.close);
//   if (closes.length < EMA_1H_PERIOD) return null;
//   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
//   return ema200.at(-1);
// }

// // Check if target or stoploss hit
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

// // Check all symbols and send signals to users
// async function checkAllSymbolsForUsers() {
//   for (const chatId of USER_CHAT_IDS) {
//     if (!activeTrades[chatId]) activeTrades[chatId] = {};

//     for (const symbol of SYMBOLS) {
//       const [candles15m, candles1h, currentPrice] = await Promise.all([
//         fetchKlines(symbol, INTERVAL_15M),
//         fetchKlines(symbol, INTERVAL_1H, 300),
//         fetchCurrentPrice(symbol)
//       ]);

//       if (!candles15m || !candles1h || !currentPrice) continue;

//       const analysis15m = analyzeData15m(candles15m);
//       const ema200_1h = analyzeData1h(candles1h);
//       if (!analysis15m || !ema200_1h) continue;

//       let finalSignal = 'HOLD';
//       if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
//       else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

//       if (finalSignal === 'HOLD') {
//         await bot.sendMessage(chatId, `📊 *${symbol}* - Signal: *HOLD*`, { parse_mode: 'Markdown' });
//         continue;
//       }

//       const target = finalSignal === 'BUY'
//         ? analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr
//         : analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;

//       const stoploss = finalSignal === 'BUY'
//         ? analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr
//         : analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;

//       const msg = `
// 📡 *Crypto Signal - ${symbol}*
// 🕒 Interval: 15m + 1h
// 📈 Signal: *${finalSignal}*
// 💰 Entry: ${currentPrice.toFixed(2)}
// 🎯 Target: ${target.toFixed(2)}
// 🛑 Stoploss: ${stoploss.toFixed(2)}

// 📊 RSI: ${analysis15m.lastRsi.toFixed(2)}
// 📉 EMA14: ${analysis15m.lastEma.toFixed(2)}
// 📈 MACD: ${analysis15m.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line: ${analysis15m.lastMacd.signal.toFixed(2)}
// 📊 Volume: ${analysis15m.lastVolume.toFixed(0)}
// 📉 Vol SMA20: ${analysis15m.lastVolumeSMA.toFixed(0)}
// 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
//       `;
//       await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

//       activeTrades[chatId][symbol] = {
//         signal: finalSignal,
//         entry: currentPrice,
//         target,
//         stoploss,
//         atr: analysis15m.lastAtr
//       };
//     }
//   }
// }

// // Monitor active trades and send alerts if target or stoploss hit
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
//         let msg = '';
//         if (hit === 'target') {
//           msg = `✅ *Target hit* for *${symbol}*!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\n🎯 Target: ${trade.target.toFixed(2)}\n🛑 Stoploss: ${trade.stoploss.toFixed(2)}\n📈 Current Price: ${currentPrice.toFixed(2)}`;
//         } else {
//           msg = `⚠️ *Stoploss hit* for *${symbol}*!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\n🎯 Target: ${trade.target.toFixed(2)}\n🛑 Stoploss: ${trade.stoploss.toFixed(2)}\n📉 Current Price: ${currentPrice.toFixed(2)}`;
//         }
//         await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
//         delete activeTrades[chatId][symbol];
//       }
//     }
//   }
// }

// // Telegram bot commands
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) {
//     USER_CHAT_IDS.push(chatId);
//     bot.sendMessage(chatId, "✅ Aapka signal subscription active ho gaya hai.");
//   } else {
//     bot.sendMessage(chatId, "🔄 Aap already registered hain.");
//   }
// });

// bot.onText(/\/stop/, (msg) => {
//   const chatId = msg.chat.id;
//   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
//   delete activeTrades[chatId];
//   bot.sendMessage(chatId, "🛑 Aapke signals band kar diye gaye hain.");
// });

// // Run the checking and monitoring every 1 minute
// cron.schedule('*/1 * * * *', async () => {
//   try {
//     await checkAllSymbolsForUsers();
//     await monitorTrades();
//   } catch (err) {
//     console.error('Error in scheduled task:', err.message);
//   }
// });

// console.log('📊 Telegram Crypto Signal Bot started and running every 1 minute...');
