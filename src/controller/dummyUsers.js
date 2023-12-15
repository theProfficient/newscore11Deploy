let fakeUsers = [
  {
"UserId": "sona4444",
"userName": "sona",
"email": "dfcu3333j@gmail.com",
"phone": "59666665",
"referralCode": "i5qcu3g9s4",
"credits": 100,
"isBot": true,
"realMoney": 0,
"status": false,
"history": [],
},{
  "UserId": "Nik1117",
  "userName": "Nik",
  "email": "Nik1117@gmail.com",
  "phone": "59117777565",
  "referralCode": "0beo9lrqltk",
  "credits": 100,
  "isBot": true,
  "realMoney": 0,
  "status": false,
  "history": [],
  "strength":2,
  "_id": "6447ae67ab33603b5a96e1a3",
  },{
    "UserId": "Rocky111",
    "userName": "Rocky",
    "email": "rocky@gmail.com",
    "phone": "5911155565",
    "referralCode": "kbu9nja9e4",
    "credits": 100,
    "isBot": true,
    "realMoney": 0,
    "status": false,
    "history": [],
    "_id": "6447aebe6372b3ff43d2cc07",
  }, {
    "UserId": "Micky111",
    "userName": "Micky",
    "email": "Micky@gmail.com",
    "phone": "5911155565",
    "referralCode": "1fn8tiirpf8",
    "credits": 100,
    "isBot": true,
    "realMoney": 0,
    "status": false,
    "history": [],
    "_id": "6447af413065db13e4a0d508",
  },{
    "UserId": "Tom111",
    "userName": "Tom",
    "email": "tomj@gmail.com",
    "phone": "59666655565",
    "referralCode": "hsctn6ukin",
    "credits": 100,
    "isBot": true,
    "realMoney": 0,
    "status": false,
    "history": [],
    "_id": "6447af79e2c4a6d3c930c244"}]

    const botPlayers = async function(req,res){
      try{
          return res.status(200).send(fakeUsers)
      }catch(error){
        return res.status(500).send({status:false, message:error.message});
      }
    }

  module.exports = { fakeUsers, botPlayers }