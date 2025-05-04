import mongoose from "mongoose"

const MessageSchema = new mongoose.Schema({
  username: String,
  text: String,
  room: String,
  time: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
