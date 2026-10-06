const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyAdmin, JWT_SECRET } = require("../middleware/auth");

// INITIALIZE ADMIN - One-time setup
// In production, you would run a seed script. This route checks if an admin exists, 
// and if not, creates the default admin.
router.get("/setup", async (req, res, next) => {
  try {
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(200).json({ message: "Admin account already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    await Admin.create({
      email: "admin@arogya.com",
      password: hashedPassword,
    });

    res.status(201).json({ message: "Default admin account created. Email: admin@arogya.com, Password: admin123" });
  } catch (err) {
    next(err);
  }
});

// ADMIN LOGIN
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required." });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(401).json({ error: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials." });

    const token = jwt.sign({ id: admin._id, role: admin.role, email: admin.email }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, admin: { id: admin._id, email: admin.email, role: admin.role } });
  } catch (err) {
    next(err);
  }
});

// GET DASHBOARD STATS
router.get("/stats", verifyAdmin, async (req, res, next) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    
    // Revenue logic based on successful paid appointments
    const paidAppointments = await Appointment.find({ paymentStatus: "PAID" });
    const revenue = paidAppointments.length * 500; 

    // Generate last 7 days revenue chart data
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0]; // YYYY-MM-DD
    }).reverse();

    const revenueByDay = last7Days.map(date => {
      const count = paidAppointments.filter(apt => apt.date === date).length;
      return { date, revenue: count * 500 };
    });

    // Generate appointments by specialty pie chart
    const doctors = await Doctor.find();
    const specialtyCounts = {};
    doctors.forEach(doc => {
      specialtyCounts[doc.specialty] = (specialtyCounts[doc.specialty] || 0) + 1;
    });
    
    const appointmentsBySpecialty = Object.keys(specialtyCounts).map(spec => ({
      name: spec,
      value: specialtyCounts[spec]
    }));

    res.json({
      totalDoctors,
      totalPatients,
      totalAppointments,
      revenue,
      revenueByDay,
      appointmentsBySpecialty
    });
  } catch (err) {
    next(err);
  }
});

// GET ALL DOCTORS
router.get("/doctors", verifyAdmin, async (req, res, next) => {
  try {
    const doctors = await Doctor.find().select("-password").sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    next(err);
  }
});

// DELETE DOCTOR
router.delete("/doctors/:id", verifyAdmin, async (req, res, next) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: "Doctor removed successfully." });
  } catch (err) {
    next(err);
  }
});

// UPDATE DOCTOR
router.put("/doctors/:id", verifyAdmin, async (req, res, next) => {
  try {
    const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// GET ALL PATIENTS
router.get("/patients", verifyAdmin, async (req, res, next) => {
  try {
    const patients = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    next(err);
  }
});

// UPDATE PATIENT
router.put("/patients/:id", verifyAdmin, async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE PATIENT
router.delete("/patients/:id", verifyAdmin, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient removed successfully." });
  } catch (err) {
    next(err);
  }
});

// PROCESS REFUND (Update Appointment Status)
router.get("/refunds", verifyAdmin, async (req, res, next) => {
  try {
    const appointments = await Appointment.find({
      paymentStatus: { $in: ["REFUND_PENDING", "REFUNDED", "REFUND_FAILED"] }
    }).populate("patientId", "name phone").populate("doctorId", "name").sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

router.post("/refunds/:id", verifyAdmin, async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: "refunded" }, { new: true });
    res.json({ message: "Refund processed successfully.", appointment });
  } catch (err) {
    next(err);
  }
});

// APPROVE REFUND
router.post("/refunds/:id/approve", verifyAdmin, async (req, res, next) => {
  try {
    const RefundService = require("../services/RefundService");
    const result = await RefundService.executeRefund(req.params.id);
    
    // Trigger notification
    const NotificationService = require("../services/NotificationService");
    await NotificationService.send({
      userId: result.patientId,
      userType: "User",
      title: "Refund Processed",
      message: `Your refund of ₹${result.refundAmount} for appointment ${result.appointmentId} has been successfully processed.`,
      type: "REFUND",
      relatedId: result._id
    });

    res.json({ message: "Refund executed successfully.", result });
  } catch (err) {
    next(err);
  }
});
router.get("/audit-logs", verifyAdmin, async (req, res, next) => {
  try {
    const AuditLog = require("../models/AuditLog");
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

// GET SETTINGS
router.get("/settings", verifyAdmin, async (req, res, next) => {
  try {
    const SystemSettings = require("../models/SystemSettings");
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({});
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

// UPDATE SETTINGS
router.put("/settings", verifyAdmin, async (req, res, next) => {
  try {
    const SystemSettings = require("../models/SystemSettings");
    const AuditLog = require("../models/AuditLog");
    
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({});
    
    const oldSettings = { ...settings.toObject() };
    
    settings.gracePeriodMinutes = req.body.gracePeriodMinutes ?? settings.gracePeriodMinutes;
    settings.missedAppointmentRefundPolicy = req.body.missedAppointmentRefundPolicy ?? settings.missedAppointmentRefundPolicy;
    
    await settings.save();
    
    // Log setting change
    await AuditLog.create({
      action: "SETTINGS_UPDATED",
      resource: "SystemSettings",
      resourceId: settings._id,
      previousValue: oldSettings,
      newValue: settings.toObject()
    });

    res.json({ message: "Settings updated successfully", settings });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
