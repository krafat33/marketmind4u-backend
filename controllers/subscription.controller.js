const User = require('../models/User');
const Package = require('../models/Package');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const EmployeeCode = require('../models/EmployeeCode');

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
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
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
    if (paymentType === "MONTHLY") {
      if (!sub.startDate) sub.startDate = new Date();

      // Razorpay Subscription create
      const planId = sub.razorpayPlanId; // pre-created Razorpay plan_id
      if (!planId) {
        return res.status(400).json({ success: false, message: "Plan ID missing for monthly subscription" });
      }

      // Create subscription in Razorpay
      const razorResponse = await razorpay.subscriptions.create({
        plan_id: planId,
        total_count: 12,
        customer_notify: 1,
        notes: { subscription_type: "MONTHLY", subscriptionId: sub._id.toString() }
      });

      // Save first payment in DB if paid immediately
      const payment = await Payment.create({
        subscription: sub._id,
        amount: Math.round(sub.totalAmount / 12), // first installment
        method,
        status: "success",
        razorpayPaymentId: null, // will update after actual capture
        paidAt: new Date()
      });

      sub.payments.push(payment._id);
      sub.paidAmount += payment.amount;

      // Auto-generate next 12 months ECS schedule
      sub.nextDueDates = [];
      let nextDate = new Date(sub.startDate);
      for (let i = 0; i < 12; i++) {
        nextDate = new Date(nextDate.setMonth(nextDate.getMonth() + 1));
        sub.nextDueDates.push(nextDate);
      }

      sub.razorpaySubscriptionId = razorResponse.id;
      sub.status = "ACTIVE";
      await sub.save();

      return res.status(200).json({
        success: true,
        payment,
        subscription: sub,
        razorpaySubscription: razorResponse
      });
    }

    return res.status(400).json({ success: false, message: "Invalid payment type" });

  } catch (error) {
    console.error("PAY ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


module.exports = {
  createSubscription,
  getMySubscription,
  payNow
};
