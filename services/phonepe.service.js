import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const merchantId = process.env.PHONEPE_MERCHANT_ID;
const salt = process.env.PHONEPE_SALT;
const saltIndex = process.env.PHONEPE_SALT_INDEX;

// 👉 PG PAY URL (NOT PAYLINK!)
const API_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
const API_PATH = "/pg/v1/pay";

export const initiatePhonePePayment = async (payload) => {
  const base64 = Buffer.from(JSON.stringify(payload)).toString("base64");

  const hashString = base64 + API_PATH + salt;

  const sha256 = crypto
    .createHash("sha256")
    .update(hashString)
    .digest("hex");

  const xVerify = sha256 + "###" + saltIndex;

  try {
    const response = await axios.post(
      API_URL,
      { request: base64 },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": merchantId
        }
      }
    );

    return response.data;
  } catch (error) {
    console.log("PhonePe PG Error:", error.response?.data || error.message);
    throw error;
  }
};
