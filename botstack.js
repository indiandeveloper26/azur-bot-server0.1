// // // // require('dotenv').config();
// // // // const axios = require('axios');
// // // // const TelegramBot = require('node-telegram-bot-api');
// // // // const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// // // // const cron = require('node-cron');

// // // // const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';

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

// // // // const bot = new TelegramBot('7739855919:AAF2JCiwZW5bXkLAcrUx6HPCMCcgE8GJ35c', { polling: true });

// // // // let USER_CHAT_IDS = [];
// // // // let activeTrades = {};
// // // // let userTradeLock = {}; // { chatId: { symbol, trade } }

// // // // function hasActiveTrade(chatId) {
// // // //   return userTradeLock[chatId] !== undefined;
// // // // }

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

// // // // let symbolIndex = 0;

// // // // async function checkNextSymbol() {
// // // //   const symbol = SYMBOLS[symbolIndex];
// // // //   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

// // // //   for (const chatId of USER_CHAT_IDS) {
// // // //     if (hasActiveTrade(chatId)) continue;

// // // //     const candles15m = await fetchKlines(symbol, INTERVAL_15M);
// // // //     const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
// // // //     const currentPrice = await fetchCurrentPrice(symbol);

// // // //     if (!candles15m || !candles1h || !currentPrice) return;

// // // //     const analysis15m = analyzeData15m(candles15m);
// // // //     if (!analysis15m) return;

// // // //     const ema200_1h = analyzeData1h(candles1h);
// // // //     if (!ema200_1h) return;

// // // //     let finalSignal = 'HOLD';
// // // //     if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
// // // //     else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

// // // //     if (!activeTrades[chatId]) activeTrades[chatId] = {};

// // // //     // HOLD signal
// // // //     // if (finalSignal === 'HOLD') {
// // // //     //   await bot.sendMessage(chatId,
// // // //     //     `📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})\n⚪ Signal: HOLD\n💰 Current Price: ${currentPrice.toFixed(2)}\nकोई strong signal नहीं मिला।`);
// // // //     //   continue;
// // // //     // }

// // // //     if (finalSignal === 'HOLD') {
// // // //   await bot.sendMessage(chatId,
// // // //     `📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})\n⚪ Signal: HOLD\n💰 Current Price: ${currentPrice.toFixed(2)}\nNo strong signal found.`);
// // // //   continue;
// // // // }


// // // //     if (activeTrades[chatId][symbol]) continue;

// // // //     let target, stoploss;
// // // //     if (finalSignal === 'BUY') {
// // // //       target = analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr;
// // // //       stoploss = analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
// // // //     } else {
// // // //       target = analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;
// // // //       stoploss = analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
// // // //     }

// // // //     const msg = `
// // // // 📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})
// // // // 📈 Signal: ${finalSignal}
// // // // 💰 Entry: ${currentPrice.toFixed(2)}
// // // // 🎯 Target: ${target.toFixed(2)}
// // // // 🛑 Stoploss: ${stoploss.toFixed(2)}

// // // // 📊 RSI (15m): ${analysis15m.lastRsi.toFixed(2)}
// // // // 📉 EMA14 (15m): ${analysis15m.lastEma.toFixed(2)}
// // // // 📈 MACD (15m): ${analysis15m.lastMacd.MACD.toFixed(2)}
// // // // 🟡 Signal Line: ${analysis15m.lastMacd.signal.toFixed(2)}
// // // // 📊 Volume: ${analysis15m.lastVolume.toFixed(0)}
// // // // 📉 Avg Vol SMA20: ${analysis15m.lastVolumeSMA.toFixed(0)}
// // // // 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
// // // //     `;

// // // //     await bot.sendMessage(chatId, msg);

// // // //     activeTrades[chatId][symbol] = {
// // // //       signal: finalSignal,
// // // //       entry: currentPrice,
// // // //       target,
// // // //       stoploss,
// // // //       atr: analysis15m.lastAtr
// // // //     };

// // // //     userTradeLock[chatId] = { symbol, trade: activeTrades[chatId][symbol] };

// // // //     break;
// // // //   }
// // // // }

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
// // // //         const msg = hit === 'target'
// // // //           ? `✅ Target hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent: ${currentPrice.toFixed(2)}`
// // // //           : `⚠️ Stoploss hit for ${symbol}!\nSignal: ${trade.signal}\nEntry: ${trade.entry.toFixed(2)}\nTarget: ${trade.target.toFixed(2)}\nStoploss: ${trade.stoploss.toFixed(2)}\nCurrent: ${currentPrice.toFixed(2)}`;

// // // //         await bot.sendMessage(chatId, msg);
// // // //         delete activeTrades[chatId][symbol];
// // // //         delete userTradeLock[chatId];
// // // //       }
// // // //     }
// // // //   }
// // // // }

// // // // bot.onText(/\/start/, (msg) => {
// // // //   const chatId = msg.chat.id;
// // // //   if (!USER_CHAT_IDS.includes(chatId)) {
// // // //     USER_CHAT_IDS.push(chatId);
// // // //     activeTrades[chatId] = {};
// // // //   }
// // // //   // bot.sendMessage(chatId, "✅ बॉट चालू हो गया है। हर 1 मिनट में आपको सिग्नल मिलेंगे (अगर बनें तो)।");
// // // //   bot.sendMessage(chatId, "✅ Bot has started. You will receive signals every 1 minute (if any are generated).");

// // // // });

// // // // bot.onText(/\/stop/, (msg) => {
// // // //   const chatId = msg.chat.id;
// // // //   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
// // // //   delete activeTrades[chatId];
// // // //   delete userTradeLock[chatId];
// // // //   bot.sendMessage(chatId, "🛑 बॉट बंद कर दिया गया है।");
// // // // });

// // // // cron.schedule('*/1 * * * *', async () => {
// // // //   try {
// // // //     await checkNextSymbol();
// // // //     await monitorTrades();
// // // //   } catch (err) {
// // // //     console.error('Error in cron task:', err.message);
// // // //   }
// // // // });





// // // // 📦 आवश्यक मॉड्यूल्स
// // // require('dotenv').config();
// // // const axios = require('axios');
// // // const TelegramBot = require('node-telegram-bot-api');
// // // const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// // // const cron = require('node-cron');

// // // // 🔐 Telegram बॉट टोकन
// // // const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// // // // 📈 क्रिप्टोकरेंसी symbols
// // // const SYMBOLS = [
// // //   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
// // //   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
// // //   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
// // //   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
// // //   'SHIBUSDT'
// // // ];

// // // // ⏱️ टाइम इंटरवल्स और पैरामीटर्स
// // // const INTERVAL_15M = '15m';
// // // const INTERVAL_1H = '1h';
// // // const TARGET_MULTIPLIER = 1.5;
// // // const STOPLOSS_MULTIPLIER = 1.0;
// // // const VOLUME_SMA_PERIOD = 20;
// // // const EMA_1H_PERIOD = 200;

// // // // 🤖 Telegram बॉट इनिशियलाइज़ेशन
// // // const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// // // // 👥 उपयोगकर्ता डेटा
// // // let USER_CHAT_IDS = [];  // इसमें आप चैट IDs डालें जिन्हें सिग्नल भेजने हैं
// // // let activeTrades = {};   // active trades per user: { chatId: { symbol: tradeDetails } }
// // // let userTradeLock = {};  // lock for users on active trade

// // // // 🔍 उपयोगकर्ता के लिए सक्रिय ट्रेड चेक
// // // function hasActiveTrade(chatId) {
// // //   return userTradeLock[chatId] !== undefined;
// // // }

// // // // 📊 कैंडल डेटा प्राप्त करें
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

// // // // 💰 वर्तमान मूल्य प्राप्त करें
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

// // // // 📈 15 मिनट के डेटा का विश्लेषण
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

// // // // 📉 1 घंटे के डेटा का विश्लेषण
// // // function analyzeData1h(candles) {
// // //   const closes = candles.map(c => c.close);
// // //   if (closes.length < EMA_1H_PERIOD) return null;
// // //   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
// // //   if (ema200.length === 0) return null;
// // //   return ema200.at(-1);
// // // }

// // // // 🎯 लक्ष्य या स्टॉपलॉस हिट चेक करें
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

// // // // 🔄 प्रतीक सूचकांक
// // // let symbolIndex = 0;

// // // // 🔍 अगले प्रतीक की जांच करें और सिग्नल भेजें
// // // async function checkNextSymbol() {
// // //   const symbol = SYMBOLS[symbolIndex];
// // //   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

// // //   for (const chatId of USER_CHAT_IDS) {
// // //     if (hasActiveTrade(chatId)) continue;

// // //     const candles15m = await fetchKlines(symbol, INTERVAL_15M);
// // //     const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
// // //     const currentPrice = await fetchCurrentPrice(symbol);

// // //     if (!candles15m || !candles1h || !currentPrice) continue;

// // //     const analysis15m = analyzeData15m(candles15m);
// // //     if (!analysis15m) continue;

// // //     const ema200_1h = analyzeData1h(candles1h);
// // //     if (!ema200_1h) continue;

