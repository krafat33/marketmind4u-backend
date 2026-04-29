const crypto = require("crypto");

exports.razorpayWebhook = async (req,res)=>{
  try{
  
  console.log("Webhook Payload:", req.body);
  
  const event = req.body;
  
  if(event.event==="payment_link.paid"){
     console.log("Customer payment success");
  }
  
  if(event.event==="payment_link.failed"){
     console.log("Payment failed");
  }
  
  if(event.event==="payment_link.cancelled"){
     console.log("Payment cancelled");
  }
  
  return res.status(200).json({
   success:true,
   paymentReceived:true,
   event:event.event,
   data:event.payload
  });
  
  }catch(err){
   console.log(err);
   return res.status(500).json({
     success:false
   });
  }
  };