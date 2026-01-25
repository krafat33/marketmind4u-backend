const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    /* ===============================
       AUTH
    =============================== */
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      select: false
    },

    googleId: {
      type: String,
      default: null
    },

    /* ===============================
       PROFILE
    =============================== */
    name: {
      type: String,
      trim: true
    },

    role: {
      type: String,
      enum: ['merchant', 'admin'],
      default: 'merchant'
    },

    shopName: String,
    location: String,
    shopImage: String,

    /* ===============================
       SUBSCRIPTION
    =============================== */
    activeSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null
    },

    employeeCodeUsed: {
      type: String,
      default: null
    },

    /* ===============================
       OTP
    =============================== */
    otp: {
      code: String,
      expiresAt: Date
    },

    /* ===============================
       RAZORPAY
    =============================== */
    razorpayCustomerId: {
      type: String,
      default: null
    },

    mandateAccepted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', UserSchema);
