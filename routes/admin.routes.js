const router = require("express").Router();
const adminCtrl = require("../controllers/admin.controller");
const adminAuth = require("../middleware/adminAuth.middleware");

// Admin Login
router.post("/login", adminCtrl.adminLogin);

// Protected Admin Routes
router.get("/subscriptions", adminAuth, adminCtrl.listSubscriptions);

router.put("/subscription/:id/status", adminAuth, adminCtrl.updateStatus);

router.post("/employee-code", adminAuth, adminCtrl.createEmployeeCode);

router.get("/leads", adminAuth, adminCtrl.getLeads);

module.exports = router;
