const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const snakeSchema = new mongoose.Schema(
  {
    UserId: {
      type: String,
    },
    snakeMatch: {
      type: Number,
      default: 0,
      trim: true,
    },
    snakeWins: {
      type: Number,
      default: 0,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("snakeLadder", snakeSchema);
