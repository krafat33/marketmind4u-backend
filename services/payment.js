import axios from "axios";
import qs from "qs";

const BASE_URL = "https://api.phonepe.com";

let cachedToken = null;
let tokenExpiry = 0;

export const getPhonePeAuthToken = async () => {
  const now = Date.now();

  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  const body = qs.stringify({
    grant_type: "client_credentials",
    client_id: process.env.PHONEPE_MERCHANT_ID,
    client_secret: process.env.PHONEPE_CLIENT_SECRET,
    client_version: process.env.PHONEPE_CLIENT_VERSION || "1"
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
