// // // // // require('dotenv').config();
// // // // // const axios = require('axios');
// // // // // const TelegramBot = require('node-telegram-bot-api');
// // // // // const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// // // // // const cron = require('node-cron');

// // // // // // === CONFIG ===
// // // // // const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_TOKEN';
// // // // // const SYMBOLS = [
// // // // //   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
// // // // //   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
// // // // //   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
// // // // //   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
// // // // //   'SHIBUSDT'
// // // // // ];
// // // // // const INTERVAL_15M = '15m';
// // // // // const INTERVAL_1H = '1h';
// // // // // const TARGET_MULTIPLIER = 1.5;
// // // // // const STOPLOSS_MULTIPLIER = 1.0;
// // // // // const VOLUME_SMA_PERIOD = 20;
// // // // // const EMA_1H_PERIOD = 200;

// // // // // const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
// // // // // let USER_CHAT_IDS = [];
// // // // // let activeTrades = {};

// // // // // let symbolIndex = 0; // To rotate through symbols every minute

// // // // // async function fetchKlines(symbol, interval, limit = 100) {
// // // // //   try {
// // // // //     const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
// // // // //     const res = await axios.get(url);
// // // // //     return res.data.map(c => ({
// // // // //       open: parseFloat(c[1]),
// // // // //       high: parseFloat(c[2]),
// // // // //       low: parseFloat(c[3]),
// // // // //       close: parseFloat(c[4]),
// // // // //       volume: parseFloat(c[5]),
// // // // //       time: c[0]
// // // // //     }));
// // // // //   } catch (err) {
// // // // //     console.error(`Error fetching klines for ${symbol} (${interval}):`, err.message);
// // // // //     return null;
// // // // //   }
// // // // // }

// // // // // async function fetchCurrentPrice(symbol) {
// // // // //   try {
// // // // //     const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
// // // // //     const res = await axios.get(url);
// // // // //     return parseFloat(res.data.price);
// // // // //   } catch (err) {
// // // // //     console.error(`Error fetching current price for ${symbol}:`, err.message);
// // // // //     return null;
// // // // //   }
// // // // // }

// // // // // function analyzeData15m(candles) {
// // // // //   const closes = candles.map(c => c.close);
// // // // //   const highs = candles.map(c => c.high);
// // // // //   const lows = candles.map(c => c.low);
// // // // //   const volumes = candles.map(c => c.volume);

// // // // //   const rsi = RSI.calculate({ values: closes, period: 14 });
// // // // //   const ema = EMA.calculate({ values: closes, period: 14 });
// // // // //   const macd = MACD.calculate({
// // // // //     values: closes,
// // // // //     fastPeriod: 12,
// // // // //     slowPeriod: 26,
// // // // //     signalPeriod: 9,
// // // // //     SimpleMAOscillator: false,
// // // // //     SimpleMASignal: false
// // // // //   });
// // // // //   const atr = ATR.calculate({ high: highs, low: lows, close: closes, period: 14 });
// // // // //   const volumeSMA = SMA.calculate({ values: volumes, period: VOLUME_SMA_PERIOD });

// // // // //   if (macd.length === 0 || rsi.length === 0 || ema.length === 0 || atr.length === 0 || volumeSMA.length === 0) {
// // // // //     return null;
// // // // //   }

// // // // //   const lastClose = closes.at(-1);
// // // // //   const lastEma = ema.at(-1);
// // // // //   const lastMacd = macd.at(-1);
// // // // //   const lastRsi = rsi.at(-1);
// // // // //   const lastAtr = atr.at(-1);
// // // // //   const lastVolume = volumes.at(-1);
// // // // //   const lastVolumeSMA = volumeSMA.at(-1);

// // // // //   let signal = 'HOLD';
// // // // //   const volumeOkay = lastVolume > lastVolumeSMA;

// // // // //   if (volumeOkay && lastClose > lastEma && lastMacd.MACD > lastMacd.signal) signal = 'BUY';
// // // // //   else if (volumeOkay && lastClose < lastEma && lastMacd.MACD < lastMacd.signal) signal = 'SELL';

// // // // //   return {
// // // // //     signal, lastClose, lastEma, lastRsi, lastMacd,
// // // // //     lastAtr, lastVolume, lastVolumeSMA
// // // // //   };
// // // // // }

// // // // // function analyzeData1h(candles) {
// // // // //   const closes = candles.map(c => c.close);
// // // // //   if (closes.length < EMA_1H_PERIOD) return null;
// // // // //   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
// // // // //   if (ema200.length === 0) return null;
// // // // //   return ema200.at(-1);
// // // // // }

// // // // // function checkIfHit(price, trade) {
// // // // //   if (!trade) return false;
// // // // //   if (trade.signal === 'BUY') {
// // // // //     if (price >= trade.target) return 'target';
// // // // //     if (price <= trade.stoploss) return 'stoploss';
// // // // //   } else if (trade.signal === 'SELL') {
// // // // //     if (price <= trade.target) return 'target';
// // // // //     if (price >= trade.stoploss) return 'stoploss';
// // // // //   }
// // // // //   return false;
// // // // // }

// // // // // // === ROTATING SIGNAL CHECK ===
// // // // // async function checkNextSymbol() {
// // // // //   const symbol = SYMBOLS[symbolIndex];
// // // // //   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

// // // // //   const candles15m = await fetchKlines(symbol, INTERVAL_15M);
// // // // //   const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300); // 300 for enough data for 200 EMA
// // // // //   const currentPrice = await fetchCurrentPrice(symbol);
// // // // //   if (!candles15m || !candles1h || !currentPrice) return;

// // // // //   const analysis15m = analyzeData15m(candles15m);
// // // // //   if (!analysis15m || analysis15m.signal === 'HOLD') return;

// // // // //   const ema200_1h = analyzeData1h(candles1h);
// // // // //   if (!ema200_1h) return;

// // // // //   // Confirm trend on 1H EMA 200
// // // // //   let finalSignal = 'HOLD';
// // // // //   if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
// // // // //   else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

// // // // //   if (finalSignal === 'HOLD') return; // No confirmed trend

