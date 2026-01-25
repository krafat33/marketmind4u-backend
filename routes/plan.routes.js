const express = require("express");
const { getAllPlans } = require("../controllers/plan.controller");

const router = express.Router();

router.get("/", getAllPlans);

module.exports = router;
