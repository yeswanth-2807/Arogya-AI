const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema({
  gracePeriodMinutes: { type: Number, default: 15 },
  patientCancelDeadlineHours: { type: Number, default: 24 }, // Can cancel freely 24h before
  missedAppointmentRefundPolicy: { 
    type: String, 
    enum: ["FULL_REFUND", "PARTIAL_REFUND", "NO_REFUND"],
    default: "NO_REFUND" 
  },
  doctorNoShowRefundPolicy: {
    type: String,
    enum: ["FULL_REFUND", "PARTIAL_REFUND"],
    default: "FULL_REFUND"
  },
  partialRefundPercentage: { type: Number, default: 50 },
  rescheduleFee: { type: Number, default: 0 },
  maxReschedules: { type: Number, default: 2 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);
