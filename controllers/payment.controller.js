const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* ================================
   CREATE ORDER (CONTROLLER)
================================ */
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount required"
      });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // INR → paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1
    });

    return res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
};

/* ================================
   VERIFY PAYMENT (CONTROLLER)
================================ */
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment data"
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully"
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Verification error"
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment
};
