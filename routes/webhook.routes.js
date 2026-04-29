const express = require("express");
const router = express.Router();

const {
 razorpayWebhook
} = require("../controllers/webhook.controller.js");

router.post(
    "/razorpay",
    express.json(),
    razorpayWebhook
   );
module.exports = router;