const Plan = require("../models/Plan");

const plans = [
  {
    name: "Gold Package",
    screen: "Gold",
    price: 7999,
    discount: "40% OFF",
    features: ["Meta Ad Setup", "Lead Gen. Support", "Promo Design"]
  },
  {
    name: "Platinum Package",
    screen: "Platinum",
    price: 24999,
    discount: "50% OFF",
    features: ["Full Campaign Setup", "Dedicated Manager", "Website Included"]
  },
  {
    name: "Diamond Package",
    screen: "Diamond",
    price: 49999,
    discount: "60% OFF",
    features: ["Digital Marketing", "Website", "Priority Support", "SEO Optimization", "IVR Number"]
  },
  {
    name: "Platinum Pro Package",
    screen: "Platinum Pro",
    price: 34999,
    discount: "55% OFF",
    features: ["Advanced Setup", "24/7 Support", "SEO Optimization", "GMB Management"]
  },
  {
    name: "Diamond Pro Package",
    screen: "Diamond Pro",
    price: 69999,
    discount: "65% OFF",
    features: ["Full Branding", "Dynamic Website", "Team Access", "Priority Support", "SEO + GMB"]
  },
  {
    name: "Mobile App Development",
    screen: "Mobile App Development",
    price: 69999,
    discount: "SPECIAL",
    features: ["Android App", "Admin Panel"]
  },
  {
    name: "Website Development",
    screen: "Website Development",
    price: 19999,
    discount: "HOT",
    features: ["Landing Page", "Business Site", "E-commerce"]
  },
  {
    name: "AI & Digital Marketing Agency",
    screen: "AI & Digital Marketing Agency",
    price: 0,
    discount: "PREMIUM",
    features: ["AI Automations", "Meta + Google Ads", "Brand Setup"]
  }
];

module.exports = async () => {
  await Plan.deleteMany();
  await Plan.insertMany(plans);
  console.log("✅ Plans seeded successfully");
};
