const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const cricketSchema = new mongoose.Schema(
  {
    UserId: {
      type: String,
    },
    userIdForRef: {
      type: ObjectId,
      ref: "User",
    },
    groupId: {
      type: ObjectId,
      ref: "Group",
    },
    cricMatch: {
      type: Number,
      trim: true,
      default: 0,
    },
    cricRuns: {
      type: Number,
      trim: true,
      default: 0,
    },
    cricWins: {
      type: Number,
      trim: true,
      default: 0,
    },
    balls: {
      type: Number,
      trim: true,
      default: 0,
    },
    over: {
      type: Number,
      trim: true,
      default: 1,
    },
    nextBallTime: {
      type: Date,
    },
    types: {
      objective: {
        type: Boolean,
        trim: true,
        default: false,
      },
      chase: {
        type: Boolean,
        trim: true,
        default: false,
      },
      multiplayer: {
        type: Boolean,
        trim: true,
        default: false,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("cricket", cricketSchema);
