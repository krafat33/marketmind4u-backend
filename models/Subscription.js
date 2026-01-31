const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    /* ===============================
       USER
    =============================== */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    /* ===============================
       PLAN
    =============================== */
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package", // ✅ FIXED
      required: true
    },

    planName: {
      type: String,
      required: true
    },
   
    
    /* ===============================
       AMOUNTS
    =============================== */
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    remainingAmount: {
      type: Number,
      default: 0
    },

    /* ===============================
       PAYMENTS
    =============================== */
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment"
      }
    ],

    /* ===============================
       EMI / PARTIAL
    =============================== */
    employeeCode: {
      type: String,
      default: null
    },

    isPartialAllowed: {
      type: Boolean,
      default: false
    },

    emiSchedule: [
      {
        amount: {
          type: Number,
          required: true,
          min: 0
        },
        dueDate: {
          type: Date,
          required: true
        },
        isPaid: {
          type: Boolean,
          default: false
        },
        razorpayPaymentId: {
          type: String,
          default: null
        }
      }
    ],

    /* ===============================
       RAZORPAY (AUTO-DEBIT)
    =============================== */
    razorpaySubscriptionId: {
      type: String,
      default: null
    },
    gstAmount: {
      type: Number,
      default: 0
    },
    mandateStatus: {
      type: String,
      enum: ["PENDING", "ACTIVE", "FAILED"],
      default: "PENDING"
    },
     
    /* ===============================
       STATUS
    =============================== */
    status: {
      type: String,
      enum: [
        "PENDING",
        "PARTIAL",
        "ACTIVE",
        "COMPLETED",
        "REJECTED"
      ],
      default: "PENDING"
    },

    /* ===============================
       DATES
    =============================== */
    startDate: {
      type: Date,
      default: null
    },

    endDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/* ===============================
   AUTO CALCULATE REMAINING
=============================== */
SubscriptionSchema.pre("save", function (next) {
  this.remainingAmount = Math.max(
    this.totalAmount - this.paidAmount,
    0
  );
  next();
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
