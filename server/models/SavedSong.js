// models/SavedSong.js
const mongoose = require("mongoose");

const SavedSongSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },    // "YYYY-MM-DD"
  song: {
    videoId:     { type: String, required: true },
    title:        String,
    channelTitle: String,
    thumbnail:    String,
    artist:       String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SavedSong", SavedSongSchema);