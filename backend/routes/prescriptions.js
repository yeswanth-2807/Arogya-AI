const express = require("express");
const router = express.Router();
const Prescription = require("../models/Prescription");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

function generatePrescriptionId() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `RX-${randomNum}`;
}

// POST /api/prescriptions - Create Digital Prescription
router.post("/", async (req, res, next) => {
  try {
    const { appointmentId, patientId, doctorId, medicines, notes } = req.body;

    if (!patientId || !doctorId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ error: "patientId, doctorId, and at least one medicine are required." });
    }

    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    let prescriptionId = generatePrescriptionId();

    const prescription = new Prescription({
      prescriptionId,
      appointmentId: appointmentId || undefined,
      patientId: patient._id,
      patientCustomId: patient.patientId,
      patientName: patient.name,
      doctorId: doctor._id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      hospital: doctor.hospital,
      date: new Date().toISOString().split("T")[0],
      medicines,
      notes: notes || "Take as prescribed.",
    });

    await prescription.save();

    // If linked to an appointment, mark appointment status completed
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: "COMPLETED" });
    }

    if (req.body.followUpDays && !isNaN(req.body.followUpDays)) {
      const days = parseInt(req.body.followUpDays);
      const d = new Date();
      d.setDate(d.getDate() + days);
      const followUpDate = d.toISOString().split("T")[0];
      
      const followUpApt = new Appointment({
        appointmentId: `APT-${Math.floor(100000 + Math.random() * 900000)}`,
        patientId: patient._id,
        doctorId: doctor._id,
        patientName: patient.name,
        doctorName: doctor.name,
        patientCustomId: patient.patientId,
        date: followUpDate,
        time: "10:30 AM", // default time slot, patient can reschedule
        reason: `Routine Follow-up (Auto-Scheduled by ${doctor.name})`,
        status: "PENDING_FOLLOW_UP",
        paymentStatus: "PENDING",
      });
      await followUpApt.save();
    }

    res.status(201).json(prescription);
  } catch (err) {
    next(err);
  }
});

// GET /api/prescriptions/patient/:patientId - Fetch Patient Prescriptions
router.get("/patient/:patientId", async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    next(err);
  }
});

// GET /api/prescriptions/doctor/:doctorId - Fetch Doctor Prescriptions
router.get("/doctor/:doctorId", async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.params.doctorId }).sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    next(err);
  }
});

// GET /api/prescriptions/:id - Single Prescription
router.get("/:id", async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ error: "Prescription not found" });
    res.json(prescription);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
