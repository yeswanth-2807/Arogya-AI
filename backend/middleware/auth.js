const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "telemedicine_super_secret_key_2026";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No valid token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};

const verifyDoctor = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ error: "Access denied. Doctor role required." });
    }
    next();
  });
};

const verifyPatient = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "patient") {
      return res.status(403).json({ error: "Access denied. Patient role required." });
    }
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }
    next();
  });
};

module.exports = {
  verifyToken,
  verifyDoctor,
  verifyPatient,
  verifyAdmin,
  JWT_SECRET,
};
