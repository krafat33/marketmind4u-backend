const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema(
  {
    // 🔑 Internal unique key (used in frontend / API)
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // 📦 Plan name (display)
    name: {
      type: String,
      required: true,
      trim: true
    },

    // 💰 Price (INR)
    price: {
      type: Number,
      required: true,
      min: 0
    },

    // ⏱ Duration in months
    durationMonths: {
      type: Number,
      required: true,
      min: 1
    },

    // ✨ Features list
    features: {
      type: [String],
      default: []
    },

    // 🔁 Razorpay Plan Mapping (AUTO-DEBIT)
    razorpayPlanId: {
      type: String,
      default: null
    },

    // 🟢 Active / Inactive
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Package', PackageSchema);
