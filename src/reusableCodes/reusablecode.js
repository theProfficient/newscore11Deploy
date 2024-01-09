const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const tournamentModel = require("../model/tournamentModel");
const cricketModel = require("../model/cricketModel");
const _ = require("lodash");
const fakeUsers = require("../controller/dummyUsers");
const { find } = require("lodash");
const groupModel = require("../model/groupModel");
const snkTournamentModel = require("../model/snkTournamentModel");
const groupModelForSnakeLadder = require("../model/groupModelForSnakeLadder");
const ticTacToeTournamentModel = require("../model/ticTacToeTournamentModel");
const ticTacToeGroupModel = require("../model/ticTacToeGroupModel");
const Decimal = require("decimal.js");
const profitLossModel = require("../model/profitLossModel");
const botModel = require("../model/botModel");
const moment = require("moment");
const cron = require("node-cron");

//_____crete group as per the admin_______

const createGroupByAdmin = async function (tableId) {
  if (tableId != undefined) {
    let table = await tournamentModel.findOne({ _id: tableId });

    if (table != undefined || table != null) {
      let players = table.players;
      let users = table.Users;

      if (users.length !== 0) {
        users = users.map((user) => {
          return {
            UserId: user.UserId,
            userName: user.userName,
            isBot: user.isBot,
          };
        });

        // Fetch dummy users from the botModel where the type is "normal"
        const dummyUsers = await botModel.find({
          botType: { $in: ["normal", "hard"] },
        });

        const groups = _.chunk(players, 5);
        let completePlayers = [...users];

        // Add one hard bot to each group
        const hardBot = dummyUsers.find((bot) => bot.botType === "hard");
        completePlayers.push(hardBot);

        // Calculate how many additional normal bots are needed to complete the group
        const remainingPlayers = 5 - (completePlayers.length % 5);
        if (remainingPlayers > 0) {
          const normalBots = dummyUsers
            .filter((bot) => bot.botType === "normal")
            .slice(0, remainingPlayers);
          completePlayers.push(...normalBots);
        }

        let completeGroups = _.chunk(completePlayers, 5);

        for (let i = 0; i < completeGroups.length; i++) {
          let createGrp = await groupModel.create({
            group: completeGroups[i],
            tableId: tableId,
          });
          let grpId = createGrp._id;
          let group = createGrp.group;
          console.log(createGrp);
          // setTimeout(function () {
          startMatch(grpId, group);
          // }, 120000);

          // runUpdateBalls(grpId);
        }
      }
    }
  }
};

//_____________________createGroup by code____________________

const createGroup = async function (tableId) {
  if (tableId != undefined) {
    let table = await tournamentModel.findOne({ _id: tableId });

    if (table != undefined || table != null) {
      let players = table.players;
      let users = table.Users;

      if (users.length !== 0) {
        users = users.map((user) => {
          return {
            UserId: user.UserId,
            userName: user.userName,
            isBot: user.isBot,
          };
        });
        const requiredBot = players % 5;
        let totalBot;
        if (requiredBot === 1) {
          totalBot = 4;
        } else if (requiredBot === 2) {
          totalBot = 3;
        } else if (requiredBot === 3) {
          totalBot = 2;
        } else if (requiredBot === 4) {
          totalBot = 1;
        } else {
          totalBot = 0;
        }
        const updateTournament = await tournamentModel.findOneAndUpdate(
          { _id: tableId },
          { $set: { totalBotInTable: totalBot, totalPlayersInTable: players } },
          { new: true }
        );
        console.log(updateTournament, "======================UpdateTournament");
        // Fetch dummy users from the botModel where the type is "normal"
        const dummyUsers = await botModel.find({
          botType: { $in: ["normal", "hard"] },
        });

        const groups = _.chunk(players, 5);
        let completePlayers = [...users];

        // Check if there's only one real player, and if so, add 1 hard bot and 3 normal bots
        if (users.length === 1) {
          const hardBot = dummyUsers.find((bot) => bot.botType === "hard");
          const normalBots = dummyUsers
            .filter((bot) => bot.botType === "normal")
            .slice(0, 3);
          completePlayers.push(hardBot, ...normalBots);
        } else {
          // If there are more real players, add normal bots as needed
          completePlayers.push(...dummyUsers.slice(0, 5 - (users.length % 5)));
        }

        let completeGroups = _.chunk(completePlayers, 5);

        for (let i = 0; i < completeGroups.length; i++) {
          let createGrp = await groupModel.create({
            group: completeGroups[i],
            tableId: tableId,
          });
          let grpId = createGrp._id;
          let group = createGrp.group;
          console.log(createGrp);
          // setTimeout(function () {
          startMatch(grpId, group);
          // }, 120000);

          // runUpdateBalls(grpId);
        }
      }
    }
  }
};

