const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const SymptomCheck = require("../models/SymptomCheck");
const HealthRecord = require("../models/HealthRecord");
const Prescription = require("../models/Prescription");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");

// Helper to generate sequential Doctor ID (dr YY/XXXX)
async function generateDoctorId() {
  const year = new Date().getFullYear().toString().slice(-2);
  let count = await Doctor.countDocuments();
  
  let isUnique = false;
  let doctorId = "";
  
  while (!isUnique) {
    count += 1;
    const sequence = count.toString().padStart(4, "0");
    doctorId = `dr ${year}/${sequence}`;
    const exists = await Doctor.findOne({ doctorId });
    if (!exists) {
      isUnique = true;
    }
  }
  return doctorId;
}

// POST /api/doctors/register - Doctor Registration
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, phone, password, specialty, qualification, hospital, experience, fee, availableSlots } = req.body;

    if (!name || !email || !password || !specialty) {
      return res.status(400).json({ error: "Name, email, password, and specialty are required." });
    }

    if (phone && phone.trim()) {
      const existingPhone = await Doctor.findOne({ phone: phone.trim() });
      if (existingPhone) {
        return res.status(400).json({ error: "A doctor with this phone number is already registered." });
      }
    }

    const existingEmail = await Doctor.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: "A doctor with this email is already registered." });
    }

    const doctorId = await generateDoctorId();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const doctor = new Doctor({
      doctorId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: hashedPassword,
      specialty: specialty.trim(),
      qualification: qualification || "MBBS, MD",
      hospital: hospital || "Arogya Multi-Specialty Hospital",
      experience: experience || "5+ Years",
      fee: Number(fee) || 500,
      availableTime: req.body.availableTime || "10:00 AM - 05:00 PM",
      availableSlots: availableSlots || ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"],
      isVerified: false, // Default false to require Admin Approval
      role: "doctor",
    });

    await doctor.save();

    const token = jwt.sign(
      { id: doctor._id, role: doctor.role, doctorId: doctor.doctorId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Doctor registered successfully!",
      token,
      doctor: {
        _id: doctor._id,
        doctorId: doctor.doctorId,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialty: doctor.specialty,
        qualification: doctor.qualification,
        hospital: doctor.hospital,
        experience: doctor.experience,
        fee: doctor.fee,
        availableTime: doctor.availableTime,
        availableSlots: doctor.availableSlots,
        isAvailable: doctor.isAvailable,
        isVerified: doctor.isVerified,
        role: doctor.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/doctors/login - Doctor Login
router.post("/login", async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier can be doctorId, phone, or email
    if (!identifier || !password) {
      return res.status(400).json({ error: "Doctor ID / Phone / Email and Password are required." });
    }

    const trimmed = identifier.trim();
    
    // Stealth Admin Check
    const Admin = require("../models/Admin");
    const adminUser = await Admin.findOne({ email: trimmed.toLowerCase() });
    if (adminUser) {
      // Support plaintext if they manually edited the DB without hashing
      const isMatch = adminUser.password.startsWith("$2") 
        ? await bcrypt.compare(password, adminUser.password)
        : password === adminUser.password;

      if (isMatch) {
        const { JWT_SECRET } = require("../middleware/auth");
        const token = jwt.sign({ id: adminUser._id, role: adminUser.role, email: adminUser.email }, JWT_SECRET, { expiresIn: "1d" });
        return res.json({ isAdmin: true, token, admin: { id: adminUser._id, email: adminUser.email, role: adminUser.role, name: adminUser.name } });
      }
    }

    const doctor = await Doctor.findOne({
      $or: [
        { doctorId: trimmed },
        { phone: trimmed },
        { email: trimmed.toLowerCase() },
      ],
    });

    if (!doctor) {
      return res.status(401).json({ error: "Account not found. Please check credentials or register." });
    }

    // Support legacy plaintext or bcrypt passwords during transition
    const isMatch = doctor.password.startsWith("$2a$") || doctor.password.startsWith("$2b$")
      ? await bcrypt.compare(password, doctor.password)
      : password === doctor.password;

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password." });
    }

    // Hash the plaintext password for legacy users silently
    if (password === doctor.password && !doctor.password.startsWith("$2")) {
      const salt = await bcrypt.genSalt(10);
      doctor.password = await bcrypt.hash(password, salt);
      await doctor.save();
    }

    if (!doctor.isVerified) {
      return res.status(403).json({ error: "Your doctor account is pending admin verification/approval." });
    }

    const token = jwt.sign(
      { id: doctor._id, role: doctor.role, doctorId: doctor.doctorId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Doctor logged in successfully!",
      token,
      doctor: {
        _id: doctor._id,
        doctorId: doctor.doctorId,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialty: doctor.specialty,
        qualification: doctor.qualification,
        hospital: doctor.hospital,
        experience: doctor.experience,
        fee: doctor.fee,
        availableTime: doctor.availableTime,
        availableSlots: doctor.availableSlots,
        isAvailable: doctor.isAvailable,
        isVerified: doctor.isVerified,
        role: "doctor",
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/doctors - Fetch only verified doctors for patient booking list
router.get("/", async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isVerified: true }).sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    next(err);
  }
});

// GET /api/doctors/all - Admin route to view all doctors
router.get("/all", async (req, res, next) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    next(err);
  }
});

