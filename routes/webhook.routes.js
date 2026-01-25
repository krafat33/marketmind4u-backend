const router = require('express').Router();
const { razorpayWebhook } = require('../controllers/webhook.controller');

router.post(
  '/razorpay',
  require('express').raw({ type: 'application/json' }),
  razorpayWebhook
);

module.exports = router;
