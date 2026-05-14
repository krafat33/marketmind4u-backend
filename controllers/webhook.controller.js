const Payment = require("../models/Payment");
const User = require("../models/User");
const Subscription = require("../models/Subscription");

exports.checkPaymentStatus = async (req, res) => {
  try {
    const { customerId } = req.body;

    let user;

    if (customerId.length === 24) {
      user = await User.findOne({
        userCode: customerId
      });
    } else {
      user = await User.findById(customerId);
    }

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    // Payments
    const payments = await Payment.find({
      user: user._id
    }).populate("user subscription");

    // Subscription Details
    const subscriptions = await Subscription.find({
      user: user._id
    })
      .populate("plan")
      .populate("payments");

    return res.json({
      success: true,

      customer: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        userCode: user.userCode
      },

      totalPayments: payments.length,

      paymentHistory: payments,

      subscriptions: subscriptions.map((sub) => ({
        subscriptionId: sub._id,

        packageName: sub.planName,

        packageDetails: sub.plan,

        totalAmount: sub.totalAmount,

        paidAmount: sub.paidAmount,

        remainingAmount: sub.remainingAmount,

        paymentType: sub.paymentType,

        status: sub.status,

        mandateStatus: sub.mandateStatus,

        startDate: sub.startDate,

        endDate: sub.endDate,

        razorpaySubscriptionId:
          sub.razorpaySubscriptionId,

        emiSchedule: sub.emiSchedule.map((emi) => ({
          amount: emi.amount,

          dueDate: emi.dueDate,

          isPaid: emi.isPaid,

          razorpayPaymentId:
            emi.razorpayPaymentId
        })),

        payments: sub.payments
      }))
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};