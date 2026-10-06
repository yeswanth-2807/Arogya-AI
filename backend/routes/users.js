const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");

// Helper to generate sequential Patient ID (pt YY/XXXX)
async function generatePatientId() {
  const year = new Date().getFullYear().toString().slice(-2);
  let count = await User.countDocuments();
  
  let isUnique = false;
  let patientId = "";
  
  while (!isUnique) {
    count += 1;
    const sequence = count.toString().padStart(4, "0");
    patientId = `pt ${year}/${sequence}`;
    const exists = await User.findOne({ patientId });
    if (!exists) {
      isUnique = true;
    }
  }
  return patientId;
}

// Signup (Register Patient)
router.post("/signup", async (req, res, next) => {
  try {
    const { name, phone, password, age, gender, email, preferredLanguage } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: "Name, Mobile Number, and Password are required." });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: "Mobile number already registered. Please log in." });
    }

    const patientId = await generatePatientId();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      patientId,
      name,
      phone,
      password: hashedPassword,
      age: age ? Number(age) : undefined,
      gender: gender || "Not specified",
      email: email || "",
      preferredLanguage: preferredLanguage || "en",
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, patientId: newUser.patientId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ user: newUser, token });
  } catch (err) {
    next(err);
  }
});

// Legacy POST / for backwards compatibility
router.post("/", async (req, res, next) => {
  try {
    if (!req.body.patientId) {
      req.body.patientId = generatePatientId();
    }
    if (!req.body.password) {
      req.body.password = "123456";
    }
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// Login with Mobile Number and Password
router.post("/login", async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: "Mobile Number and Password are required." });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: "Mobile number not found. Please sign up first." });
    }

    // Support legacy plaintext or bcrypt passwords during transition
    const isMatch = user.password.startsWith("$2a$") || user.password.startsWith("$2b$")
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }
    
    // Hash the plaintext password for legacy users silently
    if (password === user.password && !user.password.startsWith("$2")) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, patientId: user.patientId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ user, token });
  } catch (err) {
    next(err);
  }
});

// Legacy phone lookup
router.get("/lookup", async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: "phone query param is required" });
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: "No account found for that phone number" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Read profile by ID
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});
// Add Dependent
router.post("/:id/dependents", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, age, gender, relation } = req.body;
    if (!name || !age || !gender || !relation) {
      return res.status(400).json({ error: "Name, age, gender, and relation are required." });
    }

    const uniqueId = `${user.patientId}-DEP-${Date.now()}`;
    const newDependent = {
      id: uniqueId,
      name, age, gender, relation
    };

    user.dependents.push(newDependent);
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Remove Dependent
router.delete("/:id/dependents/:dependentId", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.dependents = user.dependents.filter(d => 
      d.id !== req.params.dependentId && 
      (!d._id || d._id.toString() !== req.params.dependentId)
    );
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
