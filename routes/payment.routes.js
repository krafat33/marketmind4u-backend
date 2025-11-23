// File: ./routes/payment.routes.js (Correct Export for app.js)

const express = require("express");
const { pay, phonepeWebhook } = require("../controllers/payment.controller"); // Note: using require() here too!
const router = express.Router();

router.post("/pay", pay);
router.post("/webhook", phonepeWebhook);

// 💡 CORRECT: Export the router instance using module.exports
module.exports = router;