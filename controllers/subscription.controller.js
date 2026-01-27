const User = require('../models/User');
const Package = require('../models/Package');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const EmployeeCode = require('../models/EmployeeCode');
const Razorpay = require("razorpay");  // ✅ add this


/* ======================================================
   CREATE SUBSCRIPTION
====================================================== */
const createSubscription = async (req, res) => {
  try {
    const {
      userId,                 // 👈 BODY se
      planName,
      amount,
      businessEmail,
      location,
      ownerName,
      contactNumber,
      businessName,
      businessCategory,
      gstNumber,
      empCode,
      isPartialPayment,
      paymentDetails
    } = req.body;

    // 🔴 BASIC VALIDATION
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (!planName || !amount || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    // 🔎 USER CHECK
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid user"
      });
    }

    // 🔎 PLAN CHECK
    const plan = await Package.findOne({ name: planName });
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected"
      });
    }

    // 🧾 CREATE SUBSCRIPTION DATA
    const subscriptionData = {
      user: userId,           // ✅ BODY se
      plan: plan._id,         // ✅ PACKAGE se
      planName,
      totalAmount: amount,
      businessEmail,
      location,
      ownerName,
      contactNumber,
      businessName,
      businessCategory,
      gstNumber,
      employeeCode: empCode || null,
      isPartialPayment: isPartialPayment || false,
      paidAmount: paymentDetails?.paidNow || 0,
      emiDetails: paymentDetails?.emi || null,
      status: "ACTIVE",
      createdAt: new Date()
    };

    const subscription = await Subscription.create(subscriptionData);

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription
    });

  } catch (error) {
    console.error("CREATE SUB ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/* ======================================================
   GET MY SUBSCRIPTION
====================================================== */
const getMySubscription = async (req, res) => {
  try {
    const { userId } = req.params; // 👈 URL se

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required"
      });
    }

    const subscription = await Subscription
      .findOne({ user: userId })
      .populate("plan")
      .populate("payments");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found"
      });
    }

    const remainingAmount =
      Math.max(subscription.totalAmount - subscription.paidAmount, 0);

    return res.status(200).json({
      success: true,
      subscription,
      remainingAmount
    });

  } catch (error) {
    console.error("GET SUB ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/* ======================================================
   PAY NOW
====================================================== */
// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ===============================
// PAY NOW CONTROLLER
// ===============================
const payNow = async (req, res) => {
  try {
    const { subscriptionId, amount, method, paymentType } = req.body; 
    // paymentType: "DOWN_EMI" or "MONTHLY"

    if (!subscriptionId || !amount || !method || !paymentType) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const sub = await Subscription.findById(subscriptionId);
    if (!sub) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    // ===============================
    // DOWN_EMI OPTION
    // ===============================
    if (paymentType === "DOWN_EMI") {
      if (!sub.employeeCode && amount < sub.totalAmount) {
        return res.status(400).json({ success: false, message: "Full payment required" });
      }

      // Save Payment in DB
      const payment = await Payment.create({
        subscription: sub._id,
        amount,
        method,
        status: "success",
        paidAt: new Date()
      });

      sub.payments.push(payment._id);
      sub.paidAmount += amount;

      const remaining = sub.totalAmount - sub.paidAmount;
      sub.status = remaining <= 0 ? "COMPLETED" : "PARTIAL";

      // 60% rule logic
      const sixtyPercent = Math.round(sub.totalAmount * 0.6);
      if (sub.employeeCode && sub.paidAmount >= sixtyPercent && !sub.startDate) {
        const now = new Date();
        sub.startDate = now;
        sub.nextDueDates = [
          new Date(now.setMonth(now.getMonth() + 1)),
          new Date(now.setMonth(now.getMonth() + 2))
        ];
      }

      await sub.save();
      return res.status(200).json({
        success: true,
        payment,
        subscription: sub,
        remainingAmount: Math.max(remaining, 0)
      });
    }

    // ===============================
    // MONTHLY ECS OPTION
    // ===============================
    // ===============================
// MONTHLY ECS OPTION
// ===============================
if (paymentType === "MONTHLY") {
  if (!sub.startDate) sub.startDate = new Date();

  // Populate plan to get razorpayPlanId
  const populatedSub = await Subscription.findById(subscriptionId).populate("plan");

  const planId = "plan_S8EhBWzqssa4Z5"

  if (!planId) {
    return res.status(400).json({
      success: false,
      message: "Razorpay Plan ID missing in package"
    });
  }

  // Create subscription in Razorpay
  const razorResponse = await razorpay.subscriptions.create({
    plan_id: planId,
    total_count: populatedSub.plan.durationMonths || 12,
    customer_notify: 1,
    notes: {
      subscription_type: "MONTHLY",
      subscriptionId: populatedSub._id.toString()
    }
  });

  // Save first payment in DB (optional: if payment is done immediately)
  const payment = await Payment.create({
    subscription: populatedSub._id,
    amount: Math.round(populatedSub.totalAmount / (populatedSub.plan.durationMonths || 12)), // first installment
    method,
    status: "success",
    razorpayPaymentId: null, // update after actual capture
    paidAt: new Date()
  });

  // Update subscription
  populatedSub.payments.push(payment._id);
  populatedSub.paidAmount += payment.amount;
  populatedSub.razorpaySubscriptionId = razorResponse.id;
  populatedSub.status = "ACTIVE";

  // Auto-generate next ECS schedule
  populatedSub.nextDueDates = [];
  let nextDate = new Date(populatedSub.startDate);
  const monthsCount = populatedSub.plan.durationMonths || 12;
  for (let i = 0; i < monthsCount; i++) {
    nextDate = new Date(nextDate.setMonth(nextDate.getMonth() + 1));
    populatedSub.nextDueDates.push(nextDate);
  }

  await populatedSub.save();

  return res.status(200).json({
    success: true,
    payment,
    subscription: populatedSub,
    razorpaySubscription: razorResponse
  });
}


    return res.status(400).json({ success: false, message: "Invalid payment type" });

  } catch (error) {
    console.error("PAY ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}
module.exports = {
  createSubscription,
  getMySubscription,
  payNow
};
