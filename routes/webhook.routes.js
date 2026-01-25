const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

router.post('/razorpay', webhookController.handleWebhook);

module.exports = router;
