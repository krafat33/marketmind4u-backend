const router = require("express").Router();
const { signup, googleLogin ,login,verifyEmployeeCode,authController,verifyEmployee} = require("../controllers/auth.controller");
// Signup
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-employee", verifyEmployee);

// Google Login
router.post("/google-login", googleLogin);

module.exports = router;
