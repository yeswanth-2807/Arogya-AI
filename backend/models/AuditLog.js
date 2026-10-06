const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, default: null }, // Admin or System
  role: { type: String, default: "SYSTEM" },
  action: { type: String, required: true }, // e.g., APPOINTMENT_CANCELLED, REFUND_CREATED
  resource: { type: String, required: true }, // e.g., Appointment, User, Payment
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  previousValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
