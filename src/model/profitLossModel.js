const mongoose = require("mongoose");


const profitLossSchema = new mongoose.Schema({
    gameType: {
    type: String,
    enum: ["cricket", "snakeLadder", "ticTacToe", "airHockey"],
    default: "cricket",
    },
    groupId: [
      {
        type: mongoose.Schema.Types.ObjectId, // Assuming group IDs are ObjectIds
        ref: 'Group', // Replace 'YourGroupModel' with the actual model name for groups
      },
    ],
      profit:{
        type: Number,
        default: 0,
      },
      fullDayProfit:{
        type: Number,
        default: 0,
      },
      fullMonthProfit:{
        type: Number,
        default: 0,
      },
      fullYearProfit:{
        type: Number,
        default: 0,
      },
      loss:{
        type: Number,
        default: 0,
      },
      fullDayLoss:{
        type: Number,
        default: 0,
      },
      fullMonthLoss:{
        type: Number,
        default: 0,
      },
      fullYearLoss:{
        type: Number,
        default: 0,
      },
      currentTime:{
        type:String,
        // default: new Date()
      },
      yaxis:{
        type: Array,
        default: [5000,10000,15000,20000,25000]
      },
      time:{
        type: Array,
        default: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
      }
    }
  ,{timestamps:true});

module.exports = mongoose.model('ProfitLoss', profitLossSchema);