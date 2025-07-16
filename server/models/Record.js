const mongoose = require("mongoose");

const RecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, required: true },              // 측정한 날짜
  values: [{               // 눈 개폐도
    type: Number,
    required: true
  }],
  blinkCounts: [{                   
    type: Number,
    required: true
  }],
  blinkTimestamps: [{
    type: Date,
    required: true
  }]
});

module.exports = mongoose.model("Record", RecordSchema);