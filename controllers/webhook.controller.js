exports.verifyWebhookSignature=(req,res,next)=>{
    try{
    
    const secret=process.env.RAZORPAY_WEBHOOK_SECRET;
    
    const signature =
    req.headers["x-razorpay-signature"];
    
    if(!signature){
     return res.status(400).json({
       success:false,
       message:"Signature missing"
     });
    }
    
    const expectedSignature=
    crypto
    .createHmac("sha256", secret)
    .update(req.body) // raw buffer
    .digest("hex");
    
    if(signature !== expectedSignature){
     return res.status(400).json({
      success:false,
      message:"Invalid signature"
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