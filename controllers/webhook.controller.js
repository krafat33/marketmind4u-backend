const Payment=require("../models/Payment");

exports.checkPaymentStatus=async(req,res)=>{
try{

const { customerId } = req.body;

if(!customerId){
 return res.status(400).json({
   success:false,
   message:"customerId required"
 });
}

const payments=
await Payment.find({
 user:customerId
})
.populate("user subscription")
.sort({createdAt:-1});


return res.json({
 success:true,
 totalPayments:payments.length,
 data:payments
});

}catch(err){
console.log(err);
return res.status(500).json({
success:false
});
}
};