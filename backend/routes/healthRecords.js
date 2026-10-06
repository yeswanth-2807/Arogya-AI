const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const mongoose = require("mongoose");
const HealthRecord = require("../models/HealthRecord");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const allowedTypes = [".pdf", ".png", ".jpg", ".jpeg"];
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return cb(new Error("Only PDF, PNG, or JPG files are allowed"));
    }
    cb(null, true);
  },
});

// Upload a blood test / lab report
router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const User = require("../models/User");
    let patientName = "Self";
    const user = await User.findById(req.body.patientId);
    
    if (user) {
      patientName = user.name;
      if (req.body.dependentId && req.body.dependentId !== "myself") {
        const dep = user.dependents?.find(d => d.id === req.body.dependentId);
        if (dep) patientName = `${dep.name} (${dep.relation})`;
      }
    }

    const record = await HealthRecord.create({
      patientId: req.body.patientId,
      dependentId: req.body.dependentId === "myself" ? "" : req.body.dependentId,
      patientName: patientName,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: path.extname(req.file.originalname).replace(".", ""),
      notes: req.body.notes || "",
    });
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

// List records for a patient
router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.patientId && mongoose.isValidObjectId(req.query.patientId)) {
      filter.patientId = req.query.patientId;
    } else if (req.query.patientId) {
      return res.json([]);
    }
    const records = await HealthRecord.find(filter).sort({ uploadedAt: -1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
});

// Update notes on a record
router.put("/:id", async (req, res, next) => {
  try {
    const record = await HealthRecord.findByIdAndUpdate(
      req.params.id,
      { notes: req.body.notes },
      { new: true }
    );
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  } catch (err) {
    next(err);
  }
});

// Delete a record
router.delete("/:id", async (req, res, next) => {
  try {
    const record = await HealthRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
