const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, default: "Not specified" },
  email: { type: String, trim: true, lowercase: true },
  role: { type: String, default: "patient" },
  preferredLanguage: {
    type: String,
    enum: ["en", "ta", "te", "kn", "ml"],
    default: "en",
  },
  dependents: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    relation: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
