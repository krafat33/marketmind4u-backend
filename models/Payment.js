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

  // ✅ ADD THIS
  employeeCode: {
    type: String,
    default: null,
    index: true // reporting / search ke liye useful
  },

  paymentType: {
    type: String,
    enum: ['PARTIAL', 'MONTHLY','FULL'],
    required: true
  },
  method: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'wallet','razorpay_link'],
    required: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING'], // 👈 PENDING add karna better
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
