const express = require('express');
const router = express.Router();
const {handleWebhook}  = require('../controllers/webhook.controller');

router.get('/razorpay', handleWebhook);

module.exports = router;
