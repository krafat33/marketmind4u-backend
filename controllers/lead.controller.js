const Lead = require('../models/Lead');
const Subscription = require('../models/Subscription');

exports.generateDummyLeads = async (req, res) => {
  const { subscriptionId, count = 3 } = req.body;
  const sub = await Subscription.findById(subscriptionId);
  if (!sub) return res.status(404).json({ message: 'No subscription' });

  const leads = [];
  for (let i = 0; i < count; i++) {
    const lead = await Lead.create({
      subscription: sub._id,
      name: `Customer ${Math.floor(Math.random()*900)+100}`,
      phone: `9${Math.floor(100000000 + Math.random()*900000000)}`,
      type: 'inquiry',
      source: 'organic'
    });
    leads.push(lead);
  }
  res.json({ leads });
};