// // //     let finalSignal = 'HOLD';
// // //     if (analysis15m.signal === 'BUY' && analysis15m.lastClose > ema200_1h) finalSignal = 'BUY';
// // //     else if (analysis15m.signal === 'SELL' && analysis15m.lastClose < ema200_1h) finalSignal = 'SELL';

// // //     if (!activeTrades[chatId]) activeTrades[chatId] = {};

// // //     if (finalSignal === 'HOLD') {
// // //       try {
// // //         await bot.sendMessage(chatId,
// // //           `📡 Crypto Signal - ${symbol} (${INTERVAL_15M} + ${INTERVAL_1H})\n⚪ Signal: HOLD\n💰 Current Price: ${currentPrice.toFixed(2)}\nNo strong signal found.`);
// // //       } catch (err) {
// // //         console.error(`Failed to send HOLD message to ${chatId}:`, err.message);
// // //       }
// // //       continue;
// // //     }

// // //     if (activeTrades[chatId][symbol]) continue;

// // //     let target, stoploss;
// // //     if (finalSignal === 'BUY') {
// // //       target = analysis15m.lastClose + TARGET_MULTIPLIER * analysis15m.lastAtr;
// // //       stoploss = analysis15m.lastClose - STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
// // //     } else {
// // //       target = analysis15m.lastClose - TARGET_MULTIPLIER * analysis15m.lastAtr;
// // //       stoploss = analysis15m.lastClose + STOPLOSS_MULTIPLIER * analysis15m.lastAtr;
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
// // // 🟡 Signal Line: ${analysis15m.lastMacd.signal.toFixed(2)}
// // // 📊 Volume: ${analysis15m.lastVolume.toFixed(0)}
// // // 📉 Avg Vol SMA20: ${analysis15m.lastVolumeSMA.toFixed(0)}
// // // 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
// // //     `;

// // //     try {
// // //       await bot.sendMessage(chatId, msg);
// // //     } catch (err) {
// // //       console.error(`Failed to send signal message to ${chatId}:`, err.message);
// // //     }

// // //     activeTrades[chatId][symbol] = {
// // //       signal: finalSignal,
// // //       entryPrice: currentPrice,
// // //       target,
// // //       stoploss
// // //     };
// // //     userTradeLock[chatId] = true;
// // //   }
// // // }

// // // // 📡 सक्रिय ट्रेड्स मॉनिटर करें और टारगेट/स्टॉपलॉस हिट चेक करें
// // // async function monitorTrades() {
// // //   for (const chatId of USER_CHAT_IDS) {
// // //     const trades = activeTrades[chatId];
// // //     if (!trades) continue;

// // //     for (const symbol in trades) {
// // //       const trade = trades[symbol];
// // //       const currentPrice = await fetchCurrentPrice(symbol);
// // //       if (!currentPrice) continue;

// // //       const hit = checkIfHit(currentPrice, trade);
// // //       if (hit === 'target') {
// // //         try {
// // //           await bot.sendMessage(chatId, `🎯 Target hit for ${symbol} at ${currentPrice.toFixed(2)}! Congratulations!`);
// // //         } catch (err) {
// // //           console.error(`Failed to send target hit message to ${chatId}:`, err.message);
// // //         }
// // //         delete activeTrades[chatId][symbol];
// // //         delete userTradeLock[chatId];
// // //       } else if (hit === 'stoploss') {
// // //         try {
// // //           await bot.sendMessage(chatId, `🛑 Stoploss hit for ${symbol} at ${currentPrice.toFixed(2)}. Please review your trade.`);
// // //         } catch (err) {
// // //           console.error(`Failed to send stoploss hit message to ${chatId}:`, err.message);
// // //         }
// // //         delete activeTrades[chatId][symbol];
// // //         delete userTradeLock[chatId];
// // //       }
// // //     }
// // //   }
// // // }

// // // // 🕒 शेड्यूल जॉब्स सेट करें
// // // // हर 15 मिनट बाद नया सिग्नल जांचें
// // // cron.schedule('*/15 * * * *', async () => {
// // //   console.log(`[${new Date().toLocaleString()}] Running signal check...`);
// // //   await checkNextSymbol();
// // // });

// // // // हर 1 मिनट में सक्रिय ट्रेड्स मॉनिटर करें
// // // cron.schedule('*/1 * * * *', async () => {
// // //   await monitorTrades();
// // // });

// // // // 👂 Telegram कमांड्स को हैंडल करें
// // // bot.onText(/\/start/, (msg) => {
// // //   const chatId = msg.chat.id;
// // //   if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);
// // //   bot.sendMessage(chatId, `नमस्ते! आपका स्वागत है Crypto Signal Bot में। आपको हर 15 मिनट में सिग्नल प्राप्त होंगे।`);
// // // });

// // // bot.onText(/\/stop/, (msg) => {
// // //   const chatId = msg.chat.id;
// // //   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
// // //   bot.sendMessage(chatId, `आपने सिग्नल प्राप्त करना बंद कर दिया है। फिर से शुरू करने के लिए /start टाइप करें।`);
// // // });

// // // // ❗️ Bot error handling
// // // bot.on('polling_error', (error) => {
// // //   console.error('Polling error:', error.code, error.message);
// // // });






// // // 📦 आवश्यक मॉड्यूल्स
// // require('dotenv').config();
// // const axios = require('axios');
// // const TelegramBot = require('node-telegram-bot-api');
// // const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// // const cron = require('node-cron');

// // // 🔐 Telegram बॉट टोकन
// // const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// // // 📈 क्रिप्टोकरेंसी symbols
// // const SYMBOLS = [
// //   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
// //   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
// //   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
// //   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
// //   'SHIBUSDT'
// // ];

// // // ⏱️ टाइम इंटरवल्स और पैरामीटर्स
// // const INTERVAL_1M = '1m';  // अब 1 मिनट इंटरवल
// // const INTERVAL_1H = '1h';
// // const TARGET_MULTIPLIER = 1.5;
// // const STOPLOSS_MULTIPLIER = 1.0;
// // const VOLUME_SMA_PERIOD = 20;
// // const EMA_1H_PERIOD = 200;

// // // 🤖 Telegram बॉट इनिशियलाइज़ेशन
// // const bot = new TelegramBot('7739855919:AAF2JCiwZW5bXkLAcrUx6HPCMCcgE8GJ35c', { polling: true });

// // // 👥 उपयोगकर्ता डेटा
// // let USER_CHAT_IDS = [];  // चैट IDs जिन्हें सिग्नल भेजने हैं
// // let activeTrades = {};   // active trades per user: { chatId: { symbol: tradeDetails } }
// // let userTradeLock = {};  // user-level trade lock

// // // 🔍 उपयोगकर्ता के लिए सक्रिय ट्रेड चेक
// // function hasActiveTrade(chatId) {
// //   return userTradeLock[chatId] !== undefined;
// // }

// // // 📊 कैंडल डेटा प्राप्त करें
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

// // // 💰 वर्तमान मूल्य प्राप्त करें
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

// // // 📈 1 मिनट के डेटा का विश्लेषण
// // function analyzeData1m(candles) {
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

// // // 📉 1 घंटे के डेटा का विश्लेषण (EMA200)
// // function analyzeData1h(candles) {
// //   const closes = candles.map(c => c.close);
// //   if (closes.length < EMA_1H_PERIOD) return null;
// //   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
// //   if (ema200.length === 0) return null;
// //   return ema200.at(-1);
// // }

// // // 🎯 लक्ष्य या स्टॉपलॉस हिट चेक करें
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

// // // 🔄 प्रतीक सूचकांक
// // let symbolIndex = 0;

// // // 🔍 अगले प्रतीक की जांच करें और सिग्नल भेजें
// // async function checkNextSymbol() {
// //   const symbol = SYMBOLS[symbolIndex];
// //   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

// //   for (const chatId of USER_CHAT_IDS) {
// //     if (hasActiveTrade(chatId)) continue;

// //     const candles1m = await fetchKlines(symbol, INTERVAL_1M);
// //     const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
// //     const currentPrice = await fetchCurrentPrice(symbol);

// //     if (!candles1m || !candles1h || !currentPrice) continue;

// //     const analysis1m = analyzeData1m(candles1m);
// //     if (!analysis1m) continue;

// //     const ema200_1h = analyzeData1h(candles1h);
// //     if (!ema200_1h) continue;

// //     let finalSignal = 'HOLD';
// //     if (analysis1m.signal === 'BUY' && analysis1m.lastClose > ema200_1h) finalSignal = 'BUY';
// //     else if (analysis1m.signal === 'SELL' && analysis1m.lastClose < ema200_1h) finalSignal = 'SELL';

// //     if (!activeTrades[chatId]) activeTrades[chatId] = {};

// //     if (finalSignal === 'HOLD') {
// //       try {
// //         await bot.sendMessage(chatId,
// //           `📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})\n⚪ Signal: HOLD\n💰 Current Price: ${currentPrice.toFixed(2)}\nNo strong signal found.`);
// //       } catch (err) {
// //         console.error(`Failed to send HOLD message to ${chatId}:`, err.message);
// //       }
// //       continue;
// //     }

