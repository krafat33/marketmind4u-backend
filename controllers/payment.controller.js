import { StandardCheckoutClient, Env, CreateSdkOrderRequest } from 'pg-sdk-node';
import { randomUUID } from 'crypto';

const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = "1.0.0";
const env = Env.SANDBOX; // or Env.PRODUCTION

const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

export const pay = async (req, res) => {
    try {
        const merchantOrderId = randomUUID();
        const amount = Math.round(req.body.amount); // Paise
        const redirectUrl = req.body.redirectUrl || "https://marketmind4u.com/";

        const request = CreateSdkOrderRequest.StandardCheckoutBuilder()
            .merchantOrderId(merchantOrderId)
            .amount(amount)
            .disablePaymentRetry(true)
            .redirectUrl(redirectUrl)
            .build();

        const response = await client.createSdkOrder(request);
        
        // Ye token ya redirect URL wapas frontend ko bhejna
        return res.status(200).json({
            success: true,
            data: {
                orderId: merchantOrderId,
                token: response.token,
                redirectUrl: redirectUrl
            }
        });

    } catch (err) {
        console.error("PHONEPE SDK ERROR:", err);
        return res.status(500).json({ success: false, message: "Payment Failed", error: err.message });
    }
};


export { pay };
