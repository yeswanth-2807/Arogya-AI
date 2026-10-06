const mongoose = require("mongoose");

const symptomCheckSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dependentId: { type: String, default: "" },
  patientName: { type: String, default: "" },
  symptoms: [{ type: String }],
  duration: { type: String, default: "" },
  severity: { type: String, default: "moderate" },
  results: [
    {
      disease: String,
      confidence: Number,
      severity: String,
      recommendation: String,
      specialty: String,
    },
  ],
  checkedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SymptomCheck", symptomCheckSchema);
