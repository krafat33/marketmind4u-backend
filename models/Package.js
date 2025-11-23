const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  name: String,
  price: Number,
  durationMonths: Number,
  features: [String]
});

module.exports = mongoose.model('Package', PackageSchema);
