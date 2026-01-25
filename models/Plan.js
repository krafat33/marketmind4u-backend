const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    screen: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: String },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", PlanSchema);
