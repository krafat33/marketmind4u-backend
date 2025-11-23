require('dotenv').config();
const mongoose = require('mongoose');

const Package = require('../models/Package');
const EmployeeCode = require('../models/EmployeeCode');
const User = require('../models/User');

async function start() {
  try {
    console.log('⏳ Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✔ Connected to MongoDB');

    console.log('⏳ Clearing old data...');
    await Package.deleteMany({});
    await EmployeeCode.deleteMany({});
    await User.deleteMany({});

    console.log('⏳ Inserting packages...');
    await Package.insertMany([
      { key: 'basic', name: 'Basic', price: 1999, durationMonths: 3, features: ['Listing','Basic Support'] },
      { key: 'silver', name: 'Silver', price: 4999, durationMonths: 6, features: ['Listing','Leads','Priority Support'] },
      { key: 'gold', name: 'Gold', price: 9999, durationMonths: 12, features: ['Website Preview','Leads','Ad Promotion'] }
    ]);

    console.log('⏳ Inserting employee codes...');
    await EmployeeCode.insertMany([
      { code: 'EMP1001', description: 'Trusted employee code' },
      { code: 'EMP1002', description: 'Promo partner' }
    ]);

    console.log('⏳ Creating admin user...');
    const adminMobile = process.env.ADMIN_MOBILE || '9999999999';
    await User.create({ mobile: adminMobile, role: 'admin', name: 'Admin' });

    console.log('🎉 Seed Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed Error:', err);
    process.exit(1);
  }
}

start();