// PUT /api/doctors/:id/verify - Admin toggle verification
router.put("/:id/verify", async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    doctor.isVerified = req.body.isVerified !== undefined ? req.body.isVerified : !doctor.isVerified;
    await doctor.save();
    res.json(doctor);
  } catch (err) {
    next(err);
  }
});

// GET /api/doctors/:id - Single Doctor
router.get("/:id", async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    next(err);
  }
});

// PUT /api/doctors/:id - Update Doctor Profile / Availability
router.put("/:id", async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const fields = ["name", "specialty", "rating", "hospital", "fee", "experience", "qualification", "availableSlots", "availableTime", "photoUrl", "isAvailable"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) doctor[field] = req.body[field];
    });

    if (req.body.weeklySchedule) {
      if (!doctor.weeklySchedule) doctor.weeklySchedule = new Map();
      for (const [day, slots] of Object.entries(req.body.weeklySchedule)) {
        doctor.weeklySchedule.set(day, slots);
      }
    }

    await doctor.save();
    res.json(doctor);
  } catch (err) {
    next(err);
  }
});

// GET /api/doctors/:id/booked-slots - Get booked slots for a specific date
router.get("/:id/booked-slots", async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Date is required" });
    
    const appointments = await Appointment.find({
      doctorId: req.params.id,
      date,
      status: { $in: ["BOOKED", "CONFIRMED", "IN_PROGRESS"] }
    });
    
    const bookedSlots = appointments.map(apt => apt.time);
    res.json(bookedSlots);
  } catch (err) {
    next(err);
  }
});

// GET /api/doctors/patient-history/:patientId - Doctor Access Patient Medical Records
router.get("/patient-history/:patientId", async (req, res, next) => {
  try {
    const query = req.params.patientId.trim();
    // Search user by patientId, phone, or dependent ID
    const patient = await User.findOne({
      $or: [{ patientId: query }, { phone: query }, { "dependents.id": query }],
    });

    if (!patient) {
      return res.status(404).json({ error: `No patient found with ID: ${query}` });
    }

    const isDependent = patient.dependents?.find(d => d.id === query);
    
    // Prepare filter to isolate records
    const aptFilter = { patientId: patient._id, patientCustomId: query };
    const healthFilter = { patientId: patient._id, dependentId: isDependent ? query : "" };
    
    const [appointments, symptomChecks, healthRecords, prescriptions] = await Promise.all([
      Appointment.find(aptFilter).populate("doctorId", "name specialty hospital").sort({ createdAt: -1 }),
      SymptomCheck.find(healthFilter).sort({ createdAt: -1 }),
      HealthRecord.find(healthFilter).sort({ uploadedAt: -1 }),
      Prescription.find({ patientId: patient._id }).sort({ createdAt: -1 }), // Add dependentId filter if added to schema
    ]);

    res.json({
      patient: {
        _id: patient._id,
        patientId: isDependent ? isDependent.id : patient.patientId,
        name: isDependent ? isDependent.name : patient.name,
        phone: patient.phone,
        email: patient.email,
        age: isDependent ? isDependent.age : patient.age,
        gender: isDependent ? isDependent.gender : patient.gender,
        createdAt: patient.createdAt,
        relation: isDependent ? isDependent.relation : "Primary",
      },
      appointments,
      symptomChecks,
      healthRecords,
      prescriptions,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
