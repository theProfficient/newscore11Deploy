const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const ticTacSchema = new mongoose.Schema(
  {
    UserId: {
      type: String,
    },
    ticMatch: {
      type: Number,
      default: 0,
      trim: true,
    },
    ticWins: {
      type: Number,
      default: 0,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ticTacToe", ticTacSchema);
