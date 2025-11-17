const mongoose = require("mongoose");

const smsSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: false,
  },
  expires: {
    type: Date,
    default: Date.now,
    // 'expires' is a special Mongoose index that automatically
    // deletes the document after the specified time (200s).
    expires: "200s",
  },
});

module.exports = mongoose.model("Sms", smsSchema);
