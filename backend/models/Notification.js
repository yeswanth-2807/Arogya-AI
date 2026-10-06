const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can be Patient or Doctor
  userType: { type: String, enum: ["User", "Doctor", "Admin"], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  type: { type: String, default: "SYSTEM" }, // REMINDER, REFUND, ALERT
  relatedId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }, // Optional link
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
