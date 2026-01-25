const Plan = require("../models/Plan");

exports.getAllPlans = async (req, res) => {
  const plans = await Plan.find({ isActive: true });
  res.json({ success: true, plans });
};