// //     if (activeTrades[chatId][symbol]) continue;

// //     let target, stoploss;
// //     if (finalSignal === 'BUY') {
// //       target = analysis1m.lastClose + TARGET_MULTIPLIER * analysis1m.lastAtr;
// //       stoploss = analysis1m.lastClose - STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
// //     } else {
// //       target = analysis1m.lastClose - TARGET_MULTIPLIER * analysis1m.lastAtr;
// //       stoploss = analysis1m.lastClose + STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
// //     }

// //     const msg = `
// // 📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})
// // 📈 Signal: ${finalSignal}
// // 💰 Entry: ${currentPrice.toFixed(2)}
// // 🎯 Target: ${target.toFixed(2)}
// // 🛑 Stoploss: ${stoploss.toFixed(2)}

// // 📊 RSI (1m): ${analysis1m.lastRsi.toFixed(2)}
// // 📉 EMA14 (1m): ${analysis1m.lastEma.toFixed(2)}
// // 📈 MACD (1m): ${analysis1m.lastMacd.MACD.toFixed(2)}
// // 🟡 Signal Line: ${analysis1m.lastMacd.signal.toFixed(2)}
// // 📊 Volume: ${analysis1m.lastVolume.toFixed(0)}
// // 📉 Avg Vol SMA20: ${analysis1m.lastVolumeSMA.toFixed(0)}
// // 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
// //     `;

// //     try {
// //       await bot.sendMessage(chatId, msg);
// //     } catch (err) {
// //       console.error(`Failed to send signal message to ${chatId}:`, err.message);
// //     }

// //     activeTrades[chatId][symbol] = {
// //       signal: finalSignal,
// //       entryPrice: currentPrice,
// //       target,
// //       stoploss
// //     };
// //     userTradeLock[chatId] = true;
// //   }
// // }

// // // 📡 सक्रिय ट्रेड्स मॉनिटर करें और टारगेट/स्टॉपलॉस हिट चेक करें
// // async function monitorTrades() {
// //   for (const chatId of USER_CHAT_IDS) {
// //     const trades = activeTrades[chatId];
// //     if (!trades) continue;

// //     for (const symbol in trades) {
// //       const trade = trades[symbol];
// //       const currentPrice = await fetchCurrentPrice(symbol);
// //       if (!currentPrice) continue;

// //       const hit = checkIfHit(currentPrice, trade);
// //       if (hit === 'target') {
// //         try {
// //           await bot.sendMessage(chatId, `🎯 Target hit for ${symbol} at ${currentPrice.toFixed(2)}! Congratulations!`);
// //         } catch (err) {
// //           console.error(`Failed to send target hit message to ${chatId}:`, err.message);
// //         }
// //         delete activeTrades[chatId][symbol];
// //         delete userTradeLock[chatId];
// //       } else if (hit === 'stoploss') {
// //         try {
// //           await bot.sendMessage(chatId, `🛑 Stoploss hit for ${symbol} at ${currentPrice.toFixed(2)}. Please review your trade.`);
// //         } catch (err) {
// //           console.error(`Failed to send stoploss hit message to ${chatId}:`, err.message);
// //         }
// //         delete activeTrades[chatId][symbol];
// //         delete userTradeLock[chatId];
// //       }
// //     }
// //   }
// // }

// // // 🕒 शेड्यूल जॉब्स सेट करें
// // // हर 1 मिनट बाद नया सिग्नल जांचें (सभी सिम्बल्स के लिए)
// // cron.schedule('*/1 * * * *', async () => {
// //   console.log(`[${new Date().toLocaleString()}] Running signal check for all symbols...`);
// //   for (const symbol of SYMBOLS) {
// //     await checkNextSymbol();
// //   }
// // });

// // // हर 1 मिनट में सक्रिय ट्रेड्स मॉनिटर करें
// // cron.schedule('*/1 * * * *', async () => {
// //   await monitorTrades();
// // });

// // // 👋 Bot स्टार्टअप पर यूजर को स्वागत संदेश भेजें
// // bot.onText(/\/start/, (msg) => {
// //   const chatId = msg.chat.id;
// //   if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);
// //   bot.sendMessage(chatId, 'Welcome to Crypto Signal Bot! You will receive signals every minute.');
// // });

// // console.log('Bot started and running...');





// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// const cron = require('node-cron');

// // Telegram Bot Token
// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// // Crypto Symbols
// const SYMBOLS = [
//   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
//   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
//   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
//   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
//   'SHIBUSDT'
// ];

// // Intervals and Params
// const INTERVAL_1M = '1m';
// const INTERVAL_1H = '1h';
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;
// const VOLUME_SMA_PERIOD = 20;
// const EMA_1H_PERIOD = 200;

// // Initialize Telegram Bot
// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// // User Data
// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { symbol: tradeDetails } }
// let userTradeLock = {}; // { chatId: true }

// // Check if user has active trade
// function hasActiveTrade(chatId) {
//   return userTradeLock[chatId] !== undefined;
// }

// // Fetch candle data from Binance
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

// // Fetch current price
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

// // Analyze 1m candle data
// function analyzeData1m(candles) {
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

// // Analyze 1h candle data (EMA200)
// function analyzeData1h(candles) {
//   const closes = candles.map(c => c.close);
//   if (closes.length < EMA_1H_PERIOD) return null;
//   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
//   if (ema200.length === 0) return null;
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

// // Symbol index for cycling through symbols
// let symbolIndex = 0;

// // Check next symbol and send signal
// async function checkNextSymbol() {
//   const symbol = SYMBOLS[symbolIndex];
//   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

//   for (const chatId of USER_CHAT_IDS) {
//     if (hasActiveTrade(chatId)) continue;

//     const candles1m = await fetchKlines(symbol, INTERVAL_1M);
//     const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
//     const currentPrice = await fetchCurrentPrice(symbol);

//     if (!candles1m || !candles1h || !currentPrice) continue;

//     const analysis1m = analyzeData1m(candles1m);
//     if (!analysis1m) continue;

//     const ema200_1h = analyzeData1h(candles1h);
//     if (!ema200_1h) continue;

//     let finalSignal = 'HOLD';
//     if (analysis1m.signal === 'BUY' && analysis1m.lastClose > ema200_1h) finalSignal = 'BUY';
//     else if (analysis1m.signal === 'SELL' && analysis1m.lastClose < ema200_1h) finalSignal = 'SELL';

//     if (!activeTrades[chatId]) activeTrades[chatId] = {};

//     if (finalSignal === 'HOLD') {
//       try {
//         await bot.sendMessage(chatId,
//           `📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})\n⚪ Signal: HOLD\n💰 Current Price: ${currentPrice.toFixed(2)}\nNo strong signal found.`);
//       } catch (err) {
//         console.error(`Failed to send HOLD message to ${chatId}:`, err.message);
//       }
//       continue;
//     }

//     if (activeTrades[chatId][symbol]) continue;

//     let target, stoploss;
//     if (finalSignal === 'BUY') {
//       target = analysis1m.lastClose + TARGET_MULTIPLIER * analysis1m.lastAtr;
//       stoploss = analysis1m.lastClose - STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
//     } else {
//       target = analysis1m.lastClose - TARGET_MULTIPLIER * analysis1m.lastAtr;
//       stoploss = analysis1m.lastClose + STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
//     }

//     const msg = `
// 📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})
// 📈 Signal: ${finalSignal}
// 💰 Entry: ${currentPrice.toFixed(2)}
// 🎯 Target: ${target.toFixed(2)}
// 🛑 Stoploss: ${stoploss.toFixed(2)}

// 📊 RSI (1m): ${analysis1m.lastRsi.toFixed(2)}
// 📉 EMA14 (1m): ${analysis1m.lastEma.toFixed(2)}
// 📈 MACD (1m): ${analysis1m.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line: ${analysis1m.lastMacd.signal.toFixed(2)}
// 📊 Volume: ${analysis1m.lastVolume.toFixed(0)}
// 📉 Avg Vol SMA20: ${analysis1m.lastVolumeSMA.toFixed(0)}
// 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
//     `;

//     try {
//       await bot.sendMessage(chatId, msg);
//     } catch (err) {
//       console.error(`Failed to send signal message to ${chatId}:`, err.message);
//     }

//     activeTrades[chatId][symbol] = {
//       signal: finalSignal,
//       entryPrice: currentPrice,
//       target,
//       stoploss
//     };
//     userTradeLock[chatId] = true;
//   }
// }

// // Monitor active trades and check if target/stoploss hit
// async function monitorTrades() {
//   for (const chatId of USER_CHAT_IDS) {
//     const trades = activeTrades[chatId];
//     if (!trades) continue;

//     for (const symbol in trades) {
//       const trade = trades[symbol];
//       const currentPrice = await fetchCurrentPrice(symbol);
//       if (!currentPrice) continue;

//       const hit = checkIfHit(currentPrice, trade);
//       if (hit === 'target') {
//         try {
//           await bot.sendMessage(chatId, `🎯 Target hit for ${symbol} at ${currentPrice.toFixed(2)}! Congratulations!`);
//         } catch (err) {
//           console.error(`Failed to send target hit message to ${chatId}:`, err.message);
//         }
//         delete activeTrades[chatId][symbol];
//         delete userTradeLock[chatId];
//       } else if (hit === 'stoploss') {
//         try {
//           await bot.sendMessage(chatId, `🛑 Stoploss hit for ${symbol} at ${currentPrice.toFixed(2)}. Please review your trade.`);
//         } catch (err) {
//           console.error(`Failed to send stoploss hit message to ${chatId}:`, err.message);
//         }
//         delete activeTrades[chatId][symbol];
//         delete userTradeLock[chatId];
//       }
//     }
//   }
// }

// // Schedule jobs every 1 minute
// cron.schedule('*/1 * * * *', async () => {
//   console.log(`[${new Date().toLocaleString()}] Running signal check for symbols...`);
//   // Using cycle through symbols with checkNextSymbol
//   await checkNextSymbol();
// });

// cron.schedule('*/1 * * * *', async () => {
//   await monitorTrades();
// });

// // Telegram bot commands
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);
//   bot.sendMessage(chatId, 'Welcome to Crypto Signal Bot! You will receive crypto trading signals here.');
// });

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);
// });

// // On process exit cleanup
// process.on('SIGINT', () => {
//   console.log('Bot shutting down...');
//   process.exit();
// });




// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// const cron = require('node-cron');

// // Telegram Bot Token
// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// // Crypto Symbols
// const SYMBOLS = [
//   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
//   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
//   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
//   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
//   'SHIBUSDT'
// ];

// // Intervals and Params
// const INTERVAL_1M = '1m';
// const INTERVAL_1H = '1h';
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;
// const VOLUME_SMA_PERIOD = 20;
// const EMA_1H_PERIOD = 200;

// // Initialize Telegram Bot
// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// // User Data
// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { symbol: tradeDetails } }

// // Fetch candle data from Binance
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

// // Fetch current price
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

// // Analyze 1m candle data
// function analyzeData1m(candles) {
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

// // Analyze 1h candle data (EMA200)
// function analyzeData1h(candles) {
//   const closes = candles.map(c => c.close);
//   if (closes.length < EMA_1H_PERIOD) return null;
//   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
//   if (ema200.length === 0) return null;
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

// // Symbol index for cycling through symbols
// let symbolIndex = 0;

// // Check next symbol and send signal for all users
// async function checkNextSymbol() {
//   const symbol = SYMBOLS[symbolIndex];
//   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

//   // Fetch candle and price data once per symbol for efficiency
//   const candles1m = await fetchKlines(symbol, INTERVAL_1M);
//   const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
//   const currentPrice = await fetchCurrentPrice(symbol);
//   if (!candles1m || !candles1h || !currentPrice) return;

//   const analysis1m = analyzeData1m(candles1m);
//   if (!analysis1m) return;

//   const ema200_1h = analyzeData1h(candles1h);
//   if (!ema200_1h) return;

//   for (const chatId of USER_CHAT_IDS) {
//     if (!activeTrades[chatId]) activeTrades[chatId] = {};

//     // Agar is symbol ka active trade already hai, to naye signals na bhejein
//     if (activeTrades[chatId][symbol]) {
//       // Active trade hai, isliye signal bhejne se skip karo
//       continue;
//     }

//     let finalSignal = 'HOLD';
//     if (analysis1m.signal === 'BUY' && analysis1m.lastClose > ema200_1h) finalSignal = 'BUY';
//     else if (analysis1m.signal === 'SELL' && analysis1m.lastClose < ema200_1h) finalSignal = 'SELL';

//     if (finalSignal === 'HOLD') {
//       try {
//         await bot.sendMessage(chatId,
//           `📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})\n⚪ Signal: HOLD\n💰 Current Price: ${currentPrice.toFixed(2)}\nNo strong signal found.`);
//       } catch (err) {
//         console.error(`Failed to send HOLD message to ${chatId}:`, err.message);
//       }
//       continue;
//     }

//     // Calculate target and stoploss
//     let target, stoploss;
//     if (finalSignal === 'BUY') {
//       target = analysis1m.lastClose + TARGET_MULTIPLIER * analysis1m.lastAtr;
//       stoploss = analysis1m.lastClose - STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
//     } else {
//       target = analysis1m.lastClose - TARGET_MULTIPLIER * analysis1m.lastAtr;
//       stoploss = analysis1m.lastClose + STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
//     }

//     const msg = `
// 📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})
// 📈 Signal: ${finalSignal}
// 💰 Entry: ${currentPrice.toFixed(2)}
// 🎯 Target: ${target.toFixed(2)}
// 🛑 Stoploss: ${stoploss.toFixed(2)}

// 📊 RSI (1m): ${analysis1m.lastRsi.toFixed(2)}
// 📉 EMA14 (1m): ${analysis1m.lastEma.toFixed(2)}
// 📈 MACD (1m): ${analysis1m.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line: ${analysis1m.lastMacd.signal.toFixed(2)}
// 📊 Volume: ${analysis1m.lastVolume.toFixed(0)}
// 📉 Avg Vol SMA20: ${analysis1m.lastVolumeSMA.toFixed(0)}
// 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
//     `;

//     try {
//       await bot.sendMessage(chatId, msg);
//     } catch (err) {
//       console.error(`Failed to send signal message to ${chatId}:`, err.message);
//     }

//     // Set active trade for this symbol and user
//     activeTrades[chatId][symbol] = {
//       signal: finalSignal,
//       entryPrice: currentPrice,
//       target,
//       stoploss
//     };
//   }
// }

// // Monitor active trades and check if target/stoploss hit
// async function monitorTrades() {
//   for (const chatId of USER_CHAT_IDS) {
//     const trades = activeTrades[chatId];
//     if (!trades) continue;

//     for (const symbol in trades) {
//       const trade = trades[symbol];
//       const currentPrice = await fetchCurrentPrice(symbol);
//       if (!currentPrice) continue;

//       const hit = checkIfHit(currentPrice, trade);
//       if (hit === 'target') {
//         try {
//           await bot.sendMessage(chatId, `🎯 Target hit for ${symbol} at ${currentPrice.toFixed(2)}! Congratulations!`);
//         } catch (err) {
//           console.error(`Failed to send target hit message to ${chatId}:`, err.message);
//         }
//         // Remove trade after target hit
//         delete activeTrades[chatId][symbol];
//       } else if (hit === 'stoploss') {
//         try {
//           await bot.sendMessage(chatId, `🛑 Stoploss hit for ${symbol} at ${currentPrice.toFixed(2)}. Please review your trade.`);
//         } catch (err) {
//           console.error(`Failed to send stoploss hit message to ${chatId}:`, err.message);
//         }
//         // Remove trade after stoploss hit
//         delete activeTrades[chatId][symbol];
//       }
//     }
//   }
// }

// // Schedule jobs every 1 minute
// cron.schedule('*/1 * * * *', async () => {
//   console.log(`[${new Date().toLocaleString()}] Running signal check for symbols...`);
//   await checkNextSymbol();
// });

// cron.schedule('*/1 * * * *', async () => {
//   await monitorTrades();
// });

// // Telegram bot commands
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);
//   bot.sendMessage(chatId, 'Welcome to Crypto Signal Bot! You will receive crypto trading signals here.');
// });

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);
// });

// // On process exit cleanup
// process.on('SIGINT', () => {
//   console.log('Bot shutting down...');
//   process.exit();
// });









// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// const cron = require('node-cron');

// // Telegram Bot Token
// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// // Crypto Symbols
// const SYMBOLS = [
//   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
//   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
//   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
//   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
//   'SHIBUSDT'
// ];

// // Intervals and Params
// const INTERVAL_1M = '1m';
// const INTERVAL_1H = '1h';
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;
// const VOLUME_SMA_PERIOD = 20;
// const EMA_1H_PERIOD = 200;

// // Initialize Telegram Bot
// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// // User Data
// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { symbol: tradeDetails } }

// // Fetch candle data from Binance
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

// // Fetch current price
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

// // Analyze 1m candle data
// function analyzeData1m(candles) {
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

// // Analyze 1h candle data (EMA200)
// function analyzeData1h(candles) {
//   const closes = candles.map(c => c.close);
//   if (closes.length < EMA_1H_PERIOD) return null;
//   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
//   if (ema200.length === 0) return null;
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

// // Symbol index for cycling through symbols
// let symbolIndex = 0;

// // Check next symbol and send signal for all users
// async function checkNextSymbol() {
//   const symbol = SYMBOLS[symbolIndex];
//   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

//   // Fetch candle and price data once per symbol for efficiency
//   const candles1m = await fetchKlines(symbol, INTERVAL_1M);
//   const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
//   const currentPrice = await fetchCurrentPrice(symbol);
//   if (!candles1m || !candles1h || !currentPrice) return;

//   const analysis1m = analyzeData1m(candles1m);
//   if (!analysis1m) return;

