const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  isPremium: { type: Boolean, default: false },
  premiumUntil: { type: Date, default: null },
});

module.exports = mongoose.model("User", userSchema);





const express = require("express");
const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("./models/User");

const app = express();
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/telegrambot");

const razorpay = new Razorpay({
  key_id: "YOUR_KEY_ID",
  key_secret: "YOUR_KEY_SECRET",
});

app.post("/payment/success", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, telegramId } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", razorpay.key_secret)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    const user = await User.findOneAndUpdate(
      { telegramId },
      {
        isPremium: true,
        premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
      },
      { upsert: true }
    );
    return res.json({ success: true, message: "Payment successful" });
  }

  return res.status(400).json({ success: false, message: "Invalid signature" });
});

app.listen(3000, () => console.log("Server running on 3000"));










const User = require("./models/User");

async function checkPremium(telegramId) {
  const user = await User.findOne({ telegramId });
  if (!user) return false;

  if (user.isPremium && user.premiumUntil > new Date()) {
    return true;
  } else {
    user.isPremium = false;
    await user.save();
    return false;
  }
}





if (!(await checkPremium(userId))) {
  bot.sendMessage(userId, "❌ You need a premium subscription to access this signal.\nUse /buy to get access.");
  return;
}



bot.onText(/\/buy/, async (msg) => {
  const telegramId = msg.from.id.toString();

  const order = await razorpay.orders.create({
    amount: 19900, // ₹199
    currency: "INR",
    receipt: "order_" + telegramId,
    notes: {
      telegramId,
    },
  });

  const paymentUrl = `https://rzp.io/l/YOUR_PAYMENT_LINK?order_id=${order.id}&telegramId=${telegramId}`;
  bot.sendMessage(msg.chat.id, `🛒 Buy 1-month premium access: [Click to Pay](${paymentUrl})`, {
    parse_mode: "Markdown",
  });
});





bot.onText(/\/start/, async (msg) => {
  const telegramId = msg.from.id.toString();
  await User.findOneAndUpdate(
    { telegramId },
    {},
    { upsert: true, new: true }
  );
  bot.sendMessage(msg.chat.id, "Welcome to the premium crypto bot! Use /buy to get access.");
});





setInterval(async () => {
  const now = new Date();
  await User.updateMany({ premiumUntil: { $lt: now } }, { isPremium: false });
}, 24 * 60 * 60 * 1000); // Daily
