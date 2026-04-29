const Payment=require("../models/Payment");
const User=require("../models/User");

exports.checkPaymentStatus=async(req,res)=>{
try{

const { customerId } = req.body;

let user;


// if Mongo ObjectId passed
if(customerId.length===24){
 user = await User.findById(customerId);
}else{
 // if userCode passed
 user = await User.findOne({
   userCode:customerId
 });
}

if(!user){
 return res.json({
  success:false,
  message:"User not found"
 });
}

const payments=
await Payment.find({
 user:user._id
}).populate("user subscription");


return res.json({
success:true,
customer:{
 id:user._id,
 name:user.name,
 mobile:user.mobile,
 userCode:user.userCode
},
totalPayments:payments.length,
data:payments
});

}catch(err){
console.log(err);
}
};