const router = require("express").Router();
const { 
  signup, 
  googleLogin,
  login,
  verifyEmployee,
  me 
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");

// Signup
router.post("/signup", signup);
router.post("/login", login);

// Verify employee
router.post("/verify-employee", verifyEmployee);

// Get logged-in user
router.get("/me", authMiddleware, me);

// Google Login
router.post("/google-login", googleLogin);

module.exports = router;
