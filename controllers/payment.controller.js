// ESM Style
import { StandardCheckoutClient, Env, CreateSdkOrderRequest } from "pg-sdk-node";
import { randomUUID } from "crypto";

// Environment variables
const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = process.env.PHONEPE_CLIENT_VERSION || "1.0.0";
const env = process.env.PHONEPE_ENV === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

// Initialize SDK client
const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

/**
 * Pay API
 * Expects: { merchantOrderId, amount, redirectUrl } in req.body
 */
export const pay = async (req, res) => {
  try {
    const { merchantOrderId, amount, redirectUrl } = req.body;

    if (!merchantOrderId || !amount || !redirectUrl) {
      return res.status(400).json({
        success: false,
        message: "merchantOrderId, amount and redirectUrl are required",
      });
    }

    // Convert amount to integer paise if float
    const finalAmount = Math.round(parseFloat(amount));

    // Create PhonePe SDK request
    const request = CreateSdkOrderRequest.StandardCheckoutBuilder()
      .merchantOrderId(merchantOrderId)
      .amount(finalAmount)
      .disablePaymentRetry(true)
      .redirectUrl(redirectUrl)
      .build();

    // Call PhonePe SDK
    const response = await client.createSdkOrder(request);

    // Response contains `token` for redirect
    const token = response.token;
    const phonepeRedirectUrl = `https://mercury-t2.phonepe.com/transact/pgv3?token=${token}&routingKey=W`;

    return res.status(200).json({
      success: true,
      data: {
        merchantOrderId,
        amount: finalAmount,
        token,
        redirectUrl: phonepeRedirectUrl,
      },
    });

  } catch (err) {
    console.error("PHONEPE SDK ERROR:", err);

    // Unauthorized check
    const status = err?.httpStatusCode || 500;
    const message = err?.message || "Payment Failed";

    return res.status(status).json({
      success: false,
      message,
      error: err,
    });
  }
};
