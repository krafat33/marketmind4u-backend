const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

/**
 * Generates a 4-digit OTP
 */
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Sends OTP via Twilio SMS
 * @param {string} mobile - User mobile number
 * @param {string} otp - OTP code
 */
async function sendOtp(mobile, otp) {
  try {
    const toNumber = mobile.startsWith("+91") ? mobile : `+91${mobile}`;
    const message = await client.messages.create({
      body: `Your MarketMind4U OTP is ${otp}`,
      from: process.env.TWILIO_FROM, // Must be a Twilio verified number
      to: toNumber,
    });
    console.log(`✅ OTP sent successfully to ${toNumber}`, message.sid);
  } catch (error) {
    console.error("❌ Twilio Error:", error.message);
    throw new Error("SMS sending failed");
  }
}

module.exports = { generateOTP, sendOtp };
