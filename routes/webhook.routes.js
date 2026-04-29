const express = require("express");
const router = express.Router();

const {
 verifyWebhookSignature
} = require("../controllers/webhook.controller.js");

router.post("/razorpay", verifyWebhookSignature);

module.exports = router;