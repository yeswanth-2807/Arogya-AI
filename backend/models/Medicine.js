const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  genericName: { type: String, default: "" },
  category: { type: String, default: "" },
});

module.exports = mongoose.model("Medicine", medicineSchema);
