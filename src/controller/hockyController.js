const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const hockyModel = require("../model/hockyModel");

//_________update Table

const updateHoc = async function (req, res) {
  try {
    let updateData = req.query;
    let UserId = req.query.UserId;

    const matchData = await hockyModel.findOneAndUpdate(
      { UserId: UserId },
      updateData,
      { new: true }
    );

    if (matchData.length == 0) {
      return res.status(404).send({
        status: false,
        message: "user not found",
      });
    }

    return res.status(200).send({
      status: true,
      message: "Success",
      data: matchData,
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

//_______________GET all Data of hocky

const getAllHoc = async function (req, res) {
  try {
    let data = req.query;

    const HockyData = await hockyModel.find(data).sort({ HocWins: -1 });

    if (data.length == 0) {
      return res
        .status(404)
        .send({ status: false, message: " no data is found " });
    }

    return res.status(200).send({
      status: true,
      message: "Success",
      data: HockyData,
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

//______________
module.exports = { updateHoc, getAllHoc };
