const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dependentId: { type: String, default: "" },
  patientName: { type: String, default: "" },
  fileUrl: { type: String, required: true },
  fileType: { type: String, default: "" }, // e.g. "pdf", "image"
  uploadedAt: { type: Date, default: Date.now },
  notes: { type: String, default: "" },
});

module.exports = mongoose.model("HealthRecord", healthRecordSchema);