// // // // //   // Calculate target and stoploss
// // // // //   let target = null, stoploss = null;
// // // // //   if (finalSignal === 'BUY') {
// // // // //     target = analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr;
// // // // //     stoploss = analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
// // // // //   } else if (finalSignal === 'SELL') {
// // // // //     target = analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;
// // // // //     stoploss = analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
// // // // //   }

// // // // //   for (const chatId of USER_CHAT_IDS) {
// // // // //     if (!activeTrades[chatId]) activeTrades[chatId] = {};

// // // // //     const existing = activeTrades[chatId][symbol];
// // // // //     if (existing) continue;

// // // // //     const msg = `
// // // // // 📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})
// // // // // 📈 Signal: ${finalSignal}
// // // // // 💰 Entry: ${currentPrice.toFixed(2)}
// // // // // 🎯 Target: ${target.toFixed(2)}
// // // // // 🛑 Stoploss: ${stoploss.toFixed(2)}

// // // // // 📊 RSI (15m): ${analysis15m.lastRsi.toFixed(2)}
// // // // // 📉 EMA14 (15m): ${analysis15m.lastEma.toFixed(2)}
// // // // // 📈 MACD (15m): ${analysis15m.lastMacd.MACD.toFixed(2)}
// // // // // 🟡 Signal Line (15m): ${analysis15m.lastMacd.signal.toFixed(2)}
// // // // // 📊 Volume (15m): ${analysis15m.lastVolume.toFixed(0)}
// // // // // 📉 Avg Vol SMA20 (15m): ${analysis15m.lastVolumeSMA.toFixed(0)}
// // // // // 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
// // // // //     `;

// // // // //     await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

// // // // //     activeTrades[chatId][symbol] = {
// // // // //       signal: finalSignal,
// // // // //       entry: currentPrice,
// // // // //       target,
// // // // //       stoploss,
// // // // //       atr: analysis15m.lastAtr
// // // // //     };
// // // // //   }
// // // // // }

// // // // // // === TRADE MONITORING ===
// // // // // async function monitorTrades() {
// // // // //   for (const chatId of USER_CHAT_IDS) {
// // // // //     const trades = activeTrades[chatId];
// // // // //     if (!trades) continue;

// // // // //     for (const symbol in trades) {
// // // // //       const trade = trades[symbol];
// // // // //       const price = await fetchCurrentPrice(symbol);
// // // // //       if (!price) continue;

// // // // //       const hit = checkIfHit(price, trade);
// // // // //       if (hit) {
// // // // //         let message = `⚠️ Trade Update for ${symbol}:\n`;
// // // // //         if (hit === 'target') message += `🎯 Target hit at price ${price.toFixed(2)}! Congratulations!`;
// // // // //         else if (hit === 'stoploss') message += `🛑 Stoploss hit at price ${price.toFixed(2)}! Consider exiting!`;

// // // // //         await bot.sendMessage(chatId, message);
// // // // //         delete activeTrades[chatId][symbol];
// // // // //       }
// // // // //     }
// // // // //   }
// // // // // }

// // // // // // === TELEGRAM BOT HANDLERS ===
// // // // // bot.onText(/\/start/, async (msg) => {
// // // // //   const chatId = msg.chat.id;
// // // // //   if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);
// // // // //   await bot.sendMessage(chatId, `Hello! Welcome to Crypto Signal Bot.\nYou will receive buy/sell signals every minute for top cryptos.`);
// // // // // });

// // // // // bot.onText(/\/help/, async (msg) => {
// // // // //   const chatId = msg.chat.id;
// // // // //   await bot.sendMessage(chatId, `Commands available:\n/start - Start receiving signals\n/stop - Stop receiving signals\n/status - Show active trades`);
// // // // // });

// // // // // bot.onText(/\/stop/, async (msg) => {
// // // // //   const chatId = msg.chat.id;
// // // // //   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
// // // // //   delete activeTrades[chatId];
// // // // //   await bot.sendMessage(chatId, `You have unsubscribed from signals. Send /start to subscribe again.`);
// // // // // });

// // // // // bot.onText(/\/status/, async (msg) => {
// // // // //   const chatId = msg.chat.id;
// // // // //   if (!activeTrades[chatId] || Object.keys(activeTrades[chatId]).length === 0) {
// // // // //     await bot.sendMessage(chatId, `No active trades currently.`);
// // // // //     return;
// // // // //   }
// // // // //   let response = '📝 Active Trades:\n';
// // // // //   for (const symbol in activeTrades[chatId]) {
// // // // //     const t = activeTrades[chatId][symbol];
// // // // //     response += `${symbol} - Signal: ${t.signal}, Entry: ${t.entry.toFixed(2)}, Target: ${t.target.toFixed(2)}, Stoploss: ${t.stoploss.toFixed(2)}\n`;
// // // // //   }
// // // // //   await bot.sendMessage(chatId, response);
// // // // // });

// // // // // // === CRON JOBS ===
// // // // // // Check next symbol every 60 seconds (rotating)
// // // // // cron.schedule('*/1 * * * *', () => {
// // // // //   checkNextSymbol().catch(console.error);
// // // // // });

// // // // // // Monitor active trades every 30 seconds
// // // // // cron.schedule('*/30 * * * * *', () => {
// // // // //   monitorTrades().catch(console.error);
// // // // // });

// // // // // console.log('Crypto Signal Telegram Bot started...');














// // // // require('dotenv').config();
// // // // const axios = require('axios');
// // // // const TelegramBot = require('node-telegram-bot-api');
// // // // const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// // // // const cron = require('node-cron');

// // // // // === CONFIG ===
// // // // const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_TOKEN';
// // // // const SYMBOLS = [
// // // //   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
// // // //   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
// // // //   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
// // // //   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
// // // //   'SHIBUSDT'
// // // // ];
// // // // const INTERVAL_15M = '15m';
// // // // const INTERVAL_1H = '1h';
// // // // const TARGET_MULTIPLIER = 1.5;
// // // // const STOPLOSS_MULTIPLIER = 1.0;
// // // // const VOLUME_SMA_PERIOD = 20;
// // // // const EMA_1H_PERIOD = 200;

// // // // const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
// // // // let USER_CHAT_IDS = [];
// // // // let activeTrades = {};

// // // // let symbolIndex = 0; // To rotate through symbols every minute

