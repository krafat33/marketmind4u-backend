const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  key: String,
  name: String,
  screen: String,

  basePrice: {
    type: Number,
    required: true
  },

  gstRate: {
    type: Number,
    default: 18
  },

  gstAmount: {
    type: Number,
    default: 0
  },

  price: {
    type: Number, // ✅ FINAL PRICE (base + GST)
    required: true
  },

  discount: String,
  features: [String],
  durationMonths: Number,

  razorpayPlanId: {
    type: String,
    default: null
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Package', PackageSchema);
