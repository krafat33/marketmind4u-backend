const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { createSubscription, getMySubscription, payNow } = require('../controllers/subscription.controller');

router.post('/create', auth, createSubscription);
router.get('/me', auth, getMySubscription);
router.post('/pay', auth, payNow);

module.exports = router;
