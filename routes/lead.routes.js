const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const leadCtrl = require('../controllers/lead.controller');

router.post('/generate', auth, leadCtrl.generateDummyLeads);

module.exports = router;
