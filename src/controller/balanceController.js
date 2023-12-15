
const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const cricketModel = require("../model/cricketModel");

const updatecredits = async function (req, res) {
  try {
    let { UserId, cricMatch, cricWins, cricRuns, type } = req.query;

    let cricketData = await cricketModel.findOne({ UserId: UserId });
    const user = await userModel.findOne({ UserId: UserId });

    if (type === "objective") {
      cricketData.types.objective = true;
      cricketData.types.chase = false;
      cricketData.types.multiplayer = false;
      user.credits += 50;
    }

    if (type === "chase") {
      cricketData.types.objective = false;
      cricketData.types.chase = true;
      cricketData.types.multiplayer = false;
      user.credits += 60;
    }

    if (type === "multiplayer") {
      cricketData.types.objective = false;
      cricketData.types.chase = false;
      cricketData.types.multiplayer = true;
      user.credits += 100;
    }

    cricketData.cricWins = cricWins;
    cricketData.cricMatch = cricMatch;
    cricketData.cricRuns = cricRuns;

    const cricketDataUpdate = await cricketModel.findOneAndUpdate(
      { UserId: UserId },
      { $set: cricketData },
      { new: true }
    );
    const userDataUpdate = await userModel.findOneAndUpdate(
      { UserId: UserId },
      { $set: user },
      { new: true }
    );

    userDataUpdate._doc.cricketData = cricketDataUpdate;

    return res.status(200).send({
      status: true,
      message: "Success",
      userDataUpdate,
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

module.exports = { updatecredits };
