const mongoose = require("mongoose");

const interactionCheckSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  medicinesChecked: [{ type: String }], // medicine names as entered by the user
  resultSummary: { type: String, default: "" },
  severity: {
    type: String,
    enum: ["none", "mild", "moderate", "severe"],
    default: "none",
  },
  checkedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InteractionCheck", interactionCheckSchema);
