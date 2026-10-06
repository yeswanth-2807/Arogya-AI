const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: true,
    index: true,
  },
  sender: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("Message", messageSchema);
