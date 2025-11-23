const axios = require("axios");
const crypto = require("crypto");

const merchantId = "SU2511102050321902747037";
const salt = "cd0bf18a-ec53-48a5-ace2-b23b3464d54b";
const saltIndex = 1;

exports.createPayment = async (req, res) => {
  try {
    const { amount, userId } = req.body;

    const merchantTransactionId = "MM" + Date.now();

    const payload = {
      merchantId,
      merchantTransactionId,
      amount: amount * 100,
      redirectUrl: `https://marketmind4u.com/payment?tid=${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      callbackUrl: "https://marketmind4u-backend.onrender.com/api/payment/callback",
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const payloadString = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadString).toString("base64");

    const finalString = base64Payload + "/pg/v1/pay" + salt;
    const sha256 = crypto.createHash("sha256").update(finalString).digest("hex");
    const checksum = sha256 + "###" + saltIndex;

    const response = await axios.post(
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": merchantId,
        },
      }
    );

    return res.json({
      success: true,
      paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
      merchantTransactionId,
    });

  } catch (err) {
    console.log("Payment Error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Payment Error",
      error: err.response?.data || err.message,
    });
  }
};
