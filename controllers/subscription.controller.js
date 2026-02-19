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
      userId,
      planName,
      amount,
      businessEmail,
      location,
      ownerName,
      contactNumber,
      businessName,
      businessCategory,
      gstNumber,
      gstRate = 18,
      empCode,
      paymentType
    } = req.body;

    // BASIC VALIDATION
    if (!userId || !planName || !amount || !contactNumber || !paymentType) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ success: false, message: "Invalid user" });

    const plan = await Package.findOne({ name: planName });
    if (!plan) return res.status(400).json({ success: false, message: "Invalid plan" });

    if ((paymentType === "PARTIAL" || paymentType === "MONTHLY") && !empCode) {
      return res.status(400).json({ success: false, message: "Employee code required" });
    }

    // GST
    const gstAmount = Math.round((amount * gstRate) / 100);
    const totalAmount = amount + gstAmount;

    let paidAmount = 0;
    let remainingAmount = totalAmount;
    let  emiSchedule = null;

    // 🔥 PAYMENT LOGIC
    if (paymentType === "FULL") {
      paidAmount = totalAmount;
      remainingAmount = 0;
    }

    if (paymentType === "PARTIAL") {
      const down = Math.round(totalAmount * 0.6);
      const emi = Math.round(totalAmount * 0.2);
    
      paidAmount = 0;                     // ❗ nothing paid yet
      remainingAmount = totalAmount;
    
      const now = new Date();
    
      emiSchedule = [
        {
          amount: down,
          dueDate: now,
          isPaid: false
        },
        {
          amount: emi,
          dueDate: new Date(new Date().setMonth(now.getMonth() + 1)),
          isPaid: false
        },
        {
          amount: emi,
          dueDate: new Date(new Date().setMonth(now.getMonth() + 2)),
          isPaid: false
        }
      ];
    }

    const subscription = await Subscription.create({
      user: userId,
      plan: plan._id,
      planName,

      baseAmount: amount,
      gstRate,
      gstAmount,
      totalAmount,

      paidAmount,
      remainingAmount,

      paymentType,
      emiSchedule,

      businessEmail,
      location,
      ownerName,
      contactNumber,
      businessName,
      businessCategory,
      gstNumber,

      employeeCode: empCode,
      status: remainingAmount === 0 ? "PAID" : "ACTIVE"
    });

    return res.status(201).json({
      success: true,
      message: "Subscription created",
      subscription
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
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

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const payNow = async (req, res) => {
  try {
    const { subscriptionId, amount, method, paymentType } = req.body;

    if (!subscriptionId || !amount || !paymentType) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    const sub = await Subscription.findById(subscriptionId).populate("plan");
    if (!sub) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    const totalAmount = sub.totalAmount; // GST included
    const alreadyPaid = sub.paidAmount || 0;

    if (alreadyPaid + amount > totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment exceeds total amount"
      });
    }

    /* ===============================
       FULL PAYMENT
    =============================== */
    if (paymentType === "FULL") {
      const payableAmount = totalAmount - alreadyPaid;

      const paymentLink = await razorpay.paymentLink.create({
        amount: payableAmount * 100,
        currency: "INR",
        accept_partial: false,
        description: `Full payment for ${sub.planName}`,
        customer: {
          name: sub.ownerName || "Customer",
          contact: sub.contactNumber,
          email: sub.businessEmail
        },
        notes: {
          subscriptionId: sub._id.toString(),
          paymentType: "FULL"
        }
      });

      const payment = await Payment.create({
        subscription: sub._id,
        user: sub.user,
        paymentType: "FULL",
        method: "razorpay_link",
        status: "PENDING",
        amount: payableAmount,
        razorpayPaymentLinkId: paymentLink.id
      });

      return res.status(200).json({
        success: true,
        paymentLink: paymentLink.short_url,
        paymentId: payment._id,
        subscriptionId: sub._id,
        totalAmount,
        payableAmount
      });
    }

    /* ===============================
       PARTIAL PAYMENT
    =============================== */
    if (paymentType === "PARTIAL") {

      const nextEmi = sub.emiSchedule.find(e => !e.isPaid);
    
      if (!nextEmi) {
        return res.status(400).json({
          success: false,
          message: "All EMIs already paid"
        });
      }
    
      if (amount !== nextEmi.amount) {
        return res.status(400).json({
          success: false,
          message: `Please pay exact EMI amount ₹${nextEmi.amount}`
        });
      }
    
    
    
      // 🔥 Razorpay link for EMI only
      const paymentLink = await razorpay.paymentLink.create({
        amount: amount * 100,
        currency: "INR",
        accept_partial: false,
        description: `EMI payment for ${sub.planName}`,
        customer: {
          name: sub.ownerName || "Customer",
          contact: sub.contactNumber,
          email: sub.businessEmail
        },
        notes: {
          subscriptionId: sub._id.toString(),
          emiAmount: amount,
          paymentType: "PARTIAL"
        }
      });
    
      const payment = await Payment.create({
        subscription: sub._id,
        user: sub.user,
        paymentType: "PARTIAL",
        method: method,
        status: "PENDING",
        amount,
        razorpayPaymentLinkId: paymentLink.id
      });
    
      return res.json({
        success: true,
        paymentLink: paymentLink.short_url,
        paymentId: payment._id,
        amount
      });
    }

    /* ===============================
       MONTHLY ECS
    =============================== */
    if (paymentType === "MONTHLY") {
      const plan = sub.plan;
      const months = plan.durationMonths || 12;
      const monthlyAmount = Math.round(totalAmount / months);

      if (!plan.razorpayPlanId) {
        const razorPlan = await razorpay.plans.create({
          period: "monthly",
          interval: 1,
          item: {
            name: plan.name,
            amount: monthlyAmount * 100,
            currency: "INR"
          }
        });
        plan.razorpayPlanId = razorPlan.id;
        await plan.save();
      }

      const razorSub = await razorpay.subscriptions.create({
        plan_id: plan.razorpayPlanId,
        total_count: months,
        customer_notify: 1
      });

      const payment = await Payment.create({
        subscription: sub._id,
        user: sub.user,
        paymentType: "MONTHLY",
        method: method?.toLowerCase() || "razorpay",
        status: "PENDING",
        amount: monthlyAmount
      });

      return res.status(200).json({
        success: true,
        razorpaySubscriptionId: razorSub.id,
        paymentId: payment._id,
        monthlyAmount,
        totalAmount
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid payment type"
    });

  } catch (error) {
    console.error("PAY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
module.exports = {
  createSubscription,
  getMySubscription,
  payNow
};
