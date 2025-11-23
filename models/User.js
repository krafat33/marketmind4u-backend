const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  mobile: { type: String, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },

  name: { type: String },

  role: { 
    type: String, 
    enum: ['customer','merchant','admin'], 
    default: 'customer' 
  },

  otp: {
    code: String,
    expiresAt: Date
  },

  googleId: { type: String },

  shopName: String,
  location: String,
  shopImage: String,

  employeeCodeUsed: { type: String, default: null },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
