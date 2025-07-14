const mongoose = require("mongoose");

const RecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, required: true },              // 측정한 날짜
  values: [{               // 눈 개폐도
    type: Number,
    required: true
  }],
  blinkCount: {                   
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Record", RecordSchema);