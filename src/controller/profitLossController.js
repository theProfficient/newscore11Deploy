const mongoose = require("mongoose");
const profitLossModel = require("../model/profitLossModel")


const getProfitData = async function (req, res) {
  try {
    const getProfitLoss = await profitLossModel.find().select({gameType:1,profit:1,fullDayProfit:1,fullMonthProfit:1, fullYearProfit:1,loss:1,fullDayLoss:1,fullMonthLoss:1, fullYearLoss:1,groupId:1,updatedAt:1,createdAt:1,yaxis:1,xaxis:1});
    console.log(getProfitLoss,"++++++getProfitLoss");

    const groupId = getProfitLoss.map((item) => item.groupId.join(""));
    const concatenatedGroupId = groupId.join("");
    console.log(concatenatedGroupId,"______________concatenatedGroupId");

     
    if(getProfitLoss.length == 0){
    return res.status(404).send({
      status: false,
      message: "no data found",
    });
  } 
  return res.status(200).json({getProfitLoss,concatenatedGroupId});
    }
 catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
}

//____________________________________loss data______________


const getLossData = async function (req, res) {
  try {
    const getProfitLoss = await profitLossModel.find().select({gameType:1,loss:1,fullDayLoss:1,fullMonthLoss:1, fullYearLoss:1,groupId:1,updatedAt:1,createdAt:1});
    console.log(getProfitLoss,"++++++getProfitLoss");
    const groupId = getProfitLoss.map((item) => item.groupId.join(""));
    const concatenatedGroupId = groupId.join("");
    console.log(concatenatedGroupId,"______________concatenatedGroupId");

     
    if(getProfitLoss.length == 0){
    return res.status(404).send({
      status: false,
      message: "no data found",
    });
  } 
  return res.status(200).json({getProfitLoss,concatenatedGroupId});
    }
 catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }

}
module.exports = {getProfitData,getLossData};
