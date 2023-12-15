const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const razorPayModel = require("../model/razorPayModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");


// Generate a unique withdrawalRequestId with "withdra" prefix
function generateWithdrawalRequestId() {
    // Generate a timestamp string
    const timestamp = Date.now().toString();

    // Generate a random number 
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    // Concatenate "withdra", timestamp, and random number to create a unique ID
    const withdrawalRequestId = `withdra${timestamp}${random}`;

    return withdrawalRequestId;
}

//_________________________________order api________________________

const createOrder = async (req, res) => {
    const RAZORPAY_KEY_ID = "rzp_test_RPWBqcW6sylwl4";
    const RAZORPAY_KEY_SECRET = "dZ8qL26CmTAR1pLV0ODSoeUX";

    const razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
    });

    try {
        const options = {
            amount: req.body.amount * 100,
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        };
        let UserId = req.body.currentUrl.split("UserId=")[1];
        console.log(UserId, "_____UserId");

        razorpay.orders.create(options, (error, order) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: "Something Went Wrong!" });
            }

            // Create a new instance of RazorpayTransaction with UserId
            const transaction = new razorPayModel({
                UserId: UserId,
                orderId: order.id,
                paymentId: null, 
                razorpayOrderId: order.id,
                razorpayPaymentId: null, 
                razorpaySignature: null, 
                amount: req.body.amount,
                status: "pending", // Assuming initial status is pending
            });

            transaction.save((err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Failed to save transaction!" });
                }
                // Include UserId in the response JSON
                res.status(200).json({ data: order, UserId: UserId });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

//__________________________________________verify api_______________________________________________

const verifyOrder = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, UserId } =
        req.body;
  
      console.log("Received verify request data:", { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, UserId });

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", "dZ8qL26CmTAR1pLV0ODSoeUX") // Change KEY_SECRET to RAZORPAY_KEY_SECRET
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            const UserId = req.body.UserId; 

            // Find the existing transaction document by orderId
            const existingTransaction = await razorPayModel.findOne({ orderId: razorpay_order_id });

            if (!existingTransaction) {
                return res.status(404).json({ message: "Transaction not found!" });
            }

            // Update the existing transaction document with payment details
            existingTransaction.paymentId = razorpay_payment_id;
            existingTransaction.razorpayPaymentId = razorpay_payment_id;
            existingTransaction.razorpaySignature = razorpay_signature;
            existingTransaction.amount = amount;
            existingTransaction.status = "success"; // Update status based on your verification logic

            await existingTransaction.save(); // Save the updated transaction to the database

            const responseData = {
                message: "Payment verified successfully",
                transactionData: existingTransaction,
            };

            let checkUserId = await userModel.findOne({UserId:UserId})
            console.log(checkUserId,"_____________________checkUserId");
            
            if(checkUserId){
              checkUserId.realMoney += amount
              const update = await checkUserId.save()
              console.log(update,"::::::update");
            }
            return res.status(200).json(responseData,);
        } else {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

//______________________________withdrawal  amount___________

const initiateWithdrawal = async (req, res) => {
    try {
        const { amount } = req.body;
        const UserId = req.body.currentUrl.split("UserId=")[1];
        const withdrawalRequestId = generateWithdrawalRequestId(); // Generate a unique withdrawal request ID

        console.log(UserId, "_____UserId");

        // Verify user identity (you may implement authentication/authorization)

        // Check if the user has sufficient balance in their virtual wallet
        const user = await userModel.findOne({UserId }); // Fetch user data from your database

        if (!user ) {
            return res.status(400).json({ message: "Insufficient balance or user not found" });
        }

        // Deduct the withdrawal amount from the user's balance
        user.realMoney -= amount;
        await user.save();
        console.log(user.realMoney,"+++user.realMoney");

        const transaction = new razorPayModel({
            UserId,
            type: "withdrawal",
            amount,
            withdrawalRequestId,
            timestamp: Date.now(),
            status: "success", // Assuming withdrawal is successful
        });

        console.log(transaction,"+++++++++transaction");
        // await user.save();
        await transaction.save();

        return res.status(201).json({ message: "Withdrawal successful" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};


module.exports = { createOrder, verifyOrder, initiateWithdrawal  };

// const mongoose = require("mongoose");
// const userModel = require("../model/userModel");
// const razorPayModel = require("../model/razorPayModel");
// const Razorpay = require("razorpay");
// const crypto = require("crypto");

// //_________________________________order api________________________

// const createOrder = async (req, res) => {
//     const RAZORPAY_KEY_ID = "rzp_test_RPWBqcW6sylwl4";
//     const RAZORPAY_KEY_SECRET = "dZ8qL26CmTAR1pLV0ODSoeUX";

//     const razorpay = new Razorpay({
//         key_id: RAZORPAY_KEY_ID,
//         key_secret: RAZORPAY_KEY_SECRET,
//     });

//     try {
//         const options = {
//             amount: req.body.amount * 100,
//             currency: "INR",
//             receipt: crypto.randomBytes(10).toString("hex"),
//         };
//         let UserId = req.body.currentUrl.split("UserId=")[1];
//         console.log(UserId, "_____UserId");

//         razorpay.orders.create(options, (error, order) => {
//             if (error) {
//                 console.error(error);
//                 return res.status(500).json({ message: "Something Went Wrong!" });
//             }

//             // Create a new instance of RazorpayTransaction with UserId
//             const transaction = new razorPayModel({
//                 UserId: UserId,
//                 orderId: order.id,
//                 paymentId: null, // You can update this later when verifying the payment
//                 razorpayOrderId: order.id,
//                 razorpayPaymentId: null, // You can update this later when verifying the payment
//                 razorpaySignature: null, // You can update this later when verifying the payment
//                 amount: req.body.amount,
//                 status: "pending", // Assuming initial status is pending
//             });

//             transaction.save((err) => {
//                 if (err) {
//                   console.error(err);
//                   return res.status(500).json({ message: "Failed to save transaction!" });
//                 }
//                 // Include UserId and orderRequestId in the response JSON
//                 res.status(200).json({ data: order, UserId: UserId, });
//               });
//             });
//           } catch (error) {
//             console.error(error);
//             res.status(500).json({ message: "Internal Server Error!" });
//           }
//         };

// //__________________________________________verify api

// const verifyOrder = async (req, res) => {
//     try {
//        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, UserId } =
//       req.body;

//       console.log("Received verify request data:", { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, UserId });

//       const sign = razorpay_order_id + "|" + razorpay_payment_id;
//       const expectedSign = crypto
//         .createHmac("sha256", "dZ8qL26CmTAR1pLV0ODSoeUX")
//         .update(sign.toString())
//         .digest("hex");
  
//       if (razorpay_signature === expectedSign) {
//         const UserId = req.body.UserId;
  
//         const existingTransaction = await razorPayModel.findOne({ UserId });
  
//         if (!existingTransaction) {
//           return res.status(404).json({ message: "Transaction not found!" });
//         }
  
//         existingTransaction.paymentId = razorpay_payment_id;
//         existingTransaction.razorpayPaymentId = razorpay_payment_id;
//         existingTransaction.razorpaySignature = razorpay_signature;
//         existingTransaction.amount = amount;
//         existingTransaction.status = "success";
  
//         await existingTransaction.save();
  
//         const responseData = {
//           message: "Payment verified successfully",
//           transactionData: existingTransaction,
//         };
  
//         let checkUserId = await userModel.findOne({ UserId: UserId });
//         console.log(checkUserId, "_____________________checkUserId");
  
//         if (checkUserId) {
//           checkUserId.realMoney += amount;
//           const update = await checkUserId.save();
//           console.log(update, "::::::update");
//         }
  
//         return res.status(200).json(responseData);
//       } else {
//         return res.status(400).json({ message: "Invalid signature sent!" });
//       }
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).json({ message: "Internal Server Error!" });
//     }
//   };
  

// //______________________________withdrawal  amount___________

// const initiateWithdrawal = async (req, res) => {
  
//     const RAZORPAY_KEY_ID = "rzp_test_RPWBqcW6sylwl4";
//     const RAZORPAY_KEY_SECRET = "dZ8qL26CmTAR1pLV0ODSoeUX";

//     const razorpay = new Razorpay({
//         key_id: RAZORPAY_KEY_ID,
//         key_secret: RAZORPAY_KEY_SECRET,
//     });
//     try {
//         const { amount } = req.body;
//         console.log(req.body,"______________req.body withdrawal");

//         let UserId = req.body.currentUrl.split("UserId=")[1];
//         console.log(UserId, "_____UserId");

//         // Verify user identity (you may implement authentication/authorization)

//         // Check if the user has sufficient balance in their virtual wallet
//         const user = await userModel.findOne({UserId }); // Fetch user data from your database
//        console.log(user,"::::::::user");

    
//     if (!user || user.realMoney < amount) {
//       return res.status(400).json({ message: 'Insufficient balance or user not found' });
//     }

//     const payoutOptions = {
//       account_number: user.bankAccountNumber, // Replace with the user's bank account number
//       account_type: 'bank_account',
//       amount: amount * 100, // Convert amount to paise
//       currency: 'INR',
//       mode: 'IMPS', // Change this to your preferred mode (IMPS, NEFT, UPI, etc.)
//       purpose: 'Withdrawal',
//       queue_if_low_balance: true,
//       reference_id: crypto.randomBytes(10).toString('hex'), // Generate a unique reference ID
//       narration: 'Withdrawal request',
//     };

//     razorpay.payouts.create(payoutOptions, async (error, payout) => {
//       if (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Failed to initiate withdrawal!' });
//       }

//      // Create a record of the withdrawal in your database
//      const withdrawal = new Withdrawal({
//         UserId,
//         withdrawalRequestId: payout.id,
//         amount,
//         status: 'pending', // You can set an initial status as 'pending'
//         payoutId: payout.id,
//       });

//       // Deduct the amount from the user's balance
//       user.realMoney -= amount;

//       // Save the withdrawal request and update the user's balance
//       await withdrawal.save();
//       await user.save();

//       return res.status(201).json({ message: 'Withdrawal request initiated successfully', payoutId: payout.id });
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

// //____________________verify withdrawals 


// const verifyWithdrawals = async function (req,res){
//     try{
        
//      const { payout_id, status } = req.body;

//      const withdrawal = await Withdrawal.findOne({ payoutId: payout_id });

     
//     if (!withdrawal) {
//         return res.status(404).json({ message: 'Withdrawal not found' });
//       }
  
//       // Update the status of the withdrawal based on the verification result
//       withdrawal.status = status;
  
//       // Save the updated withdrawal status
//       await withdrawal.save();
//       return res.status(200).json({ message: 'Withdrawal verification status updated' });
//     }catch(error){
//     console.error(error.message);
//     res.status(500).json({ message: 'Internal Server Error' })
//     }
// }

// module.exports = { createOrder, verifyOrder, initiateWithdrawal, verifyWithdrawals };