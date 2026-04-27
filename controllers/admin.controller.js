const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Subscription = require("../models/Subscription");
const Lead = require("../models/Lead");

// ADMIN LOGIN
exports.adminLogin = async (req, res) => {
  try {
    const { Mobile } = req.body;

    if (Mobile !== process.env.ADMIN_MOBILE) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const token = jwt.sign(
      { id: "admin", role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Admin Logged In", token });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LIST SUBSCRIPTIONS
exports.listSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find()
      .populate("user", "-password")
      .populate("package")
      .populate("payments");

    res.json({
      success: true,
      total: subs.length,
      subs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status required" });
  const sub = await Subscription.findById(id);
  if (!sub) return res.status(404).json({ message: 'Not found' });
  sub.status = status;
  await sub.save();
  res.json({ sub });
};
exports.getLeads = async (req, res) => {
  try {
    const { subscriptionId } = req.query;
    const leads = await Lead.find({ subscription: subscriptionId }).sort("-createdAt");
    res.json({ success: true, leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
