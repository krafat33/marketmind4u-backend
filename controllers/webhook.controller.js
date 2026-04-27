const crypto = require('crypto');

const handleWebhook = async (event) => {
  try {
    console.log("📩 Event:", event.event);

    if (event.event === "payment_link.paid") {
      console.log("💰 Payment SUCCESS");

      const payment = event.payload.payment.entity;
      const plinkId = payment.notes?.payment_link_id;

      // 👉 DB update karo
      await updatePaymentStatus(plinkId, "paid");
    }

    if (event.event === "payment_link.failed") {
      console.log("❌ Payment FAILED");
    }

  } catch (err) {
    console.log("Processing Error:", err);
  }
};
module.exports = { handleWebhook };