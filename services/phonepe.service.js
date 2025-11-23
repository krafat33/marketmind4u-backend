import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const merchantId = process.env.PHONEPE_MERCHANT_ID;
const salt = process.env.PHONEPE_SALT;
const saltIndex = process.env.PHONEPE_SALT_INDEX;

// Production PayLink API
// Production
const PAYLINK_API_URL = "https://api.phonepe.com/apis/hermes/pg/v1/paylink/create";
const PAYLINK_URI_PATH = "/pg/v1/paylink/create";


export const initiatePhonePePayment = async (payload) => {
  const data = {
    merchantId,
    merchantTransactionId: payload.merchantTransactionId,
    merchantUserId: payload.merchantUserId,
    amount: payload.amount, // in paise
    redirectUrl: payload.redirectUrl,
    callbackUrl: payload.callbackUrl,
  };

  const jsonPayload = JSON.stringify(data);
  const base64Data = Buffer.from(jsonPayload).toString("base64");

  // X-VERIFY hash
  const stringToHash = base64Data + PAYLINK_URI_PATH + salt;
  const xVerify =
    crypto.createHash("sha256").update(stringToHash).digest("hex") +
    "###" +
    saltIndex;

  try {
    const response = await axios.post(
      PAYLINK_API_URL,
      { request: base64Data },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": merchantId,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("PhonePe API Error Response:", error.response?.data || error.message);
    throw error;
  }
};
