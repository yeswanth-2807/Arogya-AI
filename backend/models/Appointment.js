const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    default: () => `APT-${Math.floor(100000 + Math.random() * 900000)}`,
    trim: true,
  },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patientName: { type: String, default: "" },
  doctorName: { type: String, default: "" },
  patientCustomId: { type: String, default: "" },
  date: { type: String, required: true }, // e.g. "2026-07-25"
  time: { type: String, required: true }, // e.g. "10:00"
  reason: { type: String, default: "General Telemedicine Consultation" },
  consultationType: { type: String, default: "Video Consultation" },
  status: {
    type: String,
    enum: [
      "BOOKED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", 
      "MISSED_BY_PATIENT", "MISSED_BY_DOCTOR", 
      "CANCELLED_BY_PATIENT", "CANCELLED_BY_DOCTOR", 
      "RESCHEDULED", "PENDING_FOLLOW_UP"
    ],
    default: "BOOKED",
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "REFUND_PENDING", "REFUNDED", "REFUND_FAILED"],
    default: "PAID",
  },
  paymentId: { type: String, default: "" },
  refundId: { type: String, default: "" },
  refundAmount: { type: Number, default: 0 },
  cancellationReason: { type: String, default: "" },
  rescheduledAppointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
  idempotencyKey: { type: String, default: "" },
  roomStatus: {
    type: String,
    enum: ["waiting", "active", "ended"],
    default: "waiting",
  },
  roomUrl: {
    type: String,
    default: "",
  },
  medicalDocuments: [{ type: String }],
  patientJoinedAt: { type: Date, default: null },
  doctorJoinedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to automatically update the updatedAt field
appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Appointment", appointmentSchema);
