const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const NotificationService = require("../services/NotificationService");

const multer = require("multer");
const path = require("path");

function generateAppointmentId() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `APT-${randomNum}`;
}

// Setup multer for medical document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// POST /api/appointments/upload - Upload medical documents
router.post("/upload", upload.array("documents", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ urls: fileUrls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/appointments - Book Appointment
router.post("/", async (req, res, next) => {
  try {
    const { patientId, dependentId, doctorId, date, time, reason, consultationType, medicalDocuments } = req.body;

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ error: "patientId, doctorId, date, and time are required." });
    }

    let patient = await User.findById(patientId);
    if (!patient) patient = await Doctor.findById(patientId);
    if (!patient) {
      const Admin = require("../models/Admin");
      patient = await Admin.findById(patientId);
    }
    if (!patient) return res.status(404).json({ error: "Patient/User not found" });

    let finalPatientName = patient.name || "Admin";
    let finalPatientCustomId = patient.patientId || patient.doctorId || "ADMIN";

    if (dependentId && patient.dependents) {
      const dep = patient.dependents.find(d => d.id === dependentId);
      if (dep) {
        finalPatientName = `${dep.name} (${dep.relation})`;
        finalPatientCustomId = dep.id;
      }
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    // CONCURRENCY PROTECTION: Check if slot is already booked
    const existingApt = await Appointment.findOne({
      doctorId: doctor._id,
      date,
      time,
      status: { $in: ["BOOKED", "CONFIRMED", "IN_PROGRESS"] }
    });

    if (existingApt) {
      return res.status(409).json({ error: "This slot has already been booked by another patient." });
    }

    let appointmentId = generateAppointmentId();

    const appointment = new Appointment({
      appointmentId,
      patientId: patient._id,
      doctorId: doctor._id,
      patientName: finalPatientName,
      doctorName: doctor.name,
      patientCustomId: finalPatientCustomId,
      date,
      time,
      reason: reason || "General Telemedicine Consultation",
      consultationType: consultationType || "Video Consultation",
      medicalDocuments: medicalDocuments || [],
      status: "BOOKED",
      paymentStatus: "PAID",
      roomStatus: "waiting",
    });

    await appointment.save();

    // Trigger Notifications
    await NotificationService.send({
      userId: patient._id,
      userType: "User",
      title: "Appointment Booked",
      message: `Your appointment with Dr. ${doctor.name} on ${date} at ${time} is confirmed.`,
      type: "SYSTEM",
      relatedId: appointment._id
    });

    await NotificationService.send({
      userId: doctor._id,
      userType: "Doctor",
      title: "New Appointment",
      message: `${patient.name} has booked a consultation on ${date} at ${time}.`,
      type: "SYSTEM",
      relatedId: appointment._id
    });

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/patient/:patientId - Fetch Patient Appointments
router.get("/patient/:patientId", async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.params.patientId })
      .populate("doctorId", "name specialty qualification hospital photoUrl fee")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/doctor/:doctorId - Fetch Doctor Appointments
router.get("/doctor/:doctorId", async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId })
      .populate("patientId", "name phone email patientId age gender")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/:id - Single Appointment
router.get("/:id", async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "name phone email patientId age gender")
      .populate("doctorId", "name specialty hospital qualification fee");

    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

// PUT /api/appointments/:id/cancel - Cancel with Refund Rule Check
router.put("/:id/cancel", async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    // Populate missing legacy fields if document was created prior to schema update
    if (!appointment.appointmentId) {
      appointment.appointmentId = generateAppointmentId();
    }

    // 24 Hour Cancellation check
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time.split(" ")[0] || "10:00"}`);
    const now = new Date();
    const hoursDifference = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 3600);

    let refundStatus = "none";
    let refundPolicyNote = "";

    if (hoursDifference >= 24) {
      refundStatus = "initiated";
      refundPolicyNote = "Cancelled >24 hours prior. Full 100% refund initiated.";
    } else {
      refundStatus = "processing";
      refundPolicyNote = "Cancelled <24 hours prior. 80% partial refund processing according to cancellation policy.";
    }

    appointment.status = req.body.cancelledBy === "doctor" ? "CANCELLED_BY_DOCTOR" : "CANCELLED_BY_PATIENT";
    appointment.refundStatus = refundStatus;
    await appointment.save();

    res.json({
      message: "Appointment cancelled successfully.",
      appointment,
      refundPolicyNote,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/appointments/:id/status - Update Room / Consultation Status
router.put("/:id/status", async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    if (!appointment.appointmentId) {
      appointment.appointmentId = generateAppointmentId();
    }

    if (req.body.status) appointment.status = req.body.status;
    if (req.body.paymentStatus) appointment.paymentStatus = req.body.paymentStatus;
    if (req.body.roomStatus) appointment.roomStatus = req.body.roomStatus;
    if (req.body.roomUrl) appointment.roomUrl = req.body.roomUrl;
    if (req.body.patientJoined) appointment.patientJoinedAt = new Date();
    if (req.body.doctorJoined) appointment.doctorJoinedAt = new Date();

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments/:id/reschedule
router.post("/:id/reschedule", async (req, res, next) => {
  try {
    const { newDate, newTime } = req.body;
    const oldApt = await Appointment.findById(req.params.id);
    if (!oldApt) return res.status(404).json({ error: "Appointment not found" });

    // Validate state
    if (!["BOOKED", "CONFIRMED", "MISSED_BY_DOCTOR"].includes(oldApt.status)) {
      if (oldApt.status === "MISSED_BY_PATIENT") {
        return res.status(400).json({ error: "Cannot reschedule for free. You missed the appointment. Please book a new consultation." });
      }
      return res.status(400).json({ error: `Cannot reschedule from state: ${oldApt.status}` });
    }

    // Create new linked appointment
    const newApt = new Appointment({
      appointmentId: generateAppointmentId(),
      patientId: oldApt.patientId,
      doctorId: oldApt.doctorId,
      patientName: oldApt.patientName,
      doctorName: oldApt.doctorName,
      patientCustomId: oldApt.patientCustomId,
      date: newDate,
      time: newTime,
      reason: oldApt.reason,
      status: "BOOKED",
      paymentStatus: "PAID",
    });

    await newApt.save();

    // Mark old as RESCHEDULED
    oldApt.status = "RESCHEDULED";
    oldApt.rescheduledAppointmentId = newApt._id;
    await oldApt.save();

    res.json({ message: "Rescheduled successfully", newAppointment: newApt });
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments/:id/cancel
router.post("/:id/cancel", async (req, res, next) => {
  try {
    const { reason, initiator } = req.body; // initiator = "PATIENT" | "DOCTOR"
    const apt = await Appointment.findById(req.params.id);
    if (!apt) return res.status(404).json({ error: "Appointment not found" });

    if (!["BOOKED", "CONFIRMED", "MISSED_BY_DOCTOR"].includes(apt.status)) {
      return res.status(400).json({ error: `Cannot cancel from state: ${apt.status}` });
    }

    const wasMissedByDoctor = apt.status === "MISSED_BY_DOCTOR";
    apt.status = initiator === "DOCTOR" ? "CANCELLED_BY_DOCTOR" : "CANCELLED_BY_PATIENT";
    apt.cancellationReason = reason || "No reason provided";
    
    // We will trigger refund asynchronously using the RefundService
    const RefundService = require("../services/RefundService");
    
    try {
      if (wasMissedByDoctor) {
        await RefundService.requestRefund(apt._id, "DOCTOR_NO_SHOW");
      } else {
        await RefundService.requestRefund(apt._id, "PATIENT_CANCELLED_BEFORE_DEADLINE");
      }
    } catch (e) {
      console.error("Refund processing failed:", e.message);
    }

    await apt.save();
    res.json({ message: "Cancelled successfully", appointment: apt });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
