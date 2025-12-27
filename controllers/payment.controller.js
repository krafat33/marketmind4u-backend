const axios = require('axios');
const qs = require('qs');

const BASE_URL = "https://api.phonepe.com"; // Sandbox URL

let cachedToken = null;
let tokenExpiry = 0;

// Get OAuth Token
const getAccessToken = async () => {
    const now = Date.now();
    if (cachedToken && now < tokenExpiry) return cachedToken;

    const body = qs.stringify({
        grant_type: "client_credentials",
        client_id: process.env.PHONEPE_CLIENT_ID,
        client_secret: process.env.PHONEPE_CLIENT_SECRET,
        client_version: "1"
    });

    const res = await axios.post(`${BASE_URL}/apis/identity-manager/v1/oauth/token`, body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    cachedToken = res.data.access_token;
    tokenExpiry = now + (res.data.expires_in - 60) * 1000;
    return cachedToken;
};

// Pay API
const pay = async (req, res) => {
  try {
      const { merchantOrderId, amount, redirectUrl } = req.body;
      const token = await getAccessToken();

      // 1. Amount ko strictly Integer (Paise) mein convert karein
      const finalAmount = Math.round(parseFloat(amount)); 

      const payload = {
          merchantOrderId: String(merchantOrderId),
          amount: finalAmount, 
          expireAfter: 1200,
          paymentFlow: {
              type: "PG_CHECKOUT",
              message: "MarketMind4U Payment",
              merchantUrls: {
                  redirectUrl: redirectUrl // Correct: Object format
              }
          },
          metaInfo: { udf1: "MarketMind4U" }
      };

      const response = await axios.post(`${BASE_URL}/apis/pg/checkout/v2/pay`, payload, {
        headers: {
          "Authorization": `O-Bearer ${token}`, // Fixed: Back to O-Bearer
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CLIENT-ID": process.env.PHONEPE_CLIENT_ID, // Kabhi-kabhi ye bhi zaroori hota hai
          "X-CLIENT-VERSION": "1.0.0" 
      }
      });

      return res.status(200).json({ success: true, data: response.data });

  } catch (error) {
      // Isse aapko terminal mein detailed error dikhega
      console.error("PHONEPE ERROR DETAILS:", JSON.stringify(error.response?.data, null, 2));
      return res.status(500).json({ 
          success: false, 
          message: "Payment Failed", 
          error: error.response?.data || error.message 
      });
  }
};
module.exports = { pay };
