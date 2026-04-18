const crypto = require('crypto');
const User = require('../models/User');
const Package = require('../models/Package');
const PaymentHistory = require('../models/PaymentHistory');

const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const body = JSON.parse(req.body);
    const event = body.event;

    if (event === 'subscription.charged') {

      const payment = body.payload.payment.entity;

      const paymentId = payment.id;
      const userId = payment.notes.userId;
      const packageKey = payment.notes.packageKey;

      // 🔒 Duplicate protection
      const existing = await PaymentHistory.findOne({ razorpayPaymentId: paymentId });
      if (existing) {
        return res.status(200).json({ success: true, message: 'Already processed' });
      }

      const pkg = await Package.findOne({ key: packageKey });
      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Package not found' });
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + pkg.durationMonths);

      // ✅ Update merchant plan
      await User.findByIdAndUpdate(userId, {
        activePackage: {
          packageId: pkg._id,
          packageKey: pkg.key,
          status: 'processing',
          startDate,
          endDate
        }
      });

      // ✅ Save payment history
      await PaymentHistory.create({
        razorpayPaymentId: paymentId,
        merchantId: userId,
        packageKey,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status
      });

      console.log('✅ Subscription processed & plan assigned');
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ success: false });
  }
};

module.exports = { handleWebhook };