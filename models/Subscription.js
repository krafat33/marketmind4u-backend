const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package", 
      required: true
    },
    planName: {
      type: String,
      required: true
    },
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
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment"
      }
    ],
    paymentType: {
      type: String,
      enum: ["FULL", "PARTIAL"],
      required: true
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
SubscriptionSchema.pre("save", function (next) {
  this.remainingAmount = Math.max(
    this.totalAmount - this.paidAmount,
    0
  );
  next();
});
module.exports = mongoose.model("Subscription", SubscriptionSchema);
