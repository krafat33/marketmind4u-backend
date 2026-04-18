const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema({
  razorpayPaymentId: {
    type: String,
    required: true,
    unique: true
  },

  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  packageKey: String,
  amount: Number,
  currency: String,
  status: String

}, { timestamps: true });

module.exports = mongoose.model("PaymentHistory", paymentHistorySchema);