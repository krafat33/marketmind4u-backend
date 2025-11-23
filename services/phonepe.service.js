import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const merchantId = process.env.PHONEPE_MERCHANT_ID;
const salt = process.env.PHONEPE_SALT;
const saltIndex = process.env.PHONEPE_SALT_INDEX;

const PG_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
const PG_PATH = "/pg/v1/pay";

export const initiatePhonePePayment = async (payload) => {
  const base64 = Buffer.from(JSON.stringify(payload)).toString("base64");

  const hash = crypto
    .createHash("sha256")
    .update(base64 + PG_PATH + salt)
    .digest("hex");

  const xVerify = `${hash}###${saltIndex}`;

  try {
    const response = await axios.post(
      PG_URL,
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
  } catch (err) {
    console.log("PhonePe PG Error:", err.response?.data || err);
    throw err;
  }
};
