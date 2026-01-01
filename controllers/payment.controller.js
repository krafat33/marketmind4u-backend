import { StandardCheckoutClient, Env, CreateSdkOrderRequest } from 'pg-sdk-node';
import { randomUUID } from 'crypto';

// Environment variables
const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = "1.0.0"; // ya apka actual client version
const env = Env.SANDBOX; // SANDBOX ya PRODUCTION

// SDK client instance
const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

// Pay API controller
const pay = async (req, res) => {
  try {
    const { amount } = req.body; // amount in paise
    const redirectUrl = "https://marketmind4u.com/";

    // Unique merchant order ID
    const merchantOrderId = "MM" + randomUUID().replace(/-/g, "").slice(0, 18);

    // SDK order request
    const request = CreateSdkOrderRequest.StandardCheckoutBuilder()
      .merchantOrderId(merchantOrderId)
      .amount(amount) // already in paise
      .disablePaymentRetry(true)
      .redirectUrl(redirectUrl)
      .callbackUrl(process.env.PHONEPE_CALLBACK_URL)
      .build();

    // Create SDK order
    const response = await client.createSdkOrder(request);

    // Response me token + redirect URL milega
    return res.status(200).json({
      success: true,
      token: response.token,
      redirectUrl: response.redirectUrl || redirectUrl,
      orderId: merchantOrderId
    });

  } catch (error) {
    console.error("PHONEPE SDK ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Payment Failed",
      error: error.message || error
    });
  }
};

export default { pay };
