const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  name: String,
  phone: String,
  type: { type: String, enum: ['call','visit','inquiry'], default: 'inquiry' },
  source: String,
  status: { type: String, enum: ['new','inprogress','completed'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', LeadSchema);
