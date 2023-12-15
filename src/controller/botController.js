const mongoose = require("mongoose");
const botModel = require("../model/botModel");
const cricketModel = require("../model/cricketModel");
const hockyModel = require("../model/hockyModel");
const userModel = require("../model/userModel");
const snakeLadderModel = require("../model/snakeLadderModel");
const ticTacToeModel = require("../model/ticTacToeModel");
const { log } = require("console");

// const createBot = async function (req, res) {
//     try {
//       let queryData = req.query;

//       let {
//         UserId,
//         userName,
//         email,
//         phone,
//         status,
//         credits,
//         referralCode,
//         isBot,
//         winCount,
//         playCount,
//         hockeyDataData,
//         ticTacToeDataData,
//         snkLadderData,
//         cricketData,
//         botType
//       } = queryData;

//       let checkUserId = await botModel.findOne({ UserId: UserId });
//       if (checkUserId != null && checkUserId != undefined) {
//         if (checkUserId.banned === true) {
//           return res.status(200).send({
//             status: false,
//             message: "bot is banned ",
//           });
//         }
//         return res.status(200).send({
//           status: true,
//           message: "bot is already exists",
//           data: checkUserId,
//         });
//       }
//       if (!userName) {
//         if (email) {
//           userName = await generateRandomUsername(email);
//         } else if (phone) {
//           userName = generateUsernameFromPhoneNumber(phone);
//         }
//         queryData.userName = userName;
//       }

//       let userNameAlreadyExist = await botModel.findOne({ userName: userName });

//       if (userNameAlreadyExist) {
//         userName = await generateUniqueUsername(userName);
//         queryData.userName = userName;
//       }

//       if (Object.keys(queryData).length == 0) {
//         return res.status(400).send({
//           status: false,
//           message:
//             "Body should  not be Empty please enter some data to create user",
//         });
//       }

//       queryData.cricketData = [{ playCount: 0, winCount: 0 }];
//       queryData.snkLadderData = [{ playCount: 0, winCount: 0 }];
//       queryData.ticTacToeDataData = [{ playCount: 0, winCount: 0 }];
//       queryData.hockeyDataData = [{ playCount: 0, winCount: 0 }];

//       // Generate a unique referral code for the new user
//       const referral_Code = Math.random().toString(36).substring(2);
//       queryData.referralCode = referral_Code;

//       if (referralCode) {
//         // Find the referrer by their referral code
//         const referrer = await userModel.findOne({ referralCode: referralCode });

//         // If the referrer is found, add credits to the referrer's accounts
//         if (referrer) {
//           referrer.credits += 10;
//           await referrer.save();
//         } else {
//           return res.status(400).json({ error: "Invalid referral code" });
//         }
//       }

//       const botCreated = await botModel.create(queryData);
//       const CricTable = await cricketModel.create(queryData);
//       const HocTable = await hockyModel.create(queryData);
//       const SnakeTable = await snakeLadderModel.create(queryData);
//       const TicTable = await ticTacToeModel.create(queryData);

//       return res.status(201).send({
//         status: true,
//         message: "success",
//         data: botCreated,
//         CricTable,
//         HocTable,
//         SnakeTable,
//         TicTable,
//       });
//     } catch (error) {
//       return res.status(500).send({
//         status: false,
//         message: error.message,
//       });
//     }
//   };

//   async function generateUniqueUsername(userName) {
//     let newUserName = userName;
//     let user = await botModel.findOne({ userName: newUserName });

//     while (user) {
//       newUserName = userName + randomString(5);
//       user = await botModel.findOne({ userName: newUserName });
//     }
//     return newUserName;
//   }

//   async function generateRandomUsername(email) {
//     let newUserName = email.split("@")[0].substring(0, 14);
//     let user = await botModel.findOne({ userName: newUserName });

//     while (user) {
//       newUserName = email.split("@")[0].substring(0, 9) + randomString(5);
//       user = await botModel.findOne({ userName: newUserName });
//     }

//     return newUserName;
//   }

//   function randomString(length) {
//     const characters =
//       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     let result = "";
//     for (let i = 0; i < length; i++) {
//       result += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return result;
//   }

//   function generateUsernameFromPhoneNumber(phone) {
//     const firstTwoDigits = phone.substring(0, 2);
//     const lastTwoDigits = phone.substring(phone.length - 2);
//     return `${firstTwoDigits}xxxxxx${lastTwoDigits}`;
//   }

//______________________________________________________to create bot by quantity

const createBot = async function (req, res) {
  try {
    let queryData = req.query;

    let {
      UserId,
      userName,
      email,
      quantity,
      phone,
      status,
      credits,
      referralCode,
      isBot,
      winCount,
      playCount,
      hockeyDataData,
      ticTacToeDataData,
      snkLadderData,
      cricketData,
      botType,
    } = queryData;

    if (
      queryData.quantity &&
      !queryData.UserId &&
      !queryData.email &&
      !queryData.botType &&
      !queryData.phone
    ) {
      const numQuantity = parseInt(quantity);

      if (isNaN(numQuantity) || numQuantity <= 0) {
        return res.status(400).send({
          status: false,
          message: "Quantity should be a positive number",
        });
      }

      queryData.cricketData = [{ playCount: 0, winCount: 0 }];
      queryData.snkLadderData = [{ playCount: 0, winCount: 0 }];
      queryData.ticTacToeDataData = [{ playCount: 0, winCount: 0 }];
      queryData.hockeyDataData = [{ playCount: 0, winCount: 0 }];

      //___________Declare these variables before entering the loop
      let CricTable, HocTable, SnakeTable, TicTable;

      const createdBots = [];

      for (let i = 0; i < numQuantity; i++) {
        let randomUserId, randomEmail;

        // Generate a unique UserId
        do {
          randomUserId = generateRandomUserId();
        } while (await botModel.findOne({ UserId: randomUserId }));

        // Generate a unique email
        do {
          randomEmail = generateRandomEmail();
        } while (await botModel.findOne({ email: randomEmail }));

        const botTypes = ["normal", "hard", "easy"];
        const randomBotType =
          botTypes[Math.floor(Math.random() * botTypes.length)];

        // Set the generated values in queryData
        queryData.UserId = randomUserId;
        queryData.email = randomEmail;
        queryData.botType = randomBotType;
        queryData.userName = randomEmail.substring(0, 7);

        const botCreated = await botModel.create(queryData);

        // Add the created bot to the array
        createdBots.push(botCreated);

        const CricTable = await cricketModel.create({ UserId: randomUserId });
        const HocTable = await hockyModel.create({ UserId: randomUserId });
        const SnakeTable = await snakeLadderModel.create({
          UserId: randomUserId,
        });
        const TicTable = await ticTacToeModel.create({ UserId: randomUserId });

        const referralCode = generateUniqueReferralCode();

        botCreated.referralCode = referralCode;
        await botCreated.save();
      }

      return res.status(201).send({
        status: true,
        message: "Bots created successfully",
        data: createdBots,
        CricTable,
        HocTable,
        SnakeTable,
        TicTable,
      });
    }
    //_________________________else all data available______________

    let checkUserId = await botModel.findOne({ UserId: UserId });
    if (checkUserId != null && checkUserId != undefined) {
      if (checkUserId.banned === true) {
        return res.status(200).send({
          status: false,
          message: "bot is banned ",
        });
      }
      return res.status(200).send({
        status: true,
        message: "bot is already exists",
        data: checkUserId,
      });
    }
    if (!userName) {
      if (email) {
        userName = await generateRandomUsername(email);
      } else if (phone) {
        userName = generateUsernameFromPhoneNumber(phone);
      }
      queryData.userName = userName;
    }

    let userNameAlreadyExist = await botModel.findOne({ userName: userName });

    if (userNameAlreadyExist) {
      userName = await generateUniqueUsername(userName);
      queryData.userName = userName;
    }

    if (Object.keys(queryData).length == 0) {
      return res.status(400).send({
        status: false,
        message:
          "Body should  not be Empty please enter some data to create user",
      });
    }

    queryData.cricketData = [{ playCount: 0, winCount: 0 }];
    queryData.snkLadderData = [{ playCount: 0, winCount: 0 }];
    queryData.ticTacToeDataData = [{ playCount: 0, winCount: 0 }];
    queryData.hockeyDataData = [{ playCount: 0, winCount: 0 }];

    // Generate a unique referral code for the new user
    const referral_Code = Math.random().toString(36).substring(2);
    queryData.referralCode = referral_Code;

    if (referralCode) {
      // Find the referrer by their referral code
      const referrer = await userModel.findOne({ referralCode: referralCode });

      // If the referrer is found, add credits to the referrer's accounts
      if (referrer) {
        referrer.credits += 10;
        await referrer.save();
      } else {
        return res.status(400).json({ error: "Invalid referral code" });
      }
    }

    const botCreated = await botModel.create(queryData);
    const CricTable = await cricketModel.create(queryData);
    const HocTable = await hockyModel.create(queryData);
    const SnakeTable = await snakeLadderModel.create(queryData);
    const TicTable = await ticTacToeModel.create(queryData);

    return res.status(201).send({
      status: true,
      message: "success",
      data: botCreated,
      CricTable,
      HocTable,
      SnakeTable,
      TicTable,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

async function generateUniqueUsername(userName) {
  let newUserName = userName;
  let user = await botModel.findOne({ userName: newUserName });

  while (user) {
    newUserName = userName + randomString(5);
    user = await botModel.findOne({ userName: newUserName });
  }
  return newUserName;
}

async function generateRandomUsername(email) {
  let newUserName = email.split("@")[0].substring(0, 14);
  let user = await botModel.findOne({ userName: newUserName });

  while (user) {
    newUserName = email.split("@")[0].substring(0, 9) + randomString(5);
    user = await botModel.findOne({ userName: newUserName });
  }

  return newUserName;
}

function randomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateUsernameFromPhoneNumber(phone) {
  const firstTwoDigits = phone.substring(0, 2);
  const lastTwoDigits = phone.substring(phone.length - 2);
  return `${firstTwoDigits}xxxxxx${lastTwoDigits}`;
}

// Function to generate a random UserId
function generateRandomUserId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomUserId = "";

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomUserId += characters[randomIndex];
  }

  return randomUserId;
}

// Function to generate a random email address
function generateRandomEmail() {
  const domains = ["example.com", "test.com", "example.org"];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  const randomUsername = generateRandomUsername();
  return `${randomUsername}@${randomDomain}`;
}

// Function to generate a random username
function generateRandomUsername() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let username = "";
  for (let i = 0; i < 10; i++) {
    username += characters[Math.floor(Math.random() * characters.length)];
  }
  return username;
}

function generateUniqueReferralCode() {
  const referralCode = Math.random().toString(36).substring(2, 8);
  return referralCode;
}

// ___________________________________________________find by query params

const getBotData = async function (req, res) {
  try {
    let UserId = req.query.UserId;

    const getNewBot = await botModel.findOne({ UserId: UserId });
    let cricket = await cricketModel.findOne({ UserId: UserId });
    let hocky = await hockyModel.findOne({ UserId: UserId });
    let snakeLadder = await snakeLadderModel.findOne({ UserId: UserId });
    let ticTacToe = await ticTacToeModel.findOne({ UserId: UserId });

    if (!getNewBot) {
      return res.status(404).send({
        status: false,
        message: "bot not found",
      });
    }

    return res.status(200).send({
      status: true,
      message: "bot data",
      data: getNewBot,
      cricket,
      hocky,
      snakeLadder,
      ticTacToe,
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

//__________________get All bot __________________

const getAllBot = async function (req, res) {
  try {
    const getBot = await botModel.find();

    if (getBot.length == 0) {
      return res.status(404).send({
        status: false,
        message: "bot not found",
      });
    }
    return res.status(200).json(getBot);
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

module.exports = { createBot, getBotData, getAllBot };
