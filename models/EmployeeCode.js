const mongoose = require('mongoose');

const EmployeeCodeSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  description: String,
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('EmployeeCode', EmployeeCodeSchema);
