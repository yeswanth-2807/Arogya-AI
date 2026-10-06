const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  doctorId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true },
  specialty: { type: String, required: true, trim: true },
  qualification: { type: String, default: "MBBS, MD" },
  hospital: { type: String, default: "Arogya Multi-Specialty Hospital" },
  experience: { type: String, default: "5+ Years" },
  fee: { type: Number, default: 500 },
  rating: { type: Number, default: 4.8 },
  photoUrl: { type: String, default: "" },
  availableTime: { type: String, default: "10:00 AM - 05:00 PM" },
  availableSlots: [{ type: String }],
  weeklySchedule: {
    type: Map,
    of: [{ type: String }],
    default: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    }
  },
  isAvailable: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  role: { type: String, default: "doctor" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Doctor", doctorSchema);
