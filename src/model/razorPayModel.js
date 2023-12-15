const mongoose = require("mongoose");

const razorpayTransactionSchema = new mongoose.Schema({
  UserId: {
    type: String, // Store the UserId
    // required: true,
},
  orderId: {
    type: String, // Store the Razorpay order ID for reference
    // required: true,
  },
  paymentId: {
    type: String, // Store the Razorpay payment ID for reference
    // required: true,
  },
  razorpayOrderId: {
    type: String, // Store the Razorpay order ID
    // required: true,
  },
  razorpayPaymentId: {
    type: String, // Store the Razorpay payment ID
    // required: true,
  },
  razorpaySignature: {
    type: String, // Store the Razorpay signature
    // required: true,
  },
  amount: {
    type: Number,
    // required: true,
  },
  type: {
    type: String, // This field can be used to indicate 'deposit' or 'withdrawal'
    enum: ["deposit", "withdrawal"],
    // required: true,
  },
  withdrawalRequestId:{
    type: String
  },
  status: {
    type: String,
    // required: true,
    enum: ["success", "failure", "pending"],
  },
},{timestamps:true});

module.exports = mongoose.model("RazorpayTransaction", razorpayTransactionSchema);