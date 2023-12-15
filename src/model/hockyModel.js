const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const HockySchema = new mongoose.Schema(
  {
    UserId: {
      type: String,
    },
    hocMatch: {
      type: Number,
      default: 0,
      trim: true,
    },
    hocRuns: {
      type: Number,
      default: 0,
      trim: true,
    },
    hocWins: {
      type: Number,
      default: 0,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("hocky", HockySchema);
