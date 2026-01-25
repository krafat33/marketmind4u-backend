const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const EmployeeCode = require("../models/EmployeeCode");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid password" });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: null,
    });

    res.json({
      message: "Login Successful",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, mobile, email, password, confirmPassword } = req.body;

    if (!name || !mobile || !email || !password || !confirmPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const exists = await User.findOne({ email});
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      mobile,
      email,
      password: hash,
      role:"merchant",
    });

    res.json({
      message: "Signup successful",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken)
      return res.status(400).json({ message: "Token missing" });

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: payload.sub,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Google Login Successful",
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Google Login failed" });
  }
};

exports.me = async (req, res) => {
  try {
    const safeUser = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      mobile: req.user.mobile || null   // FIXED
    };

    return res.json(safeUser);
  } catch (err) {
    console.log("ME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



/**
 * Verify Employee Code
 */
exports.verifyEmployee = async (req, res) => {
  try {
    const { employeeCode } = req.body;
    if (!employeeCode) return res.status(400).json({ message: "Employee code required" });

    const code = await EmployeeCode.findOne({ code: employeeCode });
    if (!code) return res.status(404).json({ message: "Invalid Employee Code" });

    res.json({ success: true, message: "Employee Code Verified", data: code });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};
