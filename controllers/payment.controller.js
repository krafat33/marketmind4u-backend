import Payment from "../models/Payment.js";
import { initiatePhonePePayment } from "../services/phonepe.service.js";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const salt = process.env.PHONEPE_SALT;
const saltIndex = process.env.PHONEPE_SALT_INDEX;



// ------------------- PAY -------------------
export const pay = async (req, res) => {
  try {
    const { amount, userId } = req.body;
    if (!amount || !userId) return res.status(400).json({ message: "Amount and userId required" });

    const merchantTransactionId = "TXN" + Date.now();

    await Payment.create({
      userId,
      amount,
      merchantTransactionId,
    });

    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: userId,
      amount: amount * 100, // rupees → paise
      redirectUrl: process.env.REDIRECT_URL,
      callbackUrl: process.env.CALLBACK_URL,
    };

    const phonepeResponse = await initiatePhonePePayment(payload);

    if (phonepeResponse.success && phonepeResponse.code === "PAYMENT_INITIATED") {
      return res.json({
        success: true,
        paymentUrl: phonepeResponse.data.instrumentResponse.redirectInfo.url,
        transactionId: merchantTransactionId,
      });
    } else {
      throw new Error(phonepeResponse.message || JSON.stringify(phonepeResponse) || "PhonePe initialization failed.");
    }
  } catch (error) {
    const errorMessage = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error("PhonePe Initiation Error Details:", errorMessage);
    return res.status(500).json({ message: "Payment Error", error: errorMessage });
  }
};

// ------------------- WEBHOOK -------------------
export const phonepeWebhook = async (req, res) => {
  try {
    const base64Data = req.body.response;
    const xVerifyHeader = req.headers["x-verify"];

    if (!base64Data || !xVerifyHeader) return res.status(401).send("Verification Missing");

    const stringToHash = base64Data + "/pg/v1/webhook" + salt;
    const localChecksum =
      crypto.createHash("sha256").update(stringToHash).digest("hex") + "###" + saltIndex;

    if (localChecksum !== xVerifyHeader) {
      console.warn("Webhook Security Alert: Checksum Mismatch");
      return res.status(403).send("Security Check Failed");
    }

    const decodedPayload = Buffer.from(base64Data, "base64").toString("utf8");
    const data = JSON.parse(decodedPayload);

    const { merchantTransactionId, code, providerReferenceId } = data;

    const payment = await Payment.findOne({ merchantTransactionId });
    if (!payment) return res.status(404).send("Payment Not Found");
    if (payment.status === "SUCCESS") return res.status(200).send("OK - Already Processed");

    payment.status = code === "PAYMENT_SUCCESS" ? "SUCCESS" : "FAILED";
    if (code === "PAYMENT_SUCCESS") payment.providerReferenceId = providerReferenceId;

    await payment.save();
    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(500).send("Webhook Error");
  }
};
