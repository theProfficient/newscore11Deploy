const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  withdrawalRequestId: {
    type: String,
    required: true,
    unique: true,
  },
  UserId: {
    type: String,
    required: true,
  },
  withdrawalAmount: {
    type: Number,
    required: true,
  },
  withdrawalMethod:{
    type: String,
  },
  status: {
    type: String,
    default: 'pending', 
  },
  
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
