const User = require('../models/User');
const Package = require('../models/Package');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const EmployeeCode = require('../models/EmployeeCode');

exports.createSubscription = async (req, res) => {
  try {
    const user = req.user;
    const { packageKey, shopName, location, email, employeeCode } = req.body;

    const pkg = await Package.findOne({ key: packageKey });
    if (!pkg) return res.status(400).json({ message: 'Package not found' });

    // check employee code validity
    let codeValid = false;
    if (employeeCode) {
      const codeDoc = await EmployeeCode.findOne({ code: employeeCode, active: true });
      if (codeDoc) codeValid = true;
    }

    const total = pkg.price;
    const subscription = await Subscription.create({
      user: user._id,
      package: pkg._id,
      totalAmount: total,
      paidAmount: 0,
      employeeCode: codeValid ? employeeCode : null,
      status: 'pending'
    });

    user.shopName = shopName;
    user.location = location;
    user.email = email;
    user.employeeCodeUsed = codeValid ? employeeCode : null;
    await user.save();

    return res.json({ subscription, partialAllowed: codeValid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMySubscription = async (req, res) => {
  const subscription = await Subscription.findOne({ user: req.user._id }).populate('package').populate('payments');
  if (!subscription) return res.json({ message: 'No subscription' });

  const remaining = subscription.totalAmount - subscription.paidAmount;
  res.json({ subscription, remaining });
};

// simulate payment
exports.payNow = async (req, res) => {
  try {
    const { subscriptionId, amount, method } = req.body;
    const sub = await Subscription.findById(subscriptionId).populate('package');
    if (!sub) return res.status(400).json({ message: 'Subscription not found' });

    if (!sub.employeeCode && amount < sub.totalAmount) {
      return res.status(400).json({ message: 'Full payment required for no employee code' });
    }

    const payment = await Payment.create({ subscription: sub._id, amount, method, status: 'success', paidAt: new Date() });
    sub.payments.push(payment._id);
    sub.paidAmount += amount;

    if (sub.employeeCode && sub.paidAmount === (sub.totalAmount * 0.6)) {
      const one = new Date();
      const d1 = new Date(one.setDate(one.getDate() + 30));
      const two = new Date();
      const d2 = new Date(two.setDate(two.getDate() + 60));
      sub.nextDueDates = [d1, d2];
      sub.startDate = new Date();
    }

    if (sub.paidAmount >= sub.totalAmount) {
      sub.status = 'inprogress';
    }

    await sub.save();
    return res.json({ payment, subscription: sub });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
