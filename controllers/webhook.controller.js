const crypto = require("crypto");
const Payment = require("../models/Payment");
const User = require("../models/User");


// ====================================
// Verify Razorpay Signature
// ====================================
exports.verifyWebhookSignature = async (
 req,
 res,
 next
)=>{
try{

const secret=
process.env.RAZORPAY_WEBHOOK_SECRET;

const signature=
req.headers["x-razorpay-signature"];

const generatedSignature=
crypto
.createHmac("sha256",secret)
.update(req.body)
.digest("hex");


if(signature!==generatedSignature){
return res.status(400).json({
success:false,
message:"Invalid Signature"
});
}

req.webhookBody=
JSON.parse(req.body.toString());

next();

}catch(err){
console.log(err);

return res.status(500).json({
success:false,
message:"Verification failed"
});
}
};



// ====================================
// WEBHOOK
// ====================================
exports.razorpayWebhook = async(
req,
res
)=>{
try{

const event=req.webhookBody;

console.log(
"Webhook Event:",
event.event
);


// =========================
// PAYMENT SUCCESS
// =========================
if(
event.event==="payment_link.paid"
){

const payment=
event.payload.payment.entity;


// idempotency duplicate check
const duplicate=
await Payment.findOne({
razorpayPaymentId:payment.id
});

if(duplicate){
return res.status(200).json({
success:true,
message:"Already processed"
});
}



// user/customer identify
const razorpayCustomerId=
payment.customer_id;

const user=
await User.findOne({
razorpayCustomerId
});


if(!user){
return res.status(404).json({
success:false,
message:"User not found"
});
}



// Create payment record
await Payment.create({

subscription:
payment.notes?.subscriptionId,

user:user._id,

employeeCode:
user.employeeCodeUsed,

paymentType:
payment.notes?.paymentType || "MONTHLY",

method:"razorpay_link",

status:"SUCCESS",

amount:
payment.amount/100,

razorpayPaymentId:
payment.id,

paidAt:new Date()
});


// optional subscription update
console.log(
"Payment success saved"
);

}



// =========================
// PAYMENT FAILED
// =========================
if(
event.event==="payment_link.failed"
){

const payment=
event.payload.payment.entity;

await Payment.findOneAndUpdate(
{
razorpayPaymentId:payment.id
},
{
status:"FAILED"
}
);

console.log(
"Payment failed updated"
);

}



return res.status(200).json({
success:true,
message:"Webhook received"
});


}catch(error){

console.log(
"Webhook Error:",
error
);

return res.status(500).json({
success:false,
message:"Webhook failed"
});

}
};