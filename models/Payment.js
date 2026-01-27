const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentType: {
    type: String,
    enum: ['DOWN_EMI', 'MONTHLY'],
    required: true
  },
  method: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'wallet'],
    required: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