async function startMatch(grpId, group) {
  console.log("grpid>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", grpId);
  console.log("groups>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", group);
  if (grpId !== undefined) {
    const result = group.map((name) => ({
      UserId: name.UserId,
      userName: name.userName,
      isBot: name.isBot,
      run: 0,
      hit: false,
      wicket: 0,
      prize: 0,
      isRunUpdated: name.isRunUpdated,
      botType: name.botType,
    }));
    console.log("result", result);
    const matchData = await groupModel.findOneAndUpdate(
      { _id: grpId },
      {
        updatedPlayers: result,
        $set: {
          start: true,
          currentBallTime: Date.now(),
          nextBallTime: Date.now() + 1 * 7 * 1000,
        },
      },
      { new: true, setDefaultsOnInsert: true }
    );
    console.log("this is updated data >>>>>>>>>>", matchData);
    setTimeout(function () {
      runUpdateBalls(grpId);
    }, 7000);
  }
}

let fullDayProfit = 0;
let fullMonthProfit = 0;
let fullYearProfit = 0;
let fullDayLoss = 0;
let fullMonthLoss = 0;
let fullYearLoss = 0;

let lastUpdatedDate;
let lastUpdatedMonth;
let lastUpdatedYear;

async function updateBalls(grpId) {
  let min = 0;
  const minSpeed = 12;
  const maxSpeed = 18;

  if (grpId != undefined) {
    let updateWicket = await groupModel.findByIdAndUpdate({ _id: grpId });
    let ballCountForWicket = updateWicket.ball;
    let tableId = updateWicket.tableId;

    if (ballCountForWicket < 6 && !updateWicket.isMatchOver) {
      let updatedPlayers = updateWicket.updatedPlayers.map((player) => {
        if (!player.hit && player.isBot === false) {
          //___________If the player did not hit the ball, set the wicket to true
          player.wicket += 1;
          player.isRunUpdated = false;
        }
        if (player.hit && ballCountForWicket > 0) {
          //______________If the player did not hit the ball, set the wicket to true
          player.hit = false;
          player.isRunUpdated = false;
        }
        return player;
      });

      await groupModel.updateOne({ _id: grpId }, { $set: { updatedPlayers } });
    }

    if (ballCountForWicket === 0 && !updateWicket.isMatchOver) {
      let updateTable = await tournamentModel.findByIdAndUpdate(
        { _id: tableId },
        { isMatchOverForTable: true },
        { new: true }
      );
      if (!updateTable) {
        return res.status(200).send({
          status: false,
          message: "table is not updated for isMatchOverForTable to true ",
        });
      }
      let players = updateWicket.updatedPlayers.sort((a, b) => {
        if (b.run !== a.run) {
          return b.run - a.run; //__sort by runs in descending order
        } else {
          return a.wicket - b.wicket; //___sort by wickets in ascending order for players with the same runs
        }
      });
      console.log(players, "declareWinners_______________");

      //_________________winner prize as per prize amount

      const prizes = updateTable.entryFee;
      let totalEntryFee = prizes * 5;
      const prizeDecimal = new Decimal(totalEntryFee);

      players[0].prize = prizeDecimal.times(0.35).toNumber();
      players[1].prize = prizeDecimal.times(0.25).toNumber();
      players[2].prize = prizeDecimal.times(0.15).toNumber();
      players[3].prize = prizeDecimal.times(0.05).toNumber();

      let count = 0;
      let totalPlayerInGrp = 0;
      let totalBotInGrp = 0;

      for (let i = 0; i < players.length; i++) {
        if (players[i].isBot === false) {
          count++;
          totalPlayerInGrp++;
        } else {
          totalBotInGrp++;
        }
      }

      //____________________________"profit" when all 5 players came so entryFee- prize remaining profit__________

      if (count === 5) {
        // const tournamentData = await tournamentModel.findById({ _id: tableId });
        const lastDayProfit = await profitLossModel.findOne(
          { gameType: "cricket" },
          { sort: { createdAt: -1 } }
        );
        const currentDate = moment();
        const currentDateFormat = currentDate.format("DD-MM-YYYY");
        // if (tournamentData) {
        const entryFee = updateTable.entryFee;
        const prizeAmount = updateTable.prizeAmount;

        const totalEntryFee = entryFee * 5;

        profit = totalEntryFee - prizeAmount;

        if(!lastDayProfit){
          const profitData = {
            gameType: "cricket",
            groupId: [grpId],
            currentTime: currentDateFormat,
            profit: profit,
            fullDayProfit: profit,
            fullMonthProfit: lastDayProfit.fullMonthProfit,
            fullYearProfit: lastDayProfit.fullYearProfit,
          };
          const createProfit = await profitLossModel.create(profitData);
        }

        // Increment fullDayProfit with the calculated profit
        if (currentDateFormat !== lastDayProfit.currentTime) {
          const profitData = {
            gameType: "cricket",
            groupId: [grpId],
            currentTime: currentDateFormat,
            profit: profit,
            fullDayProfit: profit,
            fullMonthProfit: lastDayProfit.fullMonthProfit,
            fullYearProfit: lastDayProfit.fullYearProfit,
          };
          const createProfit = await profitLossModel.create(profitData);
        } else {
          await profitLossModel.updateOne(
            {
              gameType: "cricket",
              currentTime: currentDateFormat,
            },
            {
              $push: {
                groupId: grpId,
              },
              $inc: {
                profit: profit,
                fullDayProfit: profit,
                fullMonthProfit: profit,
                fullYearProfit: profit,
              },
            },
            { new: true }
          );
        }
        // Update groupModel
        const updatedGroup = await groupModel.findByIdAndUpdate(
          { _id: grpId },
          {
            $inc: {
              profit: profit,
              totalBotInGrp: totalBotInGrp,
              totalPlayerInGrp: totalPlayerInGrp,
            },
            $set: { updatedPlayers: players },
            isWicketUpdated: true,
            isMatchOver: true,
            ball: 0,
          },
          { new: true }
        );

        console.log("Updated Profit in Database:", updatedGroup.profit);
        let updateTableProfit = await tournamentModel.findByIdAndUpdate(
          { _id: tableId },
          {
            $inc: {
              totalProfit: profit,
            },
          },
          { new: true }
        );
        console.log(
          updateTableProfit.totalProfit,
          "================totalProfit of cricket table"
        );
        // }
      }

      //_______________________loss when not came 5 players and win the player so entry-prize calculate loss ______________________

      if (count < 5) {
        // const tournamentData = await tournamentModel.findById({ _id: tableId });
        const lastDayProfit = await profitLossModel
          .findOne({ gameType: "cricket" })
          .sort({ createdAt: -1 })
          .exec();

        const currentDate = moment();
        const currentDateFormat = currentDate.format("DD-MM-YYYY");
        // console.log("============lastDayProfit", lastDayProfit);
        // console.log(
        //   "========lastDayProfit.currentTime",
        //   lastDayProfit.currentTime
        // );
        // console.log("==============currentDateFormat", currentDateFormat);
        // console.log(
        //   "===========check the equality",
        //   currentDateFormat === lastDayProfit.currentTime
        // );
        // if (tournamentData) {
        const entryFee = updateTable.entryFee;
        let totalEntryFee = entryFee * count;
        console.log(totalEntryFee, "__________totalEntryFee");
        let winPrizeOfUser = 0;

        for (let i = 0; i < updateWicket.updatedPlayers.length; i++) {
          if (updateWicket.updatedPlayers[i].isBot === false) {
            winPrizeOfUser += updateWicket.updatedPlayers[i].prize;
            console.log(winPrizeOfUser, "_________________winPrizeOfUser");
          }
        }

        if (winPrizeOfUser > totalEntryFee) {
          loss = winPrizeOfUser - totalEntryFee;

          console.log(loss, "____________loss");

          if(!lastDayProfit){
            const profitData = {
              gameType: "cricket",
              groupId: [grpId],
              profit: 0,
              loss: loss,
              currentTime: currentDateFormat,
              fullDayProfit: profit,
              fullMonthProfit: lastDayProfit.fullMonthProfit,
              fullYearProfit: lastDayProfit.fullYearProfit,
            };
            const createProfit = await profitLossModel.create(profitData);
          }

          // Update profitLossModel
          if (currentDateFormat !== lastDayProfit.currentTime) {
            const profitData = {
              gameType: "cricket",
              groupId: [grpId],
              profit: 0,
              loss: loss,
              currentTime: currentDateFormat,
              fullDayProfit: profit,
              fullMonthProfit: lastDayProfit.fullMonthProfit,
              fullYearProfit: lastDayProfit.fullYearProfit,
            };
            const createProfit = await profitLossModel.create(profitData);
          } else {
            await profitLossModel.updateOne(
              {
                gameType: "cricket", // Assuming you want to filter by game type
              },
              {
                $push: {
                  groupId: grpId, // Assuming grpId is a single value
                },
                $inc: {
                  loss: loss,
                  fullDayLoss: fullDayLoss,
                  fullMonthLoss: fullMonthLoss,
                  fullYearLoss: fullYearLoss,
                },
              },
              // { upsert: true }
              { new: true }
            );
          }
          //_______________Update groupModel

          let updatedGroup = await groupModel.findByIdAndUpdate(
            { _id: grpId },
            {
              $inc: {
                loss: loss,
                totalBotInGrp: totalBotInGrp,
                totalPlayerInGrp: totalPlayerInGrp,
              },
              $set: { updatedPlayers: players },
              isWicketUpdated: true,
              isMatchOver: true,
              ball: 0,
            },
            { new: true }
          );

          console.log(updatedGroup, "______________updatedGroup");

          console.log("Updated loss in Database:", updatedGroup.loss);
          let updateTableLoss = await tournamentModel.findByIdAndUpdate(
            { _id: tableId },
            {
              $inc: {
                totalLoss: loss,
              },
            },
            { new: true }
          );
          console.log(
            updateTableLoss.totalLoss,
            "================totalLoss of cricket table"
          );
        } else {
          profit = totalEntryFee - winPrizeOfUser;
          console.log(profit, ":::::::::::::::::profit");
          if (currentDateFormat !== lastDayProfit.currentTime) {
            const profitData = {
              gameType: "cricket",
              groupId: [grpId],
              profit: profit,
              currentTime: currentDateFormat,
              fullDayProfit: profit,
              fullMonthProfit: lastDayProfit.fullMonthProfit,
              fullYearProfit: lastDayProfit.fullYearProfit,
            };
            const createProfit = await profitLossModel.create(profitData);
          } else {
            await profitLossModel.updateOne(
              {
                gameType: "cricket",
                currentTime: currentDateFormat,
              },
              {
                $push: {
                  groupId: grpId,
                },
                $inc: {
                  profit: profit,
                  fullDayProfit: profit,
                  fullMonthProfit: profit,
                  fullYearProfit: profit,
                },
              },
              { new: true }
            );
          }

          //_________________Update groupModel

          const updatedGroup = await groupModel.findByIdAndUpdate(
            { _id: grpId },
            {
              $inc: {
                profit: profit,
                totalBotInGrp: totalBotInGrp,
                totalPlayerInGrp: totalPlayerInGrp,
              },
              $set: { updatedPlayers: players },
              isWicketUpdated: true,
              isMatchOver: true,
              ball: 0,
            },
            { new: true }
          );

          console.log(updatedGroup, "___________update profit");

          let updateTableProfit = await tournamentModel.findByIdAndUpdate(
            { _id: tableId },
            {
              $inc: {
                totalProfit: profit,
              },
            },
            { new: true }
          );

          console.log(
            updateTableProfit.totalProfit,
            "================totalProfit of cricket table"
          );
        }
        // }
      }
      //________________________end profit loss________________

      let users = updateWicket.updatedPlayers;
      const winnerId = players[0].UserId;
      for (let player = 0; player < users.length; player++) {
        try {
          let playerId = users[player].UserId;
          let updatedPrize = users[player].prize;
          const updatedPrizeDecimal = new Decimal(updatedPrize);
          if (playerId === winnerId) {
            let updateBalance = await userModel.findOneAndUpdate(
              { UserId: winnerId, "history.tableId": tableId },
              {
                $inc: {
                  realMoney: updatedPrizeDecimal.toNumber(),
                  cricketWinAmount: updatedPrizeDecimal.toNumber(),
                  "cricketData.0.winCount": 1,
                }, // Increment winCount by 1
                $set: {
                  "history.$.result": "win",
                  "history.$.win": updatedPrizeDecimal,
                },
                $push: {
                  transactionHistory: {
                    date: new Date(),
                    amount: updatedPrizeDecimal.toNumber(),
                    type: "winnings",
                    gameType: "cricket",
                  },
                },
              },
              { new: true }
            );
          } else {
            let updateBalance = await userModel.findOneAndUpdate(
              { UserId: playerId, "history.tableId": tableId },
              {
                $inc: {
                  realMoney: updatedPrizeDecimal.toNumber(),
                  cricketWinAmount: updatedPrizeDecimal.toNumber(),
                },
                $set: {
                  "history.$.result": "lose",
                  "history.$.win": updatedPrizeDecimal,
                },
              },
              { new: true }
            );
          }
        } catch (error) {
          console.error("Error updating balance:", error);
        }
      }
    }
    let ballCount;
    if (ballCountForWicket > 0) {
      let updateBall = await groupModel.findByIdAndUpdate(
        { _id: grpId },
        {
          $inc: { ball: -1 },
          nextBallTime: Date.now() + 1 * 7 * 1000,
          currentBallTime: Date.now(),
          ballSpeed:
            Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed,
          isUpdate: false,
        },
        { new: true }
      );

      ballCount = updateBall.ball;

      console.log(ballCount, "ballCount================");
      console.log(updateBall.nextBallTime, "nextBallTime================");
      console.log(
        updateBall.nextBallTime - updateBall.currentBallTime,
        "++++++++++++++++++"
      );

      const updateRunForBot = updateBall.updatedPlayers.map((botPlayers) => {
        if (botPlayers.isBot === true) {
          // Determine if the bot player should be out
          if (
            botPlayers.botType !== "hard" &&
            botPlayers.run > 1 &&
            Math.random() > 0.5
          ) {
            botPlayers.wicket += 1;
          } else {
            if (botPlayers.botType === "easy") {
              const easyRuns = [1, 2];
              const randomValueEasy =
                easyRuns[Math.floor(Math.random() * easyRuns.length)];
              botPlayers.run += randomValueEasy;
            } else if (botPlayers.botType === "hard") {
              const hardRuns = [4, 6];
              const randomValuehard =
                hardRuns[Math.floor(Math.random() * hardRuns.length)];
              botPlayers.run += randomValuehard;
            } else {
              const possibleValues = [1, 2, 3, 4, 6];
              const randomIndex = Math.floor(
                Math.random() * possibleValues.length
              );
              const randomValue = possibleValues[randomIndex];
              botPlayers.run += randomValue;
            }
          }
        }
        return botPlayers;
      });

      let runUpdatedForBot = await groupModel
        .findByIdAndUpdate(
          { _id: grpId },
          { $set: { updatedPlayers: updateRunForBot } },
          { new: true }
        )
        .exec();

      // Access updated data and count runs, assuming 'updatedPlayers' is an array
      const updatedPlayers = runUpdatedForBot.updatedPlayers;
      // Perform any calculations or operations on 'updatedPlayers' here
      console.log(updatedPlayers, "::::::::::::::::::::::::::::updatedPlayers");

      console.log(runUpdatedForBot, "runUpdatedForBot:::::::::::::::::::");
    }

    if (ballCountForWicket <= min - 1) {
      console.log("Reached minimum ball count!");
      return true;
    }
  }
  return false;
}

