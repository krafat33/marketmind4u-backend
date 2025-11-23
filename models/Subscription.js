const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  totalAmount: Number,
  paidAmount: { type: Number, default: 0 },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  employeeCode: { type: String, default: null },
  status: { type: String, enum: ['pending','inprogress','completed','rejected'], default: 'pending' },
  startDate: Date,
  nextDueDates: [Date],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
