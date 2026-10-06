const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, required: true, unique: true, trim: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patientCustomId: { type: String, default: "" },
  patientName: { type: String, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  doctorName: { type: String, required: true },
  doctorSpecialty: { type: String, default: "" },
  hospital: { type: String, default: "Arogya Multi-Specialty Hospital" },
  date: { type: String, required: true },
  medicines: [
    {
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      duration: { type: String, required: true },
      instructions: { type: String, default: "Take after meals" },
    },
  ],
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
