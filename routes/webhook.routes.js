const express = require("express");
const router = express.Router();

const {
 verifyWebhookSignature,
 razorpayWebhook
} = require("../controllers/webhook.controller");

router.post(
 "/razorpay",
 express.raw({ type:"application/json" }),
 verifyWebhookSignature,
 razorpayWebhook
);

module.exports = router;