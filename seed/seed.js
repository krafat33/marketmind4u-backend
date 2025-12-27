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
      {
        key: "gold",
        name: "Gold Package",
        screen: "Gold",
        price: 7999,
        discount: "40% OFF",
        features: ["Meta Ad Setup", "Lead Gen. Support", "Promo Design"]
      },
      {
        key: "platinum",
        name: "Platinum Package",
        screen: "Platinum",
        price: 24999,
        discount: "50% OFF",
        features: ["Full Campaign Setup", "Dedicated Manager", "Website Included"]
      },
      {
        key: "diamond",
        name: "Diamond Package",
        screen: "Diamond",
        price: 49999,
        discount: "60% OFF",
        features: [
          "Digital Marketing",
          "Website",
          "Priority Support",
          "SEO Optimization",
          "IVR Number"
        ]
      },
      {
        key: "platinum_pro",
        name: "Platinum Pro Package",
        screen: "Platinum Pro",
        price: 34999,
        discount: "55% OFF",
        features: [
          "Advanced Setup",
          "24/7 Support",
          "SEO Optimization",
          "GMB Management"
        ]
      },
      {
        key: "diamond_pro",
        name: "Diamond Pro Package",
        screen: "Diamond Pro",
        price: 69999,
        discount: "65% OFF",
        features: [
          "Full Branding",
          "Dynamic Website",
          "Team Access",
          "Priority Support",
          "SEO + GMB"
        ]
      },
      {
        key: "mobile_app",
        name: "Mobile App Development",
        screen: "Mobile App Development",
        price: 69999,
        discount: "SPECIAL",
        features: ["Android App", "Admin Panel"]
      },
      {
        key: "website_dev",
        name: "Website Development",
        screen: "Website Development",
        price: 19999,
        discount: "HOT",
        features: ["Landing Page", "Business Site", "E-commerce"]
      },
      {
        key: "ai_digital",
        name: "AI & Digital Marketing Agency",
        screen: "AI & Digital Marketing Agency",
        price: 0, // custom plan so 0
        discount: "PREMIUM",
        features: ["AI Automations", "Meta + Google Ads", "Brand Setup"]
      }
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
