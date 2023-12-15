// const twilio = require('twilio');
// const userModel = require("../model/userModel");
// const accountSid = 'AC7f71cc70f9f7edf8c95cf1d0fb930f21';
// const authToken = '5a783b0a3907e64c5ac37df976d427dd';
// const client = new twilio(accountSid, authToken);

// const sendNotificationsToPlayers = async function(req, res) {

//   // const users = await userModel.find().select({phone:1, userName:1, UserId:1, _id:0});
//   // if(users.length === 0 ){
//   //   return res.status(404).send({status:false, message:"Data not found"});
//   // }
//   // const validUsers = users.filter(user => user.phone && /^[0-9]+$/.test(user.phone));
//   // console.log(users,"--------------------users");
//   // validUsers.forEach(user => {
//   //   const phoneNumber = user.phone;

//   //   client.messages
//   //     .create({
//   //       body: 'game will be lunch on 15th august at 5pm',
//   //       from: '+17066003566',
//   //       to: `+91${phoneNumber}` // Adding '91' as the country code
//   //     })
//   //     .then(message => console.log(`Message sent to ${phoneNumber}: ${message.sid}`))
//   //     .catch(error => console.error(`Error sending message to ${phoneNumber}:`, error));
//   // });
//   // res.status(200).send({message:"successfully send Notification to every player",data:users});
//   const {to,body} = req.body;
//   client.messages.create({
//     body:body,
//     to:to,
//     from:'+17066003566'
//   }).then(()=>{
//     res.send('Notification sent successfully!');
//   }).catch((err) => {
//     console.log(err);
//     res.status(500).send('Error senting sms')
//   })
// }

// module.exports = {sendNotificationsToPlayers};

//----------------firebase-----------------------------------------

// const admin = require('./firebase');  // Path to your firebase.js file
// const userDevice = require('../model/userModel'); // Create a Mongoose model for devices
// const admin = require('firebase-admin');
// const serviceAccount = require('../firebaseService.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// const sendNotification = async function (req, res) {
//   const { title, body } = req.body;

//   try {
//     const devices = await userDevice.find();
//     const registrationTokens = devices.map(device => device.registrationToken);

//     const message = {
//       notification: {
//         title,
//         body,
//       },
//       tokens: registrationTokens,
//     };

//     const response = await admin.messaging().sendMulticast([message]);

//     console.log('Notification sent:', response);
//     res.json({ message: 'Notification sent successfully' });
//   } catch (error) {
//     console.error('Error sending notification:', error);
//     res.status(500).json({ error: 'Error sending notification' });
//   }
// };

// module.exports = { sendNotification };

// //_________________another way _________________________________

// const userDevice = require("../model/userModel"); // Create a Mongoose model for devices
// const admin = require("firebase-admin");
// const serviceAccount = require("../firebaseService.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const sendNotification = async function (req, res) {
//   try {
//     // const devices = await userDevice.find();
//     // const registrationTokens = devices.map(device => device.registrationToken);
//     const registrationTokens = ["12344556677"]

//     const payload = {
//       notification: {
//         title: "This is a Notification",
//         body: "Welcome to our gaming world",
//       },
//     };

//     const options = {
//       priority: "high",
//       timeToLive: 60 * 60 * 24,
//     };

//     const response = await admin.messaging().sendToDevice(registrationTokens, payload, options);

//     console.log("Notification sent:", response);
//     res.json({ message: "Notification sent successfully" });
//   } catch (error) {
//     console.error("Error sending notification:", error);
//     res.status(500).json({ error: 'Error sending notification' });
//   }
// };

// module.exports = { sendNotification };




//__________________________new_______________
const request = require('request');

const sendNotification = async function(req,res){
try{

const serverKey = '164306dcf068810b803e0bbe98b061c072acfa33'; // Replace with your server key
const registrationTokens = ['12344556677']; // Replace with your device tokens
const payload = {
  notification: {
    title: 'This is a Notification',
    body: 'Welcome to our gaming world',
  },
};

const options = {
  priority: 'high',
  timeToLive: 60 * 60 * 24,
};

const headers = {
  Authorization: 'key=' + serverKey,
  'Content-Type': 'application/json',
};

const body = JSON.stringify({
  registration_ids: registrationTokens,
  data: payload,
  android: options,
});

request.post(
  {
    url: 'https://fcm.googleapis.com/fcm/send',
    headers: headers,
    body: body,
  },
  function (error, response, body) {
    if (error) {
      console.error('Error sending notification:', error);
    } else {
      console.log('Notification sent:', body);
    }
  }
);
return res.json({ message: "Notification sent successfully" });
}catch(error){
  console.error("Error sending notification:", error);
  res.status(500).json({ error: 'Error sending notification' });
}
}
module.exports = { sendNotification };