// // // // async function fetchKlines(symbol, interval, limit = 100) {
// // // //   try {
// // // //     const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
// // // //     const res = await axios.get(url);
// // // //     return res.data.map(c => ({
// // // //       open: parseFloat(c[1]),
// // // //       high: parseFloat(c[2]),
// // // //       low: parseFloat(c[3]),
// // // //       close: parseFloat(c[4]),
// // // //       volume: parseFloat(c[5]),
// // // //       time: c[0]
// // // //     }));
// // // //   } catch (err) {
// // // //     console.error(`Error fetching klines for ${symbol} (${interval}):`, err.message);
// // // //     return null;
// // // //   }
// // // // }

// // // // async function fetchCurrentPrice(symbol) {
// // // //   try {
// // // //     const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
// // // //     const res = await axios.get(url);
// // // //     return parseFloat(res.data.price);
// // // //   } catch (err) {
// // // //     console.error(`Error fetching current price for ${symbol}:`, err.message);
// // // //     return null;
// // // //   }
// // // // }

// // // // function analyzeData15m(candles) {
// // // //   const closes = candles.map(c => c.close);
// // // //   const highs = candles.map(c => c.high);
// // // //   const lows = candles.map(c => c.low);
// // // //   const volumes = candles.map(c => c.volume);

// // // //   const rsi = RSI.calculate({ values: closes, period: 14 });
// // // //   const ema = EMA.calculate({ values: closes, period: 14 });
// // // //   const macd = MACD.calculate({
// // // //     values: closes,
// // // //     fastPeriod: 12,
// // // //     slowPeriod: 26,
// // // //     signalPeriod: 9,
// // // //     SimpleMAOscillator: false,
// // // //     SimpleMASignal: false
// // // //   });
// // // //   const atr = ATR.calculate({ high: highs, low: lows, close: closes, period: 14 });
// // // //   const volumeSMA = SMA.calculate({ values: volumes, period: VOLUME_SMA_PERIOD });

// // // //   if (macd.length === 0 || rsi.length === 0 || ema.length === 0 || atr.length === 0 || volumeSMA.length === 0) {
// // // //     return null;
// // // //   }

// // // //   const lastClose = closes.at(-1);
// // // //   const lastEma = ema.at(-1);
// // // //   const lastMacd = macd.at(-1);
// // // //   const lastRsi = rsi.at(-1);
// // // //   const lastAtr = atr.at(-1);
// // // //   const lastVolume = volumes.at(-1);
// // // //   const lastVolumeSMA = volumeSMA.at(-1);

// // // //   let signal = 'HOLD';
// // // //   const volumeOkay = lastVolume > lastVolumeSMA;

// // // //   if (volumeOkay && lastClose > lastEma && lastMacd.MACD > lastMacd.signal) signal = 'BUY';
// // // //   else if (volumeOkay && lastClose < lastEma && lastMacd.MACD < lastMacd.signal) signal = 'SELL';

// // // //   return {
// // // //     signal, lastClose, lastEma, lastRsi, lastMacd,
// // // //     lastAtr, lastVolume, lastVolumeSMA
// // // //   };
// // // // }

// // // // function analyzeData1h(candles) {
// // // //   const closes = candles.map(c => c.close);
// // // //   if (closes.length < EMA_1H_PERIOD) return null;
// // // //   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
// // // //   if (ema200.length === 0) return null;
// // // //   return ema200.at(-1);
// // // // }

// // // // function checkIfHit(price, trade) {
// // // //   if (!trade) return false;
// // // //   if (trade.signal === 'BUY') {
// // // //     if (price >= trade.target) return 'target';
// // // //     if (price <= trade.stoploss) return 'stoploss';
// // // //   } else if (trade.signal === 'SELL') {
// // // //     if (price <= trade.target) return 'target';
// // // //     if (price >= trade.stoploss) return 'stoploss';
// // // //   }
// // // //   return false;
// // // // }

// // // // // === ROTATING SIGNAL CHECK ===
// // // // async function checkNextSymbol() {
// // // //   const symbol = SYMBOLS[symbolIndex];
// // // //   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

// // // //   const candles15m = await fetchKlines(symbol, INTERVAL_15M);
// // // //   const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300); // 300 for enough data for 200 EMA
// // // //   const currentPrice = await fetchCurrentPrice(symbol);
// // // //   if (!candles15m || !candles1h || !currentPrice) return;

// // // //   const analysis15m = analyzeData15m(candles15m);
// // // //   if (!analysis15m) return;

// // // //   const ema200_1h = analyzeData1h(candles1h);
// // // //   if (!ema200_1h) return;

// // // //   // Confirm trend on 1H EMA 200
// // // //   let finalSignal = 'HOLD';
// // // //   if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
// // // //   else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

// // // //   // Calculate target and stoploss only if BUY or SELL
// // // //   let target = null, stoploss = null;
// // // //   if (finalSignal === 'BUY') {
// // // //     target = analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr;
// // // //     stoploss = analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
// // // //   } else if (finalSignal === 'SELL') {
// // // //     target = analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;
// // // //     stoploss = analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
// // // //   }

// // // //   for (const chatId of USER_CHAT_IDS) {
// // // //     if (!activeTrades[chatId]) activeTrades[chatId] = {};

// // // //     // If already have active trade for symbol, skip sending new signal (optional)
// // // //     const existing = activeTrades[chatId][symbol];

// // // //     if (finalSignal === 'HOLD') {
// // // //       // Send HOLD message only if no active trade and not already notified HOLD recently
// // // //       if (!existing) {
// // // //         const holdMsg = `
// // // // 📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})
// // // // 🟡 Signal: HOLD (No clear BUY/SELL signal currently)
// // // // 📊 RSI (15m): ${analysis15m.lastRsi.toFixed(2)}
// // // // 📉 EMA14 (15m): ${analysis15m.lastEma.toFixed(2)}
// // // // 📈 MACD (15m): ${analysis15m.lastMacd.MACD.toFixed(2)}
// // // // 🟡 Signal Line (15m): ${analysis15m.lastMacd.signal.toFixed(2)}
// // // // 📊 Volume (15m): ${analysis15m.lastVolume.toFixed(0)}
// // // // 📉 Avg Vol SMA20 (15m): ${analysis15m.lastVolumeSMA.toFixed(0)}
// // // // 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
// // // //         `;
// // // //         await bot.sendMessage(chatId, holdMsg, { parse_mode: 'Markdown' });
// // // //       }
// // // //       continue;
// // // //     }

// // // //     // If there's already an active trade for this symbol, skip sending again
// // // //     if (existing) continue;

// // // //     // Send BUY or SELL signal
// // // //     const msg = `
// // // // 📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})
// // // // 📈 Signal: ${finalSignal}
// // // // 💰 Entry: ${currentPrice.toFixed(2)}
// // // // 🎯 Target: ${target.toFixed(2)}
// // // // 🛑 Stoploss: ${stoploss.toFixed(2)}

// // // // 📊 RSI (15m): ${analysis15m.lastRsi.toFixed(2)}
// // // // 📉 EMA14 (15m): ${analysis15m.lastEma.toFixed(2)}
// // // // 📈 MACD (15m): ${analysis15m.lastMacd.MACD.toFixed(2)}
// // // // 🟡 Signal Line (15m): ${analysis15m.lastMacd.signal.toFixed(2)}
// // // // 📊 Volume (15m): ${analysis15m.lastVolume.toFixed(0)}
// // // // 📉 Avg Vol SMA20 (15m): ${analysis15m.lastVolumeSMA.toFixed(0)}
// // // // 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
// // // //     `;

// // // //     await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

// // // //     activeTrades[chatId][symbol] = {
// // // //       signal: finalSignal,
// // // //       entry: currentPrice,
// // // //       target,
// // // //       stoploss,
// // // //       atr: analysis15m.lastAtr
// // // //     };
// // // //   }
// // // // }

// // // // // === TRADE MONITORING ===
// // // // async function monitorTrades() {
// // // //   for (const chatId of USER_CHAT_IDS) {
// // // //     const trades = activeTrades[chatId];
// // // //     if (!trades) continue;

// // // //     for (const symbol in trades) {
// // // //       const trade = trades[symbol];
// // // //       const price = await fetchCurrentPrice(symbol);
// // // //       if (!price) continue;

// // // //       const hit = checkIfHit(price, trade);
// // // //       if (hit) {
// // // //         let message = `⚠️ Trade Update for ${symbol}:\n`;
// // // //         if (hit === 'target') message += `🎯 Target hit at price ${price.toFixed(2)}! Congratulations!`;
// // // //         else if (hit === 'stoploss') message += `🛑 Stoploss hit at price ${price.toFixed(2)}! Consider exiting!`;

// // // //         await bot.sendMessage(chatId, message);
// // // //         delete activeTrades[chatId][symbol];
// // // //       }
// // // //     }
// // // //   }
// // // // }

// // // // // === TELEGRAM BOT HANDLERS ===
// // // // bot.onText(/\/start/, async (msg) => {
// // // //   const chatId = msg.chat.id;
// // // //   if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);
// // // //   await bot.sendMessage(chatId, `Hello! Welcome to Crypto Signal Bot.\nYou will receive buy/sell/hold signals every minute for top cryptos.`);
// // // // });

// // // // bot.onText(/\/help/, async (msg) => {
// // // //   const chatId = msg.chat.id;
// // // //   await bot.sendMessage(chatId, `Commands available:\n/start - Start receiving signals\n/stop - Stop receiving signals\n/status - Show active trades`);
// // // // });

// // // // bot.onText(/\/stop/, async (msg) => {
// // // //   const chatId = msg.chat.id;
// // // //   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
// // // //   delete activeTrades[chatId];
// // // //   await bot.sendMessage(chatId, `You have unsubscribed from signals. Send /start to subscribe again.`);
// // // // });

// // // // bot.onText(/\/status/, async (msg) => {
// // // //   const chatId = msg.chat.id;
// // // //   if (!activeTrades[chatId] || Object.keys(activeTrades[chatId]).length === 0) {
// // // //     await bot.sendMessage(chatId, `No active trades currently.`);
// // // //     return;
// // // //   }
// // // //   let response = '📝 Active Trades:\n';
// // // //   for (const symbol in activeTrades[chatId]) {
// // // //     const t = activeTrades[chatId][symbol];
// // // //     response += `${symbol} - Signal: ${t.signal}, Entry: ${t.entry.toFixed(2)}, Target: ${t.target.toFixed(2)}, Stoploss: ${t.stoploss.toFixed(2)}\n`;
// // // //   }
// // // //   await bot.sendMessage(chatId, response);
// // // // });

// // // // // === CRON JOBS ===
// // // // // Check next symbol every 60 seconds (rotating)
// // // // cron.schedule('*/1 * * * *', () => {
// // // //   checkNextSymbol().catch(console.error);
// // // // });

// // // // // Monitor active trades every 30 seconds
// // // // cron.schedule('*/30 * * * * *', () => {
// // // //   monitorTrades().catch(console.error);
// // // // });

// // // // console.log('Crypto Signal Telegram Bot started...');










// // // // require('dotenv').config();
// // // // const axios = require('axios');
// // // // const TelegramBot = require('node-telegram-bot-api');
// // // // const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// // // // const cron = require('node-cron');

// // // // // === CONFIG ===
// // // // const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_TOKEN';
// // // // const SYMBOLS = [
// // // //   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
// // // //   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
// // // //   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
// // // //   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
// // // //   'SHIBUSDT'
// // // // ];
// // // // const INTERVAL_15M = '15m';
// // // // const INTERVAL_1H = '1h';
// // // // const TARGET_MULTIPLIER = 1.5;
// // // // const STOPLOSS_MULTIPLIER = 1.0;
// // // // const VOLUME_SMA_PERIOD = 20;
// // // // const EMA_1H_PERIOD = 200;

// // // // const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
// // // // let USER_CHAT_IDS = [];
// // // // let activeTrades = {};

// // // // let symbolIndex = 0; // To rotate through symbols every minute

// // // // async function fetchKlines(symbol, interval, limit = 100) {
// // // //   try {
// // // //     const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
// // // //     const res = await axios.get(url);
// // // //     return res.data.map(c => ({
// // // //       open: parseFloat(c[1]),
// // // //       high: parseFloat(c[2]),
// // // //       low: parseFloat(c[3]),
// // // //       close: parseFloat(c[4]),
// // // //       volume: parseFloat(c[5]),
// // // //       time: c[0]
// // // //     }));
// // // //   } catch (err) {
// // // //     console.error(`Error fetching klines for ${symbol} (${interval}):`, err.message);
// // // //     return null;
// // // //   }
// // // // }

// // // // async function fetchCurrentPrice(symbol) {
// // // //   try {
// // // //     const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
// // // //     const res = await axios.get(url);
// // // //     return parseFloat(res.data.price);
// // // //   } catch (err) {
// // // //     console.error(`Error fetching current price for ${symbol}:`, err.message);
// // // //     return null;
// // // //   }
// // // // }

// // // // function analyzeData15m(candles) {
// // // //   const closes = candles.map(c => c.close);
// // // //   const highs = candles.map(c => c.high);
// // // //   const lows = candles.map(c => c.low);
// // // //   const volumes = candles.map(c => c.volume);

// // // //   const rsi = RSI.calculate({ values: closes, period: 14 });
// // // //   const ema = EMA.calculate({ values: closes, period: 14 });
// // // //   const macd = MACD.calculate({
// // // //     values: closes,
// // // //     fastPeriod: 12,
// // // //     slowPeriod: 26,
// // // //     signalPeriod: 9,
// // // //     SimpleMAOscillator: false,
// // // //     SimpleMASignal: false
// // // //   });
// // // //   const atr = ATR.calculate({ high: highs, low: lows, close: closes, period: 14 });
// // // //   const volumeSMA = SMA.calculate({ values: volumes, period: VOLUME_SMA_PERIOD });

// // // //   if (macd.length === 0 || rsi.length === 0 || ema.length === 0 || atr.length === 0 || volumeSMA.length === 0) {
// // // //     return null;
// // // //   }

// // // //   const lastClose = closes.at(-1);
// // // //   const lastEma = ema.at(-1);
// // // //   const lastMacd = macd.at(-1);
// // // //   const lastRsi = rsi.at(-1);
// // // //   const lastAtr = atr.at(-1);
// // // //   const lastVolume = volumes.at(-1);
// // // //   const lastVolumeSMA = volumeSMA.at(-1);

// // // //   let signal = 'HOLD';
// // // //   const volumeOkay = lastVolume > lastVolumeSMA;

// // // //   if (volumeOkay && lastClose > lastEma && lastMacd.MACD > lastMacd.signal) signal = 'BUY';
// // // //   else if (volumeOkay && lastClose < lastEma && lastMacd.MACD < lastMacd.signal) signal = 'SELL';

// // // //   return {
// // // //     signal, lastClose, lastEma, lastRsi, lastMacd,
// // // //     lastAtr, lastVolume, lastVolumeSMA
// // // //   };
// // // // }

// // // // function analyzeData1h(candles) {
// // // //   const closes = candles.map(c => c.close);
// // // //   if (closes.length < EMA_1H_PERIOD) return null;
// // // //   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
// // // //   if (ema200.length === 0) return null;
// // // //   return ema200.at(-1);
// // // // }

// // // // function checkIfHit(price, trade) {
// // // //   if (!trade) return false;
// // // //   if (trade.signal === 'BUY') {
// // // //     if (price >= trade.target) return 'target';
// // // //     if (price <= trade.stoploss) return 'stoploss';
// // // //   } else if (trade.signal === 'SELL') {
// // // //     if (price <= trade.target) return 'target';
// // // //     if (price >= trade.stoploss) return 'stoploss';
// // // //   }
// // // //   return false;
// // // // }

// // // // // === ROTATING SIGNAL CHECK ===
// // // // async function checkNextSymbol() {
// // // //   const symbol = SYMBOLS[symbolIndex];
// // // //   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

// // // //   // For each user, check if already active trade on this symbol
// // // //   // If yes, skip signal sending for this symbol until trade is closed
// // // //   for (const chatId of USER_CHAT_IDS) {
// // // //     if (activeTrades[chatId] && activeTrades[chatId][symbol]) {
// // // //       // Trade active for this symbol and user, skip checking/sending new signal
// // // //       return;
// // // //     }
// // // //   }

// // // //   const candles15m = await fetchKlines(symbol, INTERVAL_15M);
// // // //   const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300); // 300 for enough data for 200 EMA
// // // //   const currentPrice = await fetchCurrentPrice(symbol);
// // // //   if (!candles15m || !candles1h || !currentPrice) return;

// // // //   const analysis15m = analyzeData15m(candles15m);
// // // //   if (!analysis15m || analysis15m.signal === 'HOLD') return;

// // // //   const ema200_1h = analyzeData1h(candles1h);
// // // //   if (!ema200_1h) return;

// // // //   // Confirm trend on 1H EMA 200
// // // //   let finalSignal = 'HOLD';
// // // //   if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
// // // //   else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

// // // //   if (finalSignal === 'HOLD') return; // No confirmed trend

// // // //   // Calculate target and stoploss
// // // //   let target = null, stoploss = null;
// // // //   if (finalSignal === 'BUY') {
// // // //     target = analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr;
// // // //     stoploss = analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
// // // //   } else if (finalSignal === 'SELL') {
// // // //     target = analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;
// // // //     stoploss = analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
// // // //   }

// // // //   for (const chatId of USER_CHAT_IDS) {
// // // //     if (!activeTrades[chatId]) activeTrades[chatId] = {};

// // // //     const existing = activeTrades[chatId][symbol];
// // // //     if (existing) continue; // Skip if already active trade for this user and symbol

// // // //     const msg = `
// // // // 📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})
// // // // 📈 Signal: ${finalSignal}
// // // // 💰 Entry: ${currentPrice.toFixed(2)}
// // // // 🎯 Target: ${target.toFixed(2)}
// // // // 🛑 Stoploss: ${stoploss.toFixed(2)}

// // // // 📊 RSI (15m): ${analysis15m.lastRsi.toFixed(2)}
// // // // 📉 EMA14 (15m): ${analysis15m.lastEma.toFixed(2)}
// // // // 📈 MACD (15m): ${analysis15m.lastMacd.MACD.toFixed(2)}
// // // // 🟡 Signal Line (15m): ${analysis15m.lastMacd.signal.toFixed(2)}
// // // // 📊 Volume (15m): ${analysis15m.lastVolume.toFixed(0)}
// // // // 📉 Avg Vol SMA20 (15m): ${analysis15m.lastVolumeSMA.toFixed(0)}
// // // // 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
// // // //     `;

// // // //     await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

// // // //     activeTrades[chatId][symbol] = {
// // // //       signal: finalSignal,
// // // //       entry: currentPrice,
// // // //       target,
// // // //       stoploss,
// // // //       atr: analysis15m.lastAtr
// // // //     };
// // // //   }
// // // // }

// // // // // === TRADE MONITORING ===
// // // // async function monitorTrades() {
// // // //   for (const chatId of USER_CHAT_IDS) {
// // // //     const trades = activeTrades[chatId];
// // // //     if (!trades) continue;

// // // //     for (const symbol in trades) {
// // // //       const currentPrice = await fetchCurrentPrice(symbol);
// // // //       if (!currentPrice) continue;

// // // //       const trade = trades[symbol];
// // // //       const hit = checkIfHit(currentPrice, trade);
// // // //       if (hit) {
// // // //         let msg = '';
// // // //         if (hit === 'target') {
// // // //           msg = `✅ Target hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
// // // //         } else if (hit === 'stoploss') {
// // // //           msg = `⚠️ Stoploss hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
// // // //         }
// // // //         await bot.sendMessage(chatId, msg);
// // // //         // Remove trade after hitting target or stoploss
// // // //         delete activeTrades[chatId][symbol];
// // // //       }
// // // //     }
// // // //   }
// // // // }

// // // // // === BOT USER MANAGEMENT ===
// // // // bot.onText(/\/start/, (msg) => {
// // // //   const chatId = msg.chat.id;
// // // //   if (!USER_CHAT_IDS.includes(chatId)) {
// // // //     USER_CHAT_IDS.push(chatId);
// // // //     activeTrades[chatId] = {};
// // // //   }
// // // //   bot.sendMessage(chatId, "Welcome! You will start receiving crypto signals every minute.");
// // // // });

// // // // bot.onText(/\/stop/, (msg) => {
// // // //   const chatId = msg.chat.id;
// // // //   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
// // // //   delete activeTrades[chatId];
// // // //   bot.sendMessage(chatId, "You have stopped receiving signals.");
// // // // });

// // // // // === SCHEDULERS ===
// // // // cron.schedule('*/1 * * * *', async () => {
// // // //   try {
// // // //     await checkNextSymbol();
// // // //   } catch (err) {
// // // //     console.error('Error in checkNextSymbol:', err);
// // // //   }
// // // // });

// // // // cron.schedule('*/1 * * * *', async () => {
// // // //   try {
// // // //     await monitorTrades();
// // // //   } catch (err) {
// // // //     console.error('Error in monitorTrades:', err);
// // // //   }
// // // // });

// // // // console.log('Crypto signal bot started...');







// // // require('dotenv').config();
// // // const axios = require('axios');
// // // const TelegramBot = require('node-telegram-bot-api');
// // // const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// // // const cron = require('node-cron');

// // // // === CONFIG ===
// // // const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_TOKEN';
// // // const SYMBOLS = [
// // //   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
// // //   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
// // //   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
// // //   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
// // //   'SHIBUSDT'
// // // ];
// // // const INTERVAL_15M = '15m';
// // // const INTERVAL_1H = '1h';
// // // const TARGET_MULTIPLIER = 1.5;
// // // const STOPLOSS_MULTIPLIER = 1.0;
// // // const VOLUME_SMA_PERIOD = 20;
// // // const EMA_1H_PERIOD = 200;

// // // const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
// // // let USER_CHAT_IDS = [];
// // // let activeTrades = {}; // { chatId: { symbol: tradeObject } }

// // // // Current active trade lock for each user
// // // // If user has ANY active trade, block sending other signals
// // // // Structure: { chatId: { symbol: string, trade: {...} } }
// // // let userTradeLock = {};

// // // // Helper function to check if user has any active trade ongoing
// // // function hasActiveTrade(chatId) {
// // //   return userTradeLock[chatId] !== undefined;
// // // }

// // // async function fetchKlines(symbol, interval, limit = 100) {
// // //   try {
// // //     const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
// // //     const res = await axios.get(url);
// // //     return res.data.map(c => ({
// // //       open: parseFloat(c[1]),
// // //       high: parseFloat(c[2]),
// // //       low: parseFloat(c[3]),
// // //       close: parseFloat(c[4]),
// // //       volume: parseFloat(c[5]),
// // //       time: c[0]
// // //     }));
// // //   } catch (err) {
// // //     console.error(`Error fetching klines for ${symbol} (${interval}):`, err.message);
// // //     return null;
// // //   }
// // // }

// // // async function fetchCurrentPrice(symbol) {
// // //   try {
// // //     const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
// // //     const res = await axios.get(url);
// // //     return parseFloat(res.data.price);
// // //   } catch (err) {
// // //     console.error(`Error fetching current price for ${symbol}:`, err.message);
// // //     return null;
// // //   }
// // // }

// // // function analyzeData15m(candles) {
// // //   const closes = candles.map(c => c.close);
// // //   const highs = candles.map(c => c.high);
// // //   const lows = candles.map(c => c.low);
// // //   const volumes = candles.map(c => c.volume);

// // //   const rsi = RSI.calculate({ values: closes, period: 14 });
// // //   const ema = EMA.calculate({ values: closes, period: 14 });
// // //   const macd = MACD.calculate({
// // //     values: closes,
// // //     fastPeriod: 12,
// // //     slowPeriod: 26,
// // //     signalPeriod: 9,
// // //     SimpleMAOscillator: false,
// // //     SimpleMASignal: false
// // //   });
// // //   const atr = ATR.calculate({ high: highs, low: lows, close: closes, period: 14 });
// // //   const volumeSMA = SMA.calculate({ values: volumes, period: VOLUME_SMA_PERIOD });

// // //   if (macd.length === 0 || rsi.length === 0 || ema.length === 0 || atr.length === 0 || volumeSMA.length === 0) {
// // //     return null;
// // //   }

// // //   const lastClose = closes.at(-1);
// // //   const lastEma = ema.at(-1);
// // //   const lastMacd = macd.at(-1);
// // //   const lastRsi = rsi.at(-1);
// // //   const lastAtr = atr.at(-1);
// // //   const lastVolume = volumes.at(-1);
// // //   const lastVolumeSMA = volumeSMA.at(-1);

// // //   let signal = 'HOLD';
// // //   const volumeOkay = lastVolume > lastVolumeSMA;

// // //   if (volumeOkay && lastClose > lastEma && lastMacd.MACD > lastMacd.signal) signal = 'BUY';
// // //   else if (volumeOkay && lastClose < lastEma && lastMacd.MACD < lastMacd.signal) signal = 'SELL';

// // //   return {
// // //     signal, lastClose, lastEma, lastRsi, lastMacd,
// // //     lastAtr, lastVolume, lastVolumeSMA
// // //   };
// // // }

// // // function analyzeData1h(candles) {
// // //   const closes = candles.map(c => c.close);
// // //   if (closes.length < EMA_1H_PERIOD) return null;
// // //   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
// // //   if (ema200.length === 0) return null;
// // //   return ema200.at(-1);
// // // }

// // // function checkIfHit(price, trade) {
// // //   if (!trade) return false;
// // //   if (trade.signal === 'BUY') {
// // //     if (price >= trade.target) return 'target';
// // //     if (price <= trade.stoploss) return 'stoploss';
// // //   } else if (trade.signal === 'SELL') {
// // //     if (price <= trade.target) return 'target';
// // //     if (price >= trade.stoploss) return 'stoploss';
// // //   }
// // //   return false;
// // // }

// // // let symbolIndex = 0; // To rotate through symbols every minute

// // // // === ROTATING SIGNAL CHECK ===
// // // async function checkNextSymbol() {
// // //   const symbol = SYMBOLS[symbolIndex];
// // //   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

// // //   // For each user
// // //   for (const chatId of USER_CHAT_IDS) {
// // //     // If user has ANY active trade, skip sending signals for any symbol
// // //     if (hasActiveTrade(chatId)) {
// // //       continue;
// // //     }

// // //     // Else process symbol signal for user

// // //     const candles15m = await fetchKlines(symbol, INTERVAL_15M);
// // //     const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
// // //     const currentPrice = await fetchCurrentPrice(symbol);
// // //     if (!candles15m || !candles1h || !currentPrice) return;

// // //     const analysis15m = analyzeData15m(candles15m);
// // //     if (!analysis15m || analysis15m.signal === 'HOLD') return;

// // //     const ema200_1h = analyzeData1h(candles1h);
// // //     if (!ema200_1h) return;

// // //     let finalSignal = 'HOLD';
// // //     if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
// // //     else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

// // //     if (finalSignal === 'HOLD') return;

// // //     // Calculate target and stoploss
// // //     let target = null, stoploss = null;
// // //     if (finalSignal === 'BUY') {
// // //       target = analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr;
// // //       stoploss = analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
// // //     } else if (finalSignal === 'SELL') {
// // //       target = analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;
// // //       stoploss = analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
// // //     }

// // //     if (!activeTrades[chatId]) activeTrades[chatId] = {};

// // //     if (activeTrades[chatId][symbol]) {
// // //       // already active trade for symbol, skip
// // //       continue;
// // //     }

// // //     const msg = `
// // // 📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})
// // // 📈 Signal: ${finalSignal}
// // // 💰 Entry: ${currentPrice.toFixed(2)}
// // // 🎯 Target: ${target.toFixed(2)}
// // // 🛑 Stoploss: ${stoploss.toFixed(2)}

// // // 📊 RSI (15m): ${analysis15m.lastRsi.toFixed(2)}
// // // 📉 EMA14 (15m): ${analysis15m.lastEma.toFixed(2)}
// // // 📈 MACD (15m): ${analysis15m.lastMacd.MACD.toFixed(2)}
// // // 🟡 Signal Line (15m): ${analysis15m.lastMacd.signal.toFixed(2)}
// // // 📊 Volume (15m): ${analysis15m.lastVolume.toFixed(0)}
// // // 📉 Avg Vol SMA20 (15m): ${analysis15m.lastVolumeSMA.toFixed(0)}
// // // 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
// // //     `;

// // //     await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

// // //     activeTrades[chatId][symbol] = {
// // //       signal: finalSignal,
// // //       entry: currentPrice,
// // //       target,
// // //       stoploss,
// // //       atr: analysis15m.lastAtr
// // //     };

// // //     // Lock the user for new signals until this trade ends
// // //     userTradeLock[chatId] = { symbol, trade: activeTrades[chatId][symbol] };

// // //     // Break loop for this user, no other signals this cycle
// // //     // (Since we check symbol one by one per user, after sending one signal, stop checking more symbols)
// // //     break;
// // //   }
// // // }

// // // // === TRADE MONITORING ===
// // // async function monitorTrades() {
// // //   for (const chatId of USER_CHAT_IDS) {
// // //     const trades = activeTrades[chatId];
// // //     if (!trades) continue;

// // //     for (const symbol in trades) {
// // //       const currentPrice = await fetchCurrentPrice(symbol);
// // //       if (!currentPrice) continue;

// // //       const trade = trades[symbol];
// // //       const hit = checkIfHit(currentPrice, trade);
// // //       if (hit) {
// // //         let msg = '';
// // //         if (hit === 'target') {
// // //           msg = `✅ Target hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
// // //         } else if (hit === 'stoploss') {
// // //           msg = `⚠️ Stoploss hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
// // //         }
// // //         await bot.sendMessage(chatId, msg);

// // //         // Remove trade and unlock user
// // //         delete activeTrades[chatId][symbol];
// // //         delete userTradeLock[chatId];
// // //       }
// // //     }
// // //   }
// // // }

// // // // === BOT USER MANAGEMENT ===
// // // bot.onText(/\/start/, (msg) => {
// // //   const chatId = msg.chat.id;
// // //   if (!USER_CHAT_IDS.includes(chatId)) {
// // //     USER_CHAT_IDS.push(chatId);
// // //     activeTrades[chatId] = {};
// // //   }
// // //   bot.sendMessage(chatId, "Welcome! You will start receiving crypto signals every minute.");
// // // });

// // // bot.onText(/\/stop/, (msg) => {
// // //   const chatId = msg.chat.id;
// // //   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
// // //   delete activeTrades[chatId];
// // //   delete userTradeLock[chatId];
// // //   bot.sendMessage(chatId, "You have stopped receiving signals.");
// // // });

// // // // === SCHEDULERS ===
// // // cron.schedule('*/1 * * * *', async () => {
// // //   try {
// // //     await checkNextSymbol();
// // //   } catch (err) {
// // //     console.error('Error in checkNextSymbol:', err);
// // //   }
// // // });

// // // cron.schedule('*/1 * * * *', async () => {
// // //   try {
// // //     await monitorTrades();
// // //   } catch (err) {
// // //     console.error('Error in monitorTrades:', err);
// // //   }
// // // });

// // // console.log('Crypto signal bot started...');











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
//     if (hasActiveTrade(chatId)) {
//       // User locked on an active trade, skip sending new signals
//       continue;
//     }

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

//     if (finalSignal === 'HOLD') {
//       // Even HOLD send a message so user knows bot is active
//       await bot.sendMessage(chatId, `🟡 No new trade signal for ${symbol} at the moment. Holding position.`);
//       continue;
//     }

//     if (activeTrades[chatId][symbol]) {
//       // Already an active trade for this symbol, skip
//       continue;
//     }

//     // Calculate target and stoploss
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
// 🟡 Signal Line (15m): ${analysis15m.lastMacd.signal.toFixed(2)}
// 📊 Volume (15m): ${analysis15m.lastVolume.toFixed(0)}
// 📉 Avg Vol SMA20 (15m): ${analysis15m.lastVolumeSMA.toFixed(0)}
// 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
//     `;

//     await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

//     activeTrades[chatId][symbol] = {
//       signal: finalSignal,
//       entry: currentPrice,
//       target,
//       stoploss,
//       atr: analysis15m.lastAtr
//     };

//     userTradeLock[chatId] = { symbol, trade: activeTrades[chatId][symbol] };

//     break; // Only send one signal per user per run
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
//         let msg = '';
//         if (hit === 'target') {
//           msg = `✅ Target hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
//         } else if (hit === 'stoploss') {
//           msg = `⚠️ Stoploss hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
//         }
//         await bot.sendMessage(chatId, msg);

//         // Remove trade and unlock user
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
//   bot.sendMessage(chatId, "Welcome! You will start receiving crypto signals every minute.");
// });

// bot.onText(/\/stop/, (msg) => {
//   const chatId = msg.chat.id;
//   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
//   delete activeTrades[chatId];
//   delete userTradeLock[chatId];
//   bot.sendMessage(chatId, "You have stopped receiving signals.");
// });

// // Schedule checks every minute
// cron.schedule('*/1 * * * *', async () => {
//   try {
//     await checkNextSymbol();
//   } catch (err) {
//     console.error('Error in checkNextSymbol:', err);
//   }
// });

// cron.schedule('*/1 * * * *', async () => {
//   try {
//     await monitorTrades();
//   } catch (err) {
//     console.error('Error in monitorTrades:', err);
//   }
// });

// console.log('Crypto signal bot started...');

require('dotenv').config();
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
const cron = require('node-cron');

// === CONFIG ===
const TELEGRAM_BOT_TOKEN = '8003756443:AAHOP678U2KdAiTuVYQZVQ2DsYnT2Oq4PnE'

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
    console.error(`Error fetching klines for ${symbol} (${interval}):`, err.message);
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

  if (macd.length === 0 || rsi.length === 0 || ema.length === 0 || atr.length === 0 || volumeSMA.length === 0) {
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

  return {
    signal, lastClose, lastEma, lastRsi, lastMacd,
    lastAtr, lastVolume, lastVolumeSMA
  };
}

function analyzeData1h(candles) {
  const closes = candles.map(c => c.close);
  if (closes.length < EMA_1H_PERIOD) return null;
  const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
  if (ema200.length === 0) return null;
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
    if (hasActiveTrade(chatId)) {
      continue;
    }

    const candles15m = await fetchKlines(symbol, INTERVAL_15M);
    const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
    const currentPrice = await fetchCurrentPrice(symbol);

    if (!candles15m || !candles1h || !currentPrice) return;

    const analysis15m = analyzeData15m(candles15m);
    if (!analysis15m) return;

    const ema200_1h = analyzeData1h(candles1h);
    if (!ema200_1h) return;

    let finalSignal = 'HOLD';
    if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
    else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

    if (!activeTrades[chatId]) activeTrades[chatId] = {};

    // HOLD signal pe Telegram message bhejna
    if (finalSignal === 'HOLD') {
      const holdMsg = `📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})\n⚪ Signal: HOLD\n💰 Current Price: ${currentPrice.toFixed(2)}\nKoi strong buy ya sell signal nahi mila.`;
      await bot.sendMessage(chatId, holdMsg);
      continue;  // aage ka code skip karenge
    }

    if (activeTrades[chatId][symbol]) {
      continue;
    }

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
🟡 Signal Line (15m): ${analysis15m.lastMacd.signal.toFixed(2)}
📊 Volume (15m): ${analysis15m.lastVolume.toFixed(0)}
📉 Avg Vol SMA20 (15m): ${analysis15m.lastVolumeSMA.toFixed(0)}
📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
    `;

    await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

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
        let msg = '';
        if (hit === 'target') {
          msg = `✅ Target hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
        } else if (hit === 'stoploss') {
          msg = `⚠️ Stoploss hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent Price: ${currentPrice.toFixed(2)}`;
        }
        await bot.sendMessage(chatId, msg);
        delete activeTrades[chatId][symbol];
        delete userTradeLock[chatId];
      }
    }
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (!USER_CHAT_IDS.includes(chatId)) {
    USER_CHAT_IDS.push(chatId);
    activeTrades[chatId] = {};
  }
  bot.sendMessage(chatId, "✅ बॉट चालू हो गया है। हर 1 मिनट में आपको नए सिग्नल मिलेंगे (अगर हों तो)।");
});

bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
  delete activeTrades[chatId];
  delete userTradeLock[chatId];
  bot.sendMessage(chatId, "🛑 बॉट बंद कर दिया गया है।");
});

cron.schedule('*/1 * * * *', async () => {
  try {
    await checkNextSymbol();
    await monitorTrades();
  } catch (err) {
    console.error('Error in scheduled task:', err.message);
  }
});
