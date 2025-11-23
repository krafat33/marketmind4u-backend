const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: String,
  businessName: String,
  location: String,
  phone: String,
  email: String,
  packageName: String,
  employeeCode: String,
  amountPaid: Number,
  amountRemaining: Number,
  status: { type: String, default: "In Progress" },
  shopImage: String
});

module.exports = mongoose.model("Order", orderSchema);
