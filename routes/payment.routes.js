const express = require("express");
const { payNow } = require("../controllers/subscription.controller");

const router = express.Router();

router.post("/pay", payNow);

module.exports = router;
