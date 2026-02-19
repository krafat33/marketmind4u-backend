const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
  userCode: {
    type: String,
    unique: true,
    immutable: true,
    index: true
  },
  
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
UserSchema.pre('save', async function (next) {
  if (this.userCode) return next();

  const lastUser = await mongoose
    .model('User')
    .findOne({ userCode: { $exists: true } })
    .sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastUser && lastUser.userCode) {
    nextNumber = parseInt(lastUser.userCode.replace('MM4U', '')) + 1;
  }

  this.userCode = `MM4U${String(nextNumber).padStart(4, '0')}`;
  next();
});

module.exports = mongoose.model('User', UserSchema);
