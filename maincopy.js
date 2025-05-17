





require('dotenv').config();
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const { RSI, EMA, MACD, ATR } = require('technicalindicators');

const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN'; // yahan apna token daalein

const bot = new TelegramBot('8003756443:AAHOP678U2KdAiTuVYQZVQ2DsYnT2Oq4PnE', { polling: true });

// === CONFIG ===
const SYMBOL = 'BTCUSDT';
const INTERVAL = '5m';
const TARGET_MULTIPLIER = 1.5;
const STOPLOSS_MULTIPLIER = 1.0;

// === STATE ===
let USER_CHAT_IDS = [];
let activeTrades = {}; // { chatId: { signal, target, stoploss } }

// === FETCH CANDLES ===
async function fetchKlines(symbol, interval, limit = 100) {
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
}

// === FETCH CURRENT PRICE ===
async function fetchCurrentPrice(symbol) {
  const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
  const res = await axios.get(url);
  return parseFloat(res.data.price);
}

// === ANALYZE ===
function analyzeData(candles) {
  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

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

  const lastClose = closes[closes.length - 1];
  const lastEma = ema[ema.length - 1];
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

// === CHECK IF TRADE HIT ===
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

// === MAIN SIGNAL FUNCTION ===
async function sendSignal() {
  if (USER_CHAT_IDS.length === 0) return;

  try {
    const candles = await fetchKlines(SYMBOL, INTERVAL);
    const currentPrice = await fetchCurrentPrice(SYMBOL);
    if (!currentPrice) return;

    for (const chatId of USER_CHAT_IDS) {
      const trade = activeTrades[chatId];

      if (trade) {
        const hit = checkIfHit(currentPrice, trade);
        if (hit) {
          await bot.sendMessage(chatId, `⚠️ *${trade.signal}* trade closed due to *${hit.toUpperCase()}* hit at ${currentPrice.toFixed(2)}.\nNew signals will now be considered.`, { parse_mode: 'Markdown' });
          activeTrades[chatId] = null;
        } else {
          console.log(`⏳ Waiting for ${chatId}'s trade to finish. Price: ${currentPrice}`);
          continue;
        }
      }

      // Only send new signal if there's no active trade
      if (!activeTrades[chatId]) {
        const analysis = analyzeData(candles);

        if (analysis.signal === 'HOLD') {
          console.log(`No signal for ${chatId}`);
          continue;
        }

        const msg = `
*Crypto Signal - ${SYMBOL} (${INTERVAL})*
📈 *Signal:* ${analysis.signal}
💰 *Price:* ${currentPrice.toFixed(2)}

🎯 *Target:* ${analysis.target.toFixed(2)}
🛑 *Stoploss:* ${analysis.stoploss.toFixed(2)}

📊 *RSI:* ${analysis.lastRsi.toFixed(2)}
📉 *EMA14:* ${analysis.lastEma.toFixed(2)}
📈 *MACD:* ${analysis.lastMacd.MACD.toFixed(2)}
🟡 *Signal Line:* ${analysis.lastMacd.signal.toFixed(2)}
        `;

        await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
        activeTrades[chatId] = {
          signal: analysis.signal,
          target: analysis.target,
          stoploss: analysis.stoploss
        };

        console.log(`✅ Signal sent to ${chatId}: ${analysis.signal}`);
      }
    }

  } catch (err) {
    console.error("❌ Error in signal loop:", err.message);
  }
}

// === TELEGRAM /start COMMAND ===
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (!USER_CHAT_IDS.includes(chatId)) {
    USER_CHAT_IDS.push(chatId);
    console.log(`✅ New user: ${chatId}`);
  }
  bot.sendMessage(chatId, "🤖 Crypto Signal Bot is active!\nYou'll receive signals every 5 min when conditions are met.");
});

// === START SIGNAL LOOP ===
console.log("🚀 Crypto Signal Bot started...");
sendSignal(); // Initial run
setInterval(sendSignal, 5 * 60 * 1000); // Every 5 minutes





