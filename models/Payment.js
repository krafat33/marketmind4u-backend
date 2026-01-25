const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    /* ===============================
       REFERENCES
    =============================== */
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    /* ===============================
       AMOUNT
    =============================== */
    amount: {
      type: Number, // INR
      required: true,
      min: 0
    },

    /* ===============================
       TYPE
    =============================== */
    paymentType: {
      type: String,
      enum: ["DOWNPAYMENT", "EMI"],
      required: true
    },

    emiIndex: {
      type: Number, // 1, 2 ...
      default: null
    },

    /* ===============================
       STATUS
    =============================== */
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING"
    },

    /* ===============================
       RAZORPAY IDS
    =============================== */
    razorpayOrderId: {
      type: String,
      default: null
    },

    razorpayPaymentId: {
      type: String,
      default: null
    },

    razorpaySubscriptionId: {
      type: String,
      default: null
    },

    /* ===============================
       METHOD / SOURCE
    =============================== */
    method: {
      type: String,
      enum: ["UPI", "CARD", "NETBANKING", "AUTODEBIT"]
    },

    source: {
      type: String,
      enum: ["WEB", "APP", "WEBHOOK"]
    },

    paidAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
