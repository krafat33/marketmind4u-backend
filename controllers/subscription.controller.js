const User = require('../models/User');
const Package = require('../models/Package');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');

/* ======================================================
   CREATE SUBSCRIPTION
====================================================== */
const createSubscription = async (req, res) => {
  try {
    const {
      planName,
      businessEmail,
      location,
      ownerName,
      contactNumber,
      businessName,
      businessCategory,
      gstNumber,
      empCode,
      isPartialPayment
    } = req.body;

    // 🔐 AUTH CHECK
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!planName || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    // 🔎 PLAN
    const plan = await Package.findOne({ name: planName });
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected"
      });
    }

    const totalAmount = plan.price; // ✅ TRUST DB ONLY

    const subscription = await Subscription.create({
      user: req.user._id,
      plan: plan._id,
      planName: plan.name,
      totalAmount,
      businessEmail,
      location,
      ownerName,
      contactNumber,
      businessName,
      businessCategory,
      gstNumber,
      employeeCode: empCode || null,
      isPartialPayment: !!isPartialPayment,
      paidAmount: 0,
      payments: [],
      status: "ACTIVE",
      createdAt: new Date()
    });

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
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const subscription = await Subscription
      .findOne({ user: req.user._id })
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
   PAY NOW (DOWN PAYMENT / EMI)
====================================================== */
const payNow = async (req, res) => {
  try {
    const { subscriptionId, amount, method } = req.body;

    if (!subscriptionId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    const sub = await Subscription.findById(subscriptionId);
    if (!sub) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    // ❌ No employee code → full payment
    if (!sub.employeeCode && amount < sub.totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Full payment required"
      });
    }

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

    sub.status =
      remaining <= 0 ? "COMPLETED" : "PARTIAL";

    // ▶️ 60% RULE
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

  } catch (error) {
    console.error("PAY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createSubscription,
  getMySubscription,
  payNow
};