// function runUpdateBalls(grpId) {
//   console.log("call the runUpdateBalls function >>>>>>>>>>>", grpId);

//   if (grpId !== undefined) {
//     let continueRunning = true;
//     let executionCount = 0;

//     // Define the cron expression to run every 7 seconds
//     const cronExpression = "*/7 * * * * *";

//     // Schedule the updateBallsRecursive function using cron
//     const cronJob = cron.schedule(cronExpression, async () => {
//       if (continueRunning) {
//         const isMaxCountReached = await updateBalls(grpId);
//         if (!isMaxCountReached && executionCount < 8) {
//           executionCount++;
//           cronJob.start();
//         } else {
//           cronJob.stop();
//           console.log("Cron job stopped. 1");
//         }
//       } else {
//         cronJob.stop();
//         console.log("Cron job stopped.2");
//       }
//     });
//     cronJob.start();
//   }
// }
//_________________________________________update run___________________

function runUpdateBalls(grpId) {
  console.log("call the runUpdateBalls function >>>>>>>>>>>", grpId);
  if (grpId != undefined) {
    let continueRunning = true;
    let executionCount = 0;

    async function updateBallsRecursive() {
      if (continueRunning) {
        const isMaxCountReached = await updateBalls(grpId);
        if (!isMaxCountReached && executionCount < 8) {
          executionCount++;
          setTimeout(async () => {
            //________________update nextBallTime, currentBallTime and  ballSpeed in every 7 seconds
            updateBallsRecursive();
          }, 7000); //7sec
        }
      }
    }
    updateBallsRecursive();
  }
}

//________________________________________________for snakeLadder________________________________________________

const createGroupForSnakeLadder = async function (tableId) {
  if (tableId != undefined) {
    let table = await snkTournamentModel.findOne({ _id: tableId });

    if (table != undefined || table != null) {
      let players = table.players;
      let users = table.Users;

      if (users.length !== 0) {
        users = users.map((user) => {
          return {
            UserId: user.UserId,
            userName: user.userName,
            isBot: user.isBot,
          };
        });
        const requiredBot = players % 2;
        let totalBot;
        if (requiredBot === 1) {
          totalBot = 1;
        }else {
          totalBot = 0;
        }
        const updateTournament = await tournamentModel.findOneAndUpdate(
          { _id: tableId },
          { $set: { totalBotInTable: totalBot, totalPlayersInTable: players } },
          { new: true }
        );
        //________________________________import dummyusers and add as per need to complete groups

        let dummyUsers = fakeUsers.fakeUsers;
        dummyUsers = dummyUsers.map((user) => {
          return {
            UserId: user.UserId,
            userName: user.userName,
            isBot: user.isBot,
          };
        });
        const groups = _.chunk(players, 2);

        let completePlayers = [
          ...users,
          ...dummyUsers.slice(0, 2 - (users.length % 2)),
        ];

        let completeGroups = _.chunk(completePlayers, 2);

        for (let i = 0; i < completeGroups.length; i++) {
          let createGrp = await groupModelForSnakeLadder.create({
            group: completeGroups[i],
            tableId: tableId,
          });
          let grpId = createGrp._id;
          let group = createGrp.group;
          console.log(createGrp);
          // setTimeout(function () {
          startMatchForSnkLdr(grpId, group);
          //  }, 5000);
        }
      }
    }
  }
};

async function startMatchForSnkLdr(grpId, group) {
  console.log("grpid>>>>>>>>>>>", grpId);
  console.log("groups>>>>>>>>>>>>>>>>>", group);

  if (grpId !== undefined) {
    const result = group.map((name) => ({
      UserId: name.UserId,
      userName: name.userName,
      isBot: name.isBot,
      points: 0,
      turn: name.turn,
      dicePoints: 0,
      currentPoints: 0,
      movement: "",
    }));
    console.log("result", result);

    const matchData = await groupModelForSnakeLadder.findOneAndUpdate(
      { _id: grpId },
      {
        updatedPlayers: result,
        $set: { start: true, gameEndTime: Date.now() + 2 * 60 * 1000 },
      },
      { new: true, setDefaultsOnInsert: true }
    );

    console.log(
      new Date().getSeconds(),
      "----before 6 sec of starting the game---",
      matchData.isGameStart
    );

    await new Promise((resolve) => {
      setTimeout(async function () {
        let updatedPlayers = matchData.updatedPlayers;
        let currentPlayerIndex = Math.floor(
          Math.random() * updatedPlayers.length
        );
        matchData.updatedPlayers[currentPlayerIndex].turn = true;
        matchData.lastHitTime = new Date();
        matchData.isGameStart = 1;
        matchData.currentUserId = updatedPlayers[currentPlayerIndex].UserId;

        const updatedGroupFst = await matchData.save();
        console.log(
          new Date().getSeconds(),
          "--after 6 sec of starting the game--",
          updatedGroupFst.isGameStart
        );
        resolve(); // Resolve the promise to continue with the rest of the code
        overTheGame(grpId);
      }, 6000);
    });
  }
}

//________________________________till not used code _____________________________

async function checkTurn(groupId) {
  if (groupId != undefined) {
    try {
      let snakeLadder = await groupModelForSnakeLadder.findById({
        _id: groupId,
      });
      let tableId = snakeLadder.tableId;
      let createdTime = snakeLadder.createdTime;
      const updatedPlayers = snakeLadder.updatedPlayers;
      let timeDiff = snakeLadder.gameEndTime - new Date();
      let nxtPlayer = updatedPlayers.find((players) => players.turn === true);
      let crntPlayer = updatedPlayers.find((players) => players.turn === true);
      let reachTheDestination = snakeLadder.updatedPlayers.find(
        (players) => players.points === 99
      );
      if (timeDiff <= 0 || reachTheDestination) {
        let overTheGame = await snkTournamentModel.findByIdAndUpdate(
          { _id: tableId },
          { isGameOverForTable: true },
          { new: true }
        );
        let entryFee = overTheGame.entryFee;
        //----------- Find the player with the highest points (the potential winner)
        let potentialWinner = updatedPlayers.reduce(
          (prevPlayer, currentPlayer) => {
            return prevPlayer.points > currentPlayer.points
              ? prevPlayer
              : currentPlayer;
          }
        );
        // Check if there is a tie (both players have equal points)
        let isTie = updatedPlayers.every(
          (player) => player.points === potentialWinner.points
        );

        if (isTie) {
          // Both players are winners with a prize of 0.5
          const prizeDecimal = new Decimal(entryFee).times(0.5);
          for (const player of updatedPlayers) {
            player.prize = prizeDecimal.toNumber();
            player.turn = false;
            player.dicePoints = 0;
            if (!player.isBot) {
              await userModel.findOneAndUpdate(
                { UserId: player.UserId, "history.tableId": tableId },
                {
                  $inc: {
                    realMoney: player.prize,
                    snkLadderWinAmount: player.prize,
                  },
                  $set: {
                    "history.$.result": "lose",
                    "history.$.win": player.prize,
                  },
                  $push: {
                    transactionHistory: {
                      date: new Date(),
                      amount: player.prize,
                      type: "winnings",
                      gameType: "snakeLadder",
                    },
                  },
                },
                { new: true }
              );
            }
          }
        } else {
          // Calculate the prize for the potential winner and the runner-up
          // potentialWinner.prize = entryFee * 1.5;
          const potentialWinnerPrizeDecimal = new Decimal(entryFee).times(1.5);
          potentialWinner.prize = potentialWinnerPrizeDecimal.toNumber();
          let runner = updatedPlayers.find(
            (player) => player.UserId !== potentialWinner.UserId
          );
          runner.prize = entryFee * 0;

          // Set the turn and dicePoints to 0 for both players
          potentialWinner.turn = false;
          potentialWinner.dicePoints = 0;
          runner.turn = false;
          runner.dicePoints = 0;
          //___________________________________update the winner's realMoney_______________

          await userModel.findOneAndUpdate(
            { UserId: potentialWinner.UserId, "history.tableId": tableId },
            {
              $inc: {
                realMoney: potentialWinnerPrizeDecimal.toNumber(),
                snkLadderWinAmount: potentialWinnerPrizeDecimal.toNumber(),
                "snkLadderData.0.winCount": 1,
              }, // Increment playCount by 1,
              $set: {
                "history.$.result": "win",
                "history.$.win": potentialWinnerPrizeDecimal.toNumber(),
              },
              $push: {
                transactionHistory: {
                  date: new Date(),
                  amount: potentialWinnerPrizeDecimal.toNumber(),
                  type: "winnings",
                  gameType: "snakeLadder",
                },
              },
            },
            { new: true }
          );

          //_______________________________________update the runner's data ______________

          await userModel.findOneAndUpdate(
            { UserId: runner.UserId, "history.tableId": tableId },
            {
              $set: { "history.$.result": "lose" },
            },
            { new: true }
          );
        }

        // Update the players array with the updated winner(s) and runner-up
        let playersUpdate = updatedPlayers;

        let overGame = await groupModelForSnakeLadder.findOneAndUpdate(
          {
            _id: groupId,
            "updatedPlayers.UserId": {
              $in: updatedPlayers.map((player) => player.UserId),
            },
          },
          {
            $set: {
              updatedPlayers: playersUpdate,
              isGameOver: true,
              isGameStart: 2,
            },
          },
          { new: true }
        );
        if (!overGame) {
          console.log({ status: false, error: "Game not found" });
        }
        if (overGame.isGameOver === true) {
          console.log("Reached minimum ball count!");
          return true;
        }
      }

      let botPlayer = updatedPlayers.find(
        (player) => player.isBot && player.turn
      );
      if (botPlayer) {
        let botPlayerId = botPlayer.UserId;
        const currentUserIndex = updatedPlayers.findIndex(
          (player) => player.UserId === botPlayerId
        );
        const nextUserIndex = (currentUserIndex + 1) % updatedPlayers.length;
        const nextUserId = updatedPlayers[nextUserIndex].UserId;
        const possibleValues = [1, 2, 3, 4, 5, 6];

        const randomIndex = Math.floor(Math.random() * possibleValues.length);
        const randomValue = possibleValues[randomIndex];

        // Calculate current position
        let currentPosition = botPlayer.points + randomValue;

        // Check for snakes, ladders, and tunnels
        const snakeLadderAndTunnel = {
          2: 21, //--------------ladder .
          8: 29, //--------------ladder.
          14: 7, //--------------snake
          19: 38, //--------------ladder.
          25: 46, //--------------ladder.
          36: 3, //--------------snake
          41: 83, //--------------ladder.
          48: 12, //--------------snake
          49: 71, //--------------ladder.
          58: 22, //--------------snake
          72: 47, //--------------snake
          74: 93, //--------------ladder.
          95: 13, //--------------snake
          97: 78, //--------------snake
        };

        if (currentPosition > 99) {
          currentPosition = snakeLadder.updatedPlayers[currentUserIndex].points;
        }

        if (currentPosition in snakeLadderAndTunnel) {
          // Update position based on snakes, ladders, and tunnels
          snakeLadder.updatedPlayers[currentUserIndex].points =
            snakeLadderAndTunnel[currentPosition];
          snakeLadder.updatedPlayers[currentUserIndex].movement =
            currentPosition === 2 ||
            currentPosition === 8 ||
            currentPosition === 19 ||
            currentPosition === 25 ||
            currentPosition === 41 ||
            currentPosition === 49 ||
            currentPosition === 74
              ? "Ladder"
              : "Snake"; // Use currentPosition here
        } else {
          snakeLadder.updatedPlayers[currentUserIndex].points = currentPosition; // Use currentPosition here
          snakeLadder.updatedPlayers[currentUserIndex].movement = "";
        }

        snakeLadder.updatedPlayers[currentUserIndex].dicePoints = randomValue;
        snakeLadder.updatedPlayers[nextUserIndex].dicePoints = 0;
        snakeLadder.updatedPlayers[currentUserIndex].currentPoints =
          currentPosition;
        snakeLadder.updatedPlayers[currentUserIndex].turn = false;

        // snakeLadder.currentUserId = nextUserId;
        // snakeLadder.updatedPlayers[nextUserIndex].turn = true;
        // snakeLadder.lastHitTime = new Date();
        console.log(
          snakeLadder.nextTurnTime.getSeconds(),
          "sec before db call============="
        );

        snakeLadder.nextTurnTime = new Date(Date.now() + 11 * 1000);
        snakeLadder.currentUserId = nextUserId;
        snakeLadder.updatedPlayers[nextUserIndex].turn = true;
        snakeLadder.lastHitTime = new Date();
        console.log(
          "after setTimeout in put >>>>>",
          new Date().getSeconds(),
          "++++++++++++",
          snakeLadder
        );

        let updatedData = await groupModelForSnakeLadder.findOneAndUpdate(
          { _id: groupId },
          {
            $set: snakeLadder,
          },
          { new: true }
        );
        console.log(
          updatedData.nextTurnTime.getSeconds(),
          "sec after db call========"
        );

        // const nextTurnHandler = () => {
        // snakeLadder.save();
        // };
        // setTimeout(nextTurnHandler, 3000);
      }

      //_____________________________________________passing turn______________________________________

      const timeSinceLastHit =
        Math.abs(snakeLadder.lastHitTime.getTime() - new Date().getTime()) /
        1000;
      if (timeSinceLastHit >= 8) {
        //____________________________________________Switch turn to next user

        const currentUserIndex = updatedPlayers.findIndex(
          (player) => player.UserId === snakeLadder.currentUserId
        );

        const nextUserIndex = (currentUserIndex + 1) % updatedPlayers.length;
        const nextUserId = updatedPlayers[nextUserIndex].UserId;
        snakeLadder.currentUserId = nextUserId;
        //  snakeLadder.lastHitTime = new Date();
        snakeLadder.updatedPlayers[currentUserIndex].dicePoints = 0;
        snakeLadder.updatedPlayers[nextUserIndex].dicePoints = 0;
        snakeLadder.updatedPlayers[nextUserIndex].turn = true;
        snakeLadder.updatedPlayers[currentUserIndex].turn = false;
        snakeLadder.nextTurnTime = new Date(Date.now() + 11 * 1000);
        snakeLadder.lastHitTime = new Date();

        //___________________________________Save updated snakeLadder to database

        let updateTurn = await groupModelForSnakeLadder.findByIdAndUpdate(
          { _id: groupId },
          { $set: snakeLadder },
          { new: true }
        );
      }
    } catch (error) {
      console.log("Error in checkTurn function:", error);
    }
  }
  return false;
}

async function overTheGame(groupId) {
  let count = 0;
  if (groupId != undefined) {
    try {
      let continueRunning = true;
      async function updateMatchRecursive() {
        if (continueRunning) {
          const isMaxCountReached = await checkTurn(groupId);
          if (!isMaxCountReached) {
            setTimeout(async () => {
              updateMatchRecursive();
            }, 2000); // 2 seconds
          }
        }
      }
      updateMatchRecursive();
    } catch (error) {
      console.error("Error in overTheGame:", error);
    }
  }
}

//_______________________________for TicTacToe_____________________________________________

const createGroupForticTacToe = async function (tableId) {
  if (tableId != undefined) {
    let table = await ticTacToeTournamentModel.findOne({ _id: tableId });

    if (table != undefined || table != null) {
      let players = table.players;
      let users = table.Users;

      if (users.length !== 0) {
        users = users.map((user) => {
          return {
            UserId: user.UserId,
            userName: user.userName,
            isBot: user.isBot,
          };
        });
        //________________________________import dummyusers and add as per need to complete groups

        let dummyUsers = fakeUsers.fakeUsers;
        dummyUsers = dummyUsers.map((user) => {
          return {
            UserId: user.UserId,
            userName: user.userName,
            isBot: user.isBot,
          };
        });
        const groups = _.chunk(players, 2);

        let completePlayers = [
          ...users,
          ...dummyUsers.slice(0, 2 - (users.length % 2)),
        ];

        let completeGroups = _.chunk(completePlayers, 2);

        for (let i = 0; i < completeGroups.length; i++) {
          let createGrp = await ticTacToeGroupModel.create({
            group: completeGroups[i],
            tableId: tableId,
          });
          let grpId = createGrp._id;
          let group = createGrp.group;
          console.log(createGrp);
          // setTimeout(function () {
          startMatchForticTacToe(grpId, group);
          //  }, 5000);
        }
      }
    }
  }
};

async function startMatchForticTacToe(grpId, group) {
  console.log("grpid>>>>>>>>>>>", grpId);
  console.log("groups>>>>>>>>>>>>>>>>>", group);
  if (grpId !== undefined) {
    const result = group.map((name) => ({
      UserId: name.UserId,
      userName: name.userName,
      isBot: name.isBot,
      positions: [],
      turn: name.turn,
      movement: "",
    }));
    console.log("result", result);
    let matchData = await ticTacToeGroupModel.findOneAndUpdate(
      { _id: grpId },
      {
        updatedPlayers: result,
        $set: { start: true, gameEndTime: Date.now() + 3 * 60 * 1000 },
      },
      { new: true, setDefaultsOnInsert: true }
    );

    await new Promise((resolve) => {
      setTimeout(async function () {
        let updatedPlayers = matchData.updatedPlayers;
        let currentPlayerIndex = Math.floor(
          Math.random() * updatedPlayers.length
        );
        matchData.updatedPlayers[currentPlayerIndex].turn = true;
        matchData.lastHitTime = new Date();
        matchData.isGameStart = 1;
        matchData.currentUserId = updatedPlayers[currentPlayerIndex].UserId;

        const updatedGroupFst = await matchData.save();

        resolve();
      }, 6000);
    });

    // Rest of your code here...
  }
}

module.exports = {
  startMatch,
  runUpdateBalls,
  createGroup,
  createGroupForSnakeLadder,
  createGroupForticTacToe,
  createGroupByAdmin,
};