//   const ema200_1h = analyzeData1h(candles1h);
//   if (!ema200_1h) return;

//   for (const chatId of USER_CHAT_IDS) {
//     if (!activeTrades[chatId]) activeTrades[chatId] = {};

//     // Agar is symbol ka active trade already hai, to naye signals na bhejein
//     if (activeTrades[chatId][symbol]) {
//       // Active trade hai, isliye signal bhejne se skip karo
//       continue;
//     }

//     let finalSignal = 'HOLD';
//     if (analysis1m.signal === 'BUY' && analysis1m.lastClose > ema200_1h) finalSignal = 'BUY';
//     else if (analysis1m.signal === 'SELL' && analysis1m.lastClose < ema200_1h) finalSignal = 'SELL';

//     if (finalSignal === 'HOLD') {
//       try {
//         await bot.sendMessage(chatId,
//           `📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})\n⚪ Signal: HOLD\n💰 Current Price: ${currentPrice.toFixed(2)}\nNo strong signal found.`);
//       } catch (err) {
//         console.error(`Failed to send HOLD message to ${chatId}:`, err.message);
//       }
//       continue;
//     }

//     // Calculate target and stoploss
//     let target, stoploss;
//     if (finalSignal === 'BUY') {
//       target = analysis1m.lastClose + TARGET_MULTIPLIER * analysis1m.lastAtr;
//       stoploss = analysis1m.lastClose - STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
//     } else {
//       target = analysis1m.lastClose - TARGET_MULTIPLIER * analysis1m.lastAtr;
//       stoploss = analysis1m.lastClose + STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
//     }

//     const msg = `
// 📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})
// 📈 Signal: ${finalSignal}
// 💰 Entry: ${currentPrice.toFixed(2)}
// 🎯 Target: ${target.toFixed(2)}
// 🛑 Stoploss: ${stoploss.toFixed(2)}

// 📊 RSI (1m): ${analysis1m.lastRsi.toFixed(2)}
// 📉 EMA14 (1m): ${analysis1m.lastEma.toFixed(2)}
// 📈 MACD (1m): ${analysis1m.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line: ${analysis1m.lastMacd.signal.toFixed(2)}
// 📊 Volume: ${analysis1m.lastVolume.toFixed(0)}
// 📉 Avg Vol SMA20: ${analysis1m.lastVolumeSMA.toFixed(0)}
// 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
//     `;

//     try {
//       await bot.sendMessage(chatId, msg);
//     } catch (err) {
//       console.error(`Failed to send signal message to ${chatId}:`, err.message);
//     }

//     // Set active trade for this symbol and user
//     activeTrades[chatId][symbol] = {
//       signal: finalSignal,
//       entryPrice: currentPrice,
//       target,
//       stoploss
//     };
//   }
// }

// // Monitor active trades and check if target/stoploss hit
// async function monitorTrades() {
//   for (const chatId of USER_CHAT_IDS) {
//     const trades = activeTrades[chatId];
//     if (!trades) continue;

//     for (const symbol in trades) {
//       const trade = trades[symbol];
//       const currentPrice = await fetchCurrentPrice(symbol);
//       if (!currentPrice) continue;

//       const hit = checkIfHit(currentPrice, trade);
//       if (hit === 'target') {
//         try {
//           await bot.sendMessage(chatId, `🎯 Target hit for ${symbol} at ${currentPrice.toFixed(2)}! Congratulations!`);
//         } catch (err) {
//           console.error(`Failed to send target hit message to ${chatId}:`, err.message);
//         }
//         // Remove trade after target hit
//         delete activeTrades[chatId][symbol];
//       } else if (hit === 'stoploss') {
//         try {
//           await bot.sendMessage(chatId, `🛑 Stoploss hit for ${symbol} at ${currentPrice.toFixed(2)}. Please review your trade.`);
//         } catch (err) {
//           console.error(`Failed to send stoploss hit message to ${chatId}:`, err.message);
//         }
//         // Remove trade after stoploss hit
//         delete activeTrades[chatId][symbol];
//       }
//     }
//   }
// }

// // Telegram command to check active trades status
// bot.onText(/\/status/, async (msg) => {
//   const chatId = msg.chat.id;

//   if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);

//   if (!activeTrades[chatId] || Object.keys(activeTrades[chatId]).length === 0) {
//     return bot.sendMessage(chatId, '❌ You have no active trades.');
//   }

//   let statusMsg = '📊 Status of Your Active Trade:\n\n';

//   for (const symbol in activeTrades[chatId]) {
//     const trade = activeTrades[chatId][symbol];
//     const currentPrice = await fetchCurrentPrice(symbol);
//     if (!currentPrice) {
//       statusMsg += `${symbol}: Current price fetch nahi ho paya.\n\n`;
//       continue;
//     }
//     statusMsg += `
// ${symbol}
// Signal: ${trade.signal}
// Entry Price: ${trade.entryPrice.toFixed(2)}
// Current Price: ${currentPrice.toFixed(2)}
// Target: ${trade.target.toFixed(2)}
// Stoploss: ${trade.stoploss.toFixed(2)}
// ------------------------
// `;
//   }

//   bot.sendMessage(chatId, statusMsg);
// });

// // Telegram bot commands
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);
//   bot.sendMessage(chatId, '👋 Welcome! You will receive crypto signals here');
// });

// // Schedule symbol check every 20 seconds (symbol-wise cycling)
// cron.schedule('*/20 * * * * *', () => {
//   checkNextSymbol();
// });

// // Schedule active trades monitor every 60 seconds
// cron.schedule('*/60 * * * * *', () => {
//   monitorTrades();
// });









// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// const cron = require('node-cron');

// // Telegram Bot Token
// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// // Crypto Symbols
// const SYMBOLS = [
//   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
//   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
//   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
//   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
//   'SHIBUSDT'
// ];

// // Intervals and Params
// const INTERVAL_1M = '1m';
// // Changed from '1h' to '15m' as per request
// const INTERVAL_1H = '15m';
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;
// const VOLUME_SMA_PERIOD = 20;
// const EMA_1H_PERIOD = 200;

// // Initialize Telegram Bot
// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// // User Data
// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { symbol: tradeDetails } }

// // Fetch candle data from Binance
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

// // Fetch current price
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

// // Analyze 1m candle data
// function analyzeData1m(candles) {
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

// // Analyze 1h candle data (EMA200)
// function analyzeData1h(candles) {
//   const closes = candles.map(c => c.close);
//   if (closes.length < EMA_1H_PERIOD) return null;
//   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
//   if (ema200.length === 0) return null;
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

// // Symbol index for cycling through symbols
// let symbolIndex = 0;

// // Check next symbol and send signal for all users
// async function checkNextSymbol() {
//   const symbol = SYMBOLS[symbolIndex];
//   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

//   // Fetch candle and price data once per symbol for efficiency
//   const candles1m = await fetchKlines(symbol, INTERVAL_1M);
//   const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
//   const currentPrice = await fetchCurrentPrice(symbol);
//   if (!candles1m || !candles1h || !currentPrice) return;

//   const analysis1m = analyzeData1m(candles1m);
//   if (!analysis1m) return;

//   const ema200_1h = analyzeData1h(candles1h);
//   if (!ema200_1h) return;

//   for (const chatId of USER_CHAT_IDS) {
//     if (!activeTrades[chatId]) activeTrades[chatId] = {};

//     // Agar is symbol ka active trade already hai, to naye signals na bhejein
//     if (activeTrades[chatId][symbol]) {
//       // Active trade hai, isliye signal bhejne se skip karo
//       continue;
//     }

//     let finalSignal = 'HOLD';
//     if (analysis1m.signal === 'BUY' && analysis1m.lastClose > ema200_1h) finalSignal = 'BUY';
//     else if (analysis1m.signal === 'SELL' && analysis1m.lastClose < ema200_1h) finalSignal = 'SELL';

//     if (finalSignal === 'HOLD') {
//       try {
//         await bot.sendMessage(chatId,
//           `📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})\n⚪ Signal: HOLD\n💰 Current Price: ${currentPrice.toFixed(2)}\nNo strong signal found.`);
//       } catch (err) {
//         console.error(`Failed to send HOLD message to ${chatId}:`, err.message);
//       }
//       continue;
//     }

//     // Calculate target and stoploss
//     let target, stoploss;
//     if (finalSignal === 'BUY') {
//       target = analysis1m.lastClose + TARGET_MULTIPLIER * analysis1m.lastAtr;
//       stoploss = analysis1m.lastClose - STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
//     } else {
//       target = analysis1m.lastClose - TARGET_MULTIPLIER * analysis1m.lastAtr;
//       stoploss = analysis1m.lastClose + STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
//     }

//     const msg = `
// 📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})
// 📈 Signal: ${finalSignal}
// 💰 Entry: ${currentPrice.toFixed(2)}
// 🎯 Target: ${target.toFixed(2)}
// 🛑 Stoploss: ${stoploss.toFixed(2)}

// 📊 RSI (1m): ${analysis1m.lastRsi.toFixed(2)}
// 📉 EMA14 (1m): ${analysis1m.lastEma.toFixed(2)}
// 📈 MACD (1m): ${analysis1m.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line: ${analysis1m.lastMacd.signal.toFixed(2)}
// 📊 Volume: ${analysis1m.lastVolume.toFixed(0)}
// 📉 Avg Vol SMA20: ${analysis1m.lastVolumeSMA.toFixed(0)}
// 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
//     `;

//     try {
//       await bot.sendMessage(chatId, msg);
//     } catch (err) {
//       console.error(`Failed to send signal message to ${chatId}:`, err.message);
//     }

//     // Set active trade for this symbol and user
//     activeTrades[chatId][symbol] = {
//       signal: finalSignal,
//       entryPrice: currentPrice,
//       target,
//       stoploss
//     };
//   }
// }

// // Monitor active trades and check if target/stoploss hit
// async function monitorTrades() {
//   for (const chatId of USER_CHAT_IDS) {
//     const trades = activeTrades[chatId];
//     if (!trades) continue;

//     for (const symbol of Object.keys(trades)) {
//       const trade = trades[symbol];
//       const currentPrice = await fetchCurrentPrice(symbol);
//       if (!currentPrice) continue;

//       const hit = checkIfHit(currentPrice, trade);
//       if (hit) {
//         let msg;
//         if (hit === 'target') {
//           msg = `✅ Trade Alert for ${symbol}\nTarget HIT at ${currentPrice.toFixed(2)}! Congratulations! 🎉`;
//         } else {
//           msg = `⚠️ Trade Alert for ${symbol}\nStoploss HIT at ${currentPrice.toFixed(2)}. Please review your position.`;
//         }

//         try {
//           await bot.sendMessage(chatId, msg);
//         } catch (err) {
//           console.error(`Failed to send trade alert to ${chatId}:`, err.message);
//         }

//         // Remove active trade after hit
//         delete activeTrades[chatId][symbol];
//       }
//     }
//   }
// }

// // Telegram Bot Commands
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) USER_CHAT_IDS.push(chatId);
//   bot.sendMessage(chatId, 'Welcome! You will now receive crypto signals every 5 minutes.');
// });

// bot.onText(/\/stop/, (msg) => {
//   const chatId = msg.chat.id;
//   USER_CHAT_IDS = USER_CHAT_IDS.filter(id => id !== chatId);
//   delete activeTrades[chatId];
//   bot.sendMessage(chatId, 'You have unsubscribed from crypto signals.');
// });

// // Schedule signal check every 15 seconds (to rotate through symbols quickly)
// cron.schedule('*/15 * * * * *', checkNextSymbol);

// // Schedule trade monitoring every 1 minute
// cron.schedule('*/60 * * * * *', monitorTrades);

// console.log('Crypto Signal Bot is running...');







// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');
// const cron = require('node-cron');

// // Telegram Bot Token
// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// // Crypto Symbols
// const SYMBOLS = [
//   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
//   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
//   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
//   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
//   'SHIBUSDT'
// ];

// // Intervals and Params
// const INTERVAL_1M = '1m';
// // Changed from '1h' to '15m' as per request
// const INTERVAL_1H = '15m';
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;
// const VOLUME_SMA_PERIOD = 20;
// const EMA_1H_PERIOD = 200;

// // Initialize Telegram Bot
// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// // User Data
// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { symbol: tradeDetails } }

// // Fetch candle data from Binance
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

// // Fetch current price
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

// // Analyze 1m candle data
// function analyzeData1m(candles) {
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

// // Analyze 1h candle data (EMA200)
// function analyzeData1h(candles) {
//   const closes = candles.map(c => c.close);
//   if (closes.length < EMA_1H_PERIOD) return null;
//   const ema200 = EMA.calculate({ values: closes, period: EMA_1H_PERIOD });
//   if (ema200.length === 0) return null;
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

// // Symbol index for cycling through symbols
// let symbolIndex = 0;

// // Check next symbol and send signal for all users
// async function checkNextSymbol() {
//   const symbol = SYMBOLS[symbolIndex];
//   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

//   // Fetch candle and price data once per symbol for efficiency
//   const candles1m = await fetchKlines(symbol, INTERVAL_1M);
//   const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
//   const currentPrice = await fetchCurrentPrice(symbol);
//   if (!candles1m || !candles1h || !currentPrice) return;

//   const analysis1m = analyzeData1m(candles1m);
//   if (!analysis1m) return;

//   const ema200_1h = analyzeData1h(candles1h);
//   if (!ema200_1h) return;

//   for (const chatId of USER_CHAT_IDS) {
//     if (!activeTrades[chatId]) activeTrades[chatId] = {};

//     // Agar is symbol ka active trade already hai, to naye signals na bhejein
//     if (activeTrades[chatId][symbol]) {
//       // Active trade hai, isliye signal bhejne se skip karo
//       continue;
//     }

//     let finalSignal = 'HOLD';
//     if (analysis1m.signal === 'BUY' && analysis1m.lastClose > ema200_1h) finalSignal = 'BUY';
//     else if (analysis1m.signal === 'SELL' && analysis1m.lastClose < ema200_1h) finalSignal = 'SELL';

//     if (finalSignal === 'HOLD') {
//       try {
//         await bot.sendMessage(chatId,
//           `📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})\n⚪ Signal: HOLD\n💰 Current Price: ${currentPrice.toFixed(2)}\nNo strong signal found.`, {
//             reply_markup: {
//               inline_keyboard: [[
//                 { text: 'Check Status', callback_data: `status_${symbol}` }
//               ]]
//             }
//           }
//         );
//       } catch (err) {
//         console.error(`Failed to send HOLD message to ${chatId}:`, err.message);
//       }
//       continue;
//     }

//     // Calculate target and stoploss
//     let target, stoploss;
//     if (finalSignal === 'BUY') {
//       target = analysis1m.lastClose + TARGET_MULTIPLIER * analysis1m.lastAtr;
//       stoploss = analysis1m.lastClose - STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
//     } else {
//       target = analysis1m.lastClose - TARGET_MULTIPLIER * analysis1m.lastAtr;
//       stoploss = analysis1m.lastClose + STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
//     }

//     const msg = `
// 📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})
// 📈 Signal: ${finalSignal}
// 💰 Entry: ${currentPrice.toFixed(2)}
// 🎯 Target: ${target.toFixed(2)}
// 🛑 Stoploss: ${stoploss.toFixed(2)}

// 📊 RSI (1m): ${analysis1m.lastRsi.toFixed(2)}
// 📉 EMA14 (1m): ${analysis1m.lastEma.toFixed(2)}
// 📈 MACD (1m): ${analysis1m.lastMacd.MACD.toFixed(2)}
// 🟡 Signal Line: ${analysis1m.lastMacd.signal.toFixed(2)}
// 📊 Volume: ${analysis1m.lastVolume.toFixed(0)}
// 📉 Avg Vol SMA20: ${analysis1m.lastVolumeSMA.toFixed(0)}
// 📉 EMA200 (1h): ${ema200_1h.toFixed(2)}
//     `;

//     try {
//       await bot.sendMessage(chatId, msg, {
//         reply_markup: {
//           inline_keyboard: [[
//             { text: 'Check Status', callback_data: `status_${symbol}` }
//           ]]
//         }
//       });
//     } catch (err) {
//       console.error(`Failed to send signal message to ${chatId}:`, err.message);
//     }

//     // Set active trade for this symbol and user
//     activeTrades[chatId][symbol] = {
//       signal: finalSignal,
//       entryPrice: currentPrice,
//       target,
//       stoploss
//     };
//   }
// }

// // Monitor active trades and check if target/stoploss hit
// async function monitorTrades() {
//   for (const chatId of USER_CHAT_IDS) {
//     const trades = activeTrades[chatId];
//     if (!trades) continue;

//     for (const symbol of Object.keys(trades)) {
//       const trade = trades[symbol];
//       const currentPrice = await fetchCurrentPrice(symbol);
//       if (!currentPrice) continue;

//       const hit = checkIfHit(currentPrice, trade);
//       if (hit) {
//         let msg;
//         if (hit === 'target') {
//           msg = `✅ Trade Alert for ${symbol}\nTarget HIT at ${currentPrice.toFixed(2)}! Congratulations! 🎉`;
//         } else {
//           msg = `⚠️ Trade Alert for ${symbol}\nStoploss HIT at ${currentPrice.toFixed(2)}. Please review your position.`;
//         }

//         try {
//           await bot.sendMessage(chatId, msg);
//         } catch (err) {
//           console.error(`Failed to send trade alert to ${chatId}:`, err.message);
//         }

//         // Remove active trade after hit
//         delete activeTrades[chatId][symbol];
//       }
//     }
//   }
// }

// // Handle button callbacks
// bot.on('callback_query', async (callbackQuery) => {
//   const msg = callbackQuery.message;
//   const chatId = msg.chat.id;
//   const data = callbackQuery.data;

//   if (data.startsWith('status_')) {
//     const symbol = data.split('_')[1];
//     const trade = activeTrades[chatId]?.[symbol];

//     if (!trade) {
//       await bot.answerCallbackQuery(callbackQuery.id, { text: `No active trade found for ${symbol}.` });
//       return;
//     }

//     const currentPrice = await fetchCurrentPrice(symbol);
//     if (!currentPrice) {
//       await bot.answerCallbackQuery(callbackQuery.id, { text: 'Unable to fetch current price.' });
//       return;
//     }

//     // Calculate remaining distance to target and stoploss
//     let statusMsg = `Status for ${symbol}:\n`;
//     statusMsg += `Signal: ${trade.signal}\n`;
//     statusMsg += `Entry Price: ${trade.entryPrice.toFixed(2)}\n`;
//     statusMsg += `Current Price: ${currentPrice.toFixed(2)}\n`;
//     statusMsg += `Target: ${trade.target.toFixed(2)} (${(trade.target - currentPrice).toFixed(2)} away)\n`;
//     statusMsg += `Stoploss: ${trade.stoploss.toFixed(2)} (${(trade.stoploss - currentPrice).toFixed(2)} away)\n`;

//     await bot.answerCallbackQuery(callbackQuery.id, { text: statusMsg, show_alert: true });
//   }
// });

// // Start command to add users
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) {
//     USER_CHAT_IDS.push(chatId);
//   }
//   bot.sendMessage(chatId, `Welcome! You will start receiving crypto signals for: ${SYMBOLS.join(', ')}`);
// });

// // Run every 10 seconds to check next symbol (fast cycling)
// cron.schedule('*/10 * * * * *', checkNextSymbol);

// // Run every 30 seconds to monitor trades and send alerts if target/stoploss hit
// cron.schedule('*/30 * * * * *', monitorTrades);

// console.log('Bot started and running...');






// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');

// // Telegram Bot Token
// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// // Symbols list
// const SYMBOLS = [
//   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
//   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
//   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
//   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
//   'SHIBUSDT'
// ];

// // Intervals & parameters
// const INTERVAL_1M = '1m';
// const INTERVAL_1H = '15m';
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;
// const VOLUME_SMA_PERIOD = 20;
// const EMA_1H_PERIOD = 200;

// // Initialize bot
// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// // Users & active trades store
// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { symbol: { signal, entry, target, stoploss } } }

// // Binance API fetch helpers
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
//     console.error(`Error fetching price for ${symbol}:`, err.message);
//     return null;
//   }
// }

// // Technical analysis functions same as before
// function analyzeData1m(candles) {
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

// let symbolIndex = 0;

// // Core function to check signals for next symbol
// async function checkNextSymbol() {
//   const symbol = SYMBOLS[symbolIndex];
//   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

//   const candles1m = await fetchKlines(symbol, INTERVAL_1M);
//   const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
//   const currentPrice = await fetchCurrentPrice(symbol);

//   if (!candles1m || !candles1h || !currentPrice) return;

//   const analysis1m = analyzeData1m(candles1m);
//   if (!analysis1m) return;

//   const ema200_1h = analyzeData1h(candles1h);
//   if (!ema200_1h) return;

//   for (const chatId of USER_CHAT_IDS) {
//     if (!activeTrades[chatId]) activeTrades[chatId] = {};

//     // Skip if trade already active on this symbol
//     if (activeTrades[chatId][symbol]) continue;

//     let finalSignal = 'HOLD';
//     if (analysis1m.signal === 'BUY' && analysis1m.lastClose > ema200_1h) finalSignal = 'BUY';
//     else if (analysis1m.signal === 'SELL' && analysis1m.lastClose < ema200_1h) finalSignal = 'SELL';

//     if (finalSignal === 'HOLD') {
//       await bot.sendMessage(chatId,
//         `📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})\nSignal: HOLD\nCurrent Price: ${currentPrice.toFixed(2)}\nNo strong signal found.`
//       );
//       continue;
//     }

//     // Calculate target and stoploss
//     let target, stoploss;
//     if (finalSignal === 'BUY') {
//       target = analysis1m.lastClose + TARGET_MULTIPLIER * analysis1m.lastAtr;
//       stoploss = analysis1m.lastClose - STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
//     } else {
//       target = analysis1m.lastClose - TARGET_MULTIPLIER * analysis1m.lastAtr;
//       stoploss = analysis1m.lastClose + STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
//     }

//     // Save active trade
//     activeTrades[chatId][symbol] = {
//       signal: finalSignal,
//       entry: currentPrice,
//       target,
//       stoploss,
//       time: Date.now()
//     };

//     const msg = `
// 📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})
// Signal: ${finalSignal}
// Entry Price: ${currentPrice.toFixed(2)}
// Target: ${target.toFixed(2)}
// Stoploss: ${stoploss.toFixed(2)}
// `;

//     await bot.sendMessage(chatId, msg);
//   }
// }

// // Check active trades every 15 seconds for target/stoploss hits
// async function monitorActiveTrades() {
//   for (const chatId of USER_CHAT_IDS) {
//     const trades = activeTrades[chatId];
//     if (!trades) continue;

//     for (const symbol in trades) {
//       const trade = trades[symbol];
//       const currentPrice = await fetchCurrentPrice(symbol);
//       if (!currentPrice) continue;

//       const hit = checkIfHit(currentPrice, trade);
//       if (hit) {
//         const hitText = hit === 'target' ? '🎯 Target hit!' : '🛑 Stoploss hit!';
//         const msg = `
// 🚨 Trade Update for ${symbol} 🚨
// Signal: ${trade.signal}
// Entry: ${trade.entry.toFixed(2)}
// Current Price: ${currentPrice.toFixed(2)}
// ${hitText}

// Trade closed.
// `;

//         await bot.sendMessage(chatId, msg);

//         // Remove the trade since target/stoploss hit
//         delete activeTrades[chatId][symbol];
//       }
//     }
//   }
// }

// // Bot commands

// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) {
//     USER_CHAT_IDS.push(chatId);
//     bot.sendMessage(chatId, 'Welcome! You will start receiving crypto signals.');
//   } else {
//     bot.sendMessage(chatId, 'You are already subscribed.');
//   }
// });

// bot.onText(/\/status/, (msg) => {
//   const chatId = msg.chat.id;
//   const trades = activeTrades[chatId];
//   if (!trades || Object.keys(trades).length === 0) {
//     bot.sendMessage(chatId, 'You have no active trades currently.');
//     return;
//   }

//   let statusMsg = '📊 Your Active Trades:\n\n';
//   for (const symbol in trades) {
//     const t = trades[symbol];
//     statusMsg += `
// ${symbol}:
//  Signal: ${t.signal}
//  Entry: ${t.entry.toFixed(2)}
//  Target: ${t.target.toFixed(2)}
//  Stoploss: ${t.stoploss.toFixed(2)}
// ----------------------
// `;
//   }

//   bot.sendMessage(chatId, statusMsg);
// });

// // Periodic jobs
// setInterval(checkNextSymbol, 10 * 1000); // Every 10 seconds
// setInterval(monitorActiveTrades, 15 * 1000); // Every 15 seconds






// require('dotenv').config();
// const axios = require('axios');
// const TelegramBot = require('node-telegram-bot-api');
// const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');

// // Telegram Bot Token
// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// // Symbols list
// const SYMBOLS = [
//   'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
//   'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
//   'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
//   'LTCUSDT', 'TRXUSDT', 'AVAXUSDT',
//   'SHIBUSDT'
// ];

// // Intervals & parameters
// const INTERVAL_1M = '15m';  // Changed from '1m' to '15m'
// const INTERVAL_1H = '1h';   // Optional, aap isko waise hi rakh sakte hain
// const TARGET_MULTIPLIER = 1.5;
// const STOPLOSS_MULTIPLIER = 1.0;
// const VOLUME_SMA_PERIOD = 20;
// const EMA_1H_PERIOD = 200;

// // Initialize bot
// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// // Users & active trades store
// let USER_CHAT_IDS = [];
// let activeTrades = {}; // { chatId: { symbol: { signal, entry, target, stoploss } } }

// // Binance API fetch helpers
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
//     console.error(`Error fetching price for ${symbol}:`, err.message);
//     return null;
//   }
// }

// // Technical analysis functions same as before
// function analyzeData1m(candles) {
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

// let symbolIndex = 0;

// // Core function to check signals for next symbol
// async function checkNextSymbol() {
//   const symbol = SYMBOLS[symbolIndex];
//   symbolIndex = (symbolIndex + 1) % SYMBOLS.length;

//   const candles1m = await fetchKlines(symbol, INTERVAL_1M);
//   const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
//   const currentPrice = await fetchCurrentPrice(symbol);

//   if (!candles1m || !candles1h || !currentPrice) return;

//   const analysis1m = analyzeData1m(candles1m);
//   if (!analysis1m) return;

//   const ema200_1h = analyzeData1h(candles1h);
//   if (!ema200_1h) return;

//   for (const chatId of USER_CHAT_IDS) {
//     if (!activeTrades[chatId]) activeTrades[chatId] = {};

//     // Skip if trade already active on this symbol
//     if (activeTrades[chatId][symbol]) continue;

//     let finalSignal = 'HOLD';
//     if (analysis1m.signal === 'BUY' && analysis1m.lastClose > ema200_1h) finalSignal = 'BUY';
//     else if (analysis1m.signal === 'SELL' && analysis1m.lastClose < ema200_1h) finalSignal = 'SELL';

//     if (finalSignal === 'HOLD') {
//       await bot.sendMessage(chatId,
//         `📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})\nSignal: HOLD\nCurrent Price: ${currentPrice.toFixed(2)}\nNo strong signal found.`
//       );
//       continue;
//     }

//     // Calculate target and stoploss
//     let target, stoploss;
//     if (finalSignal === 'BUY') {
//       target = analysis1m.lastClose + TARGET_MULTIPLIER * analysis1m.lastAtr;
//       stoploss = analysis1m.lastClose - STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
//     } else {
//       target = analysis1m.lastClose - TARGET_MULTIPLIER * analysis1m.lastAtr;
//       stoploss = analysis1m.lastClose + STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
//     }

//     // Save active trade
//     activeTrades[chatId][symbol] = {
//       signal: finalSignal,
//       entry: currentPrice,
//       target,
//       stoploss,
//       time: Date.now()
//     };

//     const msg = `
// 📡 Crypto Signal - ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})
// Signal: ${finalSignal}
// Entry Price: ${currentPrice.toFixed(2)}
// Target: ${target.toFixed(2)}
// Stoploss: ${stoploss.toFixed(2)}
// `;

//     await bot.sendMessage(chatId, msg);
//   }
// }

// // Check active trades every 15 seconds for target/stoploss hits
// async function monitorActiveTrades() {
//   for (const chatId of USER_CHAT_IDS) {
//     const trades = activeTrades[chatId];
//     if (!trades) continue;

//     for (const symbol in trades) {
//       const trade = trades[symbol];
//       const currentPrice = await fetchCurrentPrice(symbol);
//       if (!currentPrice) continue;

//       const hit = checkIfHit(currentPrice, trade);
//       if (hit) {
//         const hitText = hit === 'target' ? '🎯 Target hit!' : '🛑 Stoploss hit!';
//         const msg = `
// 🚨 Trade Update for ${symbol} 🚨
// Signal: ${trade.signal}
// Entry: ${trade.entry.toFixed(2)}
// Current Price: ${currentPrice.toFixed(2)}
// ${hitText}

// Trade closed.
// `;

//         await bot.sendMessage(chatId, msg);

//         // Remove the trade since target/stoploss hit
//         delete activeTrades[chatId][symbol];
//       }
//     }
//   }
// }

// // Bot commands

// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   if (!USER_CHAT_IDS.includes(chatId)) {
//     USER_CHAT_IDS.push(chatId);
//     bot.sendMessage(chatId, 'Welcome! You will start receiving crypto signals.');
//   } else {
//     bot.sendMessage(chatId, 'You are already subscribed.');
//   }
// });

// bot.onText(/\/status/, (msg) => {
//   const chatId = msg.chat.id;
//   const trades = activeTrades[chatId];
//   if (!trades || Object.keys(trades).length === 0) {
//     bot.sendMessage(chatId, 'You have no active trades currently.');
//     return;
//   }

//   let statusMsg = '📊 Your Active Trades:\n\n';
//   for (const symbol in trades) {
//     const t = trades[symbol];
//     statusMsg += `
// ${symbol}:
//  Signal: ${t.signal}
//  Entry: ${t.entry.toFixed(2)}
//  Target: ${t.target.toFixed(2)}
//  Stoploss: ${t.stoploss.toFixed(2)}
// ----------------------
// `;
//   }

//   bot.sendMessage(chatId, statusMsg);
// });

// // Periodic jobs
// setInterval(checkNextSymbol, 10 * 1000); // Every 10 seconds
// setInterval(monitorActiveTrades, 15 * 1000); // Every 15 seconds

















require('dotenv').config();
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const { RSI, EMA, MACD, ATR, SMA } = require('technicalindicators');

// Telegram Bot Token
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Symbols list
const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT',
  'DOGEUSDT', 'SOLUSDT', 'DOTUSDT', 'MATICUSDT',
  'LTCUSDT', 'TRXUSDT', 'AVAXUSDT', 'SHIBUSDT'
];

// Settings
const INTERVAL_1M = '15m';
const INTERVAL_1H = '1h';
const TARGET_MULTIPLIER = 1.5;
const STOPLOSS_MULTIPLIER = 1.0;
const VOLUME_SMA_PERIOD = 20;
const EMA_1H_PERIOD = 200;

// Initialize bot
const bot = new TelegramBot('7739855919:AAF2JCiwZW5bXkLAcrUx6HPCMCcgE8GJ35c', { polling: true });
let USER_CHAT_IDS = [];
let activeTrades = {};  // { chatId: { symbol: { signal, entry, target, stoploss } } }

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
    console.error(`Error fetching price for ${symbol}:`, err.message);
    return null;
  }
}

function analyzeData1m(candles) {
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

  const candles1m = await fetchKlines(symbol, INTERVAL_1M);
  const candles1h = await fetchKlines(symbol, INTERVAL_1H, 300);
  const currentPrice = await fetchCurrentPrice(symbol);

  if (!candles1m || !candles1h || !currentPrice) return;

  const analysis1m = analyzeData1m(candles1m);
  if (!analysis1m) return;

  const ema200_1h = analyzeData1h(candles1h);
  if (!ema200_1h) return;

  for (const chatId of USER_CHAT_IDS) {
    if (!activeTrades[chatId]) activeTrades[chatId] = {};

    if (activeTrades[chatId][symbol]) continue;

    let finalSignal = 'HOLD';
    if (analysis1m.signal === 'BUY' && analysis1m.lastClose > ema200_1h) finalSignal = 'BUY';
    else if (analysis1m.signal === 'SELL' && analysis1m.lastClose < ema200_1h) finalSignal = 'SELL';

    if (finalSignal === 'HOLD') {
      await bot.sendMessage(chatId,
        `📡 ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})\nSignal: HOLD\nPrice: ${currentPrice.toFixed(2)}\nNo strong signal.`);
      continue;
    }

    let target, stoploss;
    if (finalSignal === 'BUY') {
      target = analysis1m.lastClose + TARGET_MULTIPLIER * analysis1m.lastAtr;
      stoploss = analysis1m.lastClose - STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
    } else {
      target = analysis1m.lastClose - TARGET_MULTIPLIER * analysis1m.lastAtr;
      stoploss = analysis1m.lastClose + STOPLOSS_MULTIPLIER * analysis1m.lastAtr;
    }

    activeTrades[chatId][symbol] = {
      signal: finalSignal,
      entry: currentPrice,
      target,
      stoploss,
      time: Date.now()
    };

    const msg = `📡 ${symbol} (${INTERVAL_1M} + ${INTERVAL_1H})
Signal: ${finalSignal}
Entry: ${currentPrice.toFixed(2)}
Target: ${target.toFixed(2)}
Stoploss: ${stoploss.toFixed(2)}`;

    await bot.sendMessage(chatId, msg);
  }
}

async function monitorActiveTrades() {
  for (const chatId of USER_CHAT_IDS) {
    const trades = activeTrades[chatId];
    if (!trades) continue;

    for (const symbol in trades) {
      const trade = trades[symbol];
      const currentPrice = await fetchCurrentPrice(symbol);
      if (!currentPrice) continue;

      const hit = checkIfHit(currentPrice, trade);
      if (hit) {
        const hitText = hit === 'target' ? '🎯 Target hit!' : '🛑 Stoploss hit!';
        const msg = `🚨 Trade Update - ${symbol}
Signal: ${trade.signal}
Entry: ${trade.entry.toFixed(2)}
Price: ${currentPrice.toFixed(2)}
${hitText}
Trade closed.`;

        await bot.sendMessage(chatId, msg);
        delete activeTrades[chatId][symbol];
      }
    }
  }
}

// Telegram commands

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (!USER_CHAT_IDS.includes(chatId)) {
    USER_CHAT_IDS.push(chatId);
    bot.sendMessage(chatId, '✅ Welcome! You will now receive crypto signals.');
  } else {
    bot.sendMessage(chatId, 'You are already subscribed.');
  }
});

bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  const trades = activeTrades[chatId];
  if (!trades || Object.keys(trades).length === 0) {
    bot.sendMessage(chatId, '📭 No active trades.');
    return;
  }

  let statusMsg = '📊 Active Trades:\n';
  for (const symbol in trades) {
    const t = trades[symbol];
    statusMsg += `\n${symbol}:
 Signal: ${t.signal}
 Entry: ${t.entry.toFixed(2)}
 Target: ${t.target.toFixed(2)}
 Stoploss: ${t.stoploss.toFixed(2)}
------------------`;
  }
  bot.sendMessage(chatId, statusMsg);
});

// Set intervals
setInterval(checkNextSymbol, 100000);
setInterval(monitorActiveTrades, 150000);






















