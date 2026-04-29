const express = require("express");
const router = express.Router();

const {
 checkPaymentStatus
} = require("../controllers/webhook.controller.js");

router.post(
    "/payment-status",
    express.json(),
    checkPaymentStatus
   );
module.exports = router;