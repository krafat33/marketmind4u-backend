// Razorpay Webhook Controller
const crypto = require('crypto');

const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET; // aapka Razorpay webhook secret
    const payload = JSON.stringify(req.body);
    const signature = req.headers['x-razorpay-signature'];

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payloadData = req.body.payload;

    console.log('Webhook Event:', event);
    console.log('Webhook Payload:', payloadData);

    // Example: handle subscription payment captured
    if (event === 'subscription.charged') {
      const payment = payloadData.payment.entity;
      console.log('Payment captured:', payment);
      // TODO: update your DB Payment record here
    }

    return res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  handleWebhook
};
