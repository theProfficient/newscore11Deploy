const mongoose = require("mongoose");

const botSchema = new mongoose.Schema(
  {
    botType: {
      type: String,
      enum: ["normal", "hard", "easy"],
      required: true,
      default: "normal",
    },
    quantity:{
      type: Number,
      default: 1,
    },
    UserId: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    referralCode: {
      type: String,
    },
    credits: {
      type: Number,
      default: 10000,
    },
    isBot: {
      type: Boolean,
      default: true,
    },
    realMoney: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: false,
    },
    banned: {
      type: Boolean,
      default: false,
    },
    history: [],
    transactionHistory: [],
    refToCricket: {
      type: String,
      ref: "cricket",
    },
    refToHockey: {
      type: String,
      ref: "hocky",
    },
    refToSnakeLadder: {
      type: String,
      ref: "snakeLadder",
    },
    refToTicTacToe: {
      type: String,
      ref: "ticTacToe",
    },
    cricketData: [
      {
        _id: false,
        playCount: Number,
        winCount: Number,
      },
    ],
    cricketWinAmount: {
      type: Number,
      default: 0,
    },
    snkLadderData: [
      {
        _id: false,
        playCount: Number,
        winCount: Number,
      },
    ],
    snkLadderWinAmount: {
      type: Number,
      default: 0,
    },
    ticTacToeData: [
      {
        _id: false,
        playCount: Number,
        winCount: Number,
      },
    ],
    ticTacToeWinAmount: {
      type: Number,
      default: 0,
    },
    airHockeyData: [
      {
        _id: false,
        playCount: Number,
        winCount: Number,
      },
    ],
    airHockeyWinAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bot", botSchema);
