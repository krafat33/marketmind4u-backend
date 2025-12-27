import axios from "axios";
import qs from "qs";

const BASE_URL = "https://api.phonepe.com"

let cachedToken = null;
let tokenExpiry = 0;

// ============================
//  Get OAuth Token
// ============================
const getPhonePeToken = async () => {
  const now = Date.now();

  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  const body = qs.stringify({
    grant_type: "client_credentials",
    client_id: process.env.PHONEPE_CLIENT_ID,
    client_secret: process.env.PHONEPE_CLIENT_SECRET,
    client_version: "1"
  });

  const res = await axios.post(
    `${BASE_URL}/apis/identity-manager/v1/oauth/token`,
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  cachedToken = res.data.access_token;
  tokenExpiry = now + (res.data.expires_in - 60) * 1000;

  return cachedToken;
};

// ============================
//  Initiate Payment
// ============================
export const pay = async (req, res) => {
  try {
    const { merchantOrderId, amount, redirectUrl } = req.body;

    if (!merchantOrderId || !amount || !redirectUrl) {
      return res.status(400).json({
        success: false,
        message: "merchantOrderId, amount & redirectUrl required"
      });
    }

    const token = await getPhonePeToken();

    const payload = {
      merchantOrderId,
      amount,               // paise me (10000 = ₹100)
      expireAfter: 1200,
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "MarketMind4U Order Payment",
        merchantUrls: [redirectUrl]
      },
      metaInfo: {
        udf1: "MarketMind4U"
      }
    };

    console.log("PAYLOAD ===>", payload);

    const response = await axios.post(
      `${BASE_URL}/apis/pg/checkout/v2/pay`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${token}`,
          Accept: "application/json"
        }
      }
    );

    return res.json({
      success: true,
      data: response.data
    });

  } catch (err) {
    console.log("PHONEPE ERROR ===>", err?.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "Payment Failed",
      error: err?.response?.data || err.message
    });
  }
};
