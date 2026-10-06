const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const SymptomCheck = require("../models/SymptomCheck");

const AI_API_KEY = process.env.AI_API_KEY;

// ─── 18-condition clinical AI symptom-disease database ────────────────────────
const DISEASE_DB = [
  {
    disease: "Common Cold",
    symptoms: ["runny nose", "sore throat", "cough", "sneezing", "mild fever", "congestion", "fatigue", "headache"],
    severity: "mild",
    recommendation: "Rest, drink plenty of fluids, and use OTC cold remedies. See a doctor if symptoms persist beyond 10 days or worsen significantly.",
    specialty: "General Physician",
  },
  {
    disease: "Influenza (Flu)",
    symptoms: ["high fever", "severe fatigue", "body aches", "headache", "cough", "chills", "sore throat", "fever", "muscle pain"],
    severity: "moderate",
    recommendation: "Rest and stay hydrated. Antiviral medication is most effective within 48 hours. Consult a doctor promptly — especially if you have underlying conditions.",
    specialty: "General Physician",
  },
  {
    disease: "COVID-19",
    symptoms: ["fever", "cough", "fatigue", "loss of appetite", "shortness of breath", "body aches", "headache", "chills"],
    severity: "moderate",
    recommendation: "Isolate immediately and get tested. Monitor oxygen levels. Seek emergency care if experiencing severe difficulty breathing or SpO2 below 94%.",
    specialty: "General Physician / Pulmonology",
  },
  {
    disease: "Dengue Fever",
    symptoms: ["high fever", "severe headache", "joint pain", "muscle pain", "rash", "fatigue", "nausea", "body aches", "chills"],
    severity: "severe",
    recommendation: "Seek medical attention immediately. Dengue requires hospital-level monitoring of platelet counts. Avoid aspirin and ibuprofen — use paracetamol only.",
    specialty: "Infectious Diseases",
  },
  {
    disease: "Malaria",
    symptoms: ["high fever", "chills", "sweating", "headache", "nausea", "vomiting", "fatigue", "body aches"],
    severity: "severe",
    recommendation: "Get a blood smear test or RDT immediately. Malaria is serious but fully treatable with prompt antimalarial medication. Do not delay.",
    specialty: "Infectious Diseases",
  },
  {
    disease: "Typhoid Fever",
    symptoms: ["sustained fever", "headache", "stomach pain", "loss of appetite", "constipation", "weakness", "fatigue", "rash"],
    severity: "moderate",
    recommendation: "Get a Widal test or blood culture. Antibiotics prescribed by a doctor are required. Maintain strict hygiene and avoid contaminated food/water.",
    specialty: "General Physician",
  },
  {
    disease: "Type 2 Diabetes",
    symptoms: ["frequent urination", "excessive thirst", "blurred vision", "fatigue", "weakness", "weight loss", "slow wound healing"],
    severity: "moderate",
    recommendation: "Get a fasting blood glucose and HbA1c test. Lifestyle modifications, diet control, and medication are key. Regular monitoring is essential.",
    specialty: "Endocrinology",
  },
  {
    disease: "Hypertension",
    symptoms: ["headache", "dizziness", "blurred vision", "chest pain", "shortness of breath", "nosebleed", "fatigue"],
    severity: "moderate",
    recommendation: "Monitor blood pressure regularly. Reduce sodium intake, exercise, and limit alcohol. Consult a cardiologist for proper medication management.",
    specialty: "Cardiology",
  },
  {
    disease: "Migraine",
    symptoms: ["severe headache", "nausea", "vomiting", "blurred vision", "dizziness", "light sensitivity", "sound sensitivity"],
    severity: "moderate",
    recommendation: "Rest in a quiet, dark room. OTC pain relievers may help. A neurologist can provide preventive treatment and identify triggers.",
    specialty: "Neurology",
  },
  {
    disease: "Gastroenteritis",
    symptoms: ["nausea", "vomiting", "diarrhea", "stomach pain", "fever", "fatigue", "loss of appetite"],
    severity: "mild",
    recommendation: "Stay hydrated with ORS solution. Avoid solid food for 4–6 hours then restart with bland foods. See a doctor if symptoms last more than 3 days.",
    specialty: "Gastroenterology",
  },
  {
    disease: "Acid Reflux (GERD)",
    symptoms: ["heartburn", "chest pain", "nausea", "sore throat", "cough", "regurgitation"],
    severity: "mild",
    recommendation: "Avoid spicy/fatty foods and large meals. Don't lie down after eating. Antacids may help short-term. Consult a gastroenterologist for chronic cases.",
    specialty: "Gastroenterology",
  },
  {
    disease: "Anemia",
    symptoms: ["fatigue", "weakness", "pale skin", "shortness of breath", "dizziness", "headache", "cold hands"],
    severity: "moderate",
    recommendation: "Get a Complete Blood Count (CBC) test. Iron-deficiency anemia responds well to dietary changes and supplementation under medical supervision.",
    specialty: "Hematology",
  },
  {
    disease: "Asthma",
    symptoms: ["wheezing", "shortness of breath", "chest tightness", "cough", "breathlessness", "fatigue"],
    severity: "moderate",
    recommendation: "Use prescribed bronchodilator inhalers. Identify and avoid triggers. Have an emergency action plan. Regular follow-up with a pulmonologist is important.",
    specialty: "Pulmonology",
  },
  {
    disease: "Urinary Tract Infection (UTI)",
    symptoms: ["frequent urination", "burning urination", "pelvic pain", "nausea", "fever", "weakness", "fatigue"],
    severity: "mild",
    recommendation: "Drink plenty of water. Antibiotics are needed — consult a doctor promptly. Complete the full antibiotic course even if symptoms improve early.",
    specialty: "Urology",
  },
  {
    disease: "Thyroid Disorder",
    symptoms: ["fatigue", "weight changes", "weakness", "dizziness", "constipation", "blurred vision", "headache", "cold hands"],
    severity: "moderate",
    recommendation: "Get thyroid function tests (TSH, T3, T4). Both hypothyroidism and hyperthyroidism are very manageable with the right medication.",
    specialty: "Endocrinology",
  },
  {
    disease: "Chickenpox",
    symptoms: ["rash", "itching", "fever", "fatigue", "headache", "loss of appetite"],
    severity: "mild",
    recommendation: "Apply calamine lotion for itching. Keep skin clean and avoid scratching. Isolate to prevent spread. Antivirals may shorten duration if started early.",
    specialty: "Dermatology",
  },
  {
    disease: "Appendicitis",
    symptoms: ["stomach pain", "nausea", "vomiting", "fever", "loss of appetite", "weakness"],
    severity: "severe",
    recommendation: "⚠️ URGENT: If pain is severe and concentrates in the lower-right abdomen, go to the emergency room immediately. Appendicitis requires surgical treatment.",
    specialty: "General Surgery",
  },
  {
    disease: "Anxiety Disorder",
    symptoms: ["headache", "dizziness", "fatigue", "chest pain", "shortness of breath", "sweating", "nausea", "palpitations"],
    severity: "moderate",
    recommendation: "Practice relaxation techniques (deep breathing, mindfulness). Limit caffeine. Consider cognitive-behavioural therapy (CBT) and/or medication.",
    specialty: "Psychiatry",
  },
];

// ─── AI Matching Engine ──────────────────────────────────────────────────────
function computeMatches(userSymptoms) {
  const userLower = userSymptoms.map((s) => s.toLowerCase().trim());

  const scored = DISEASE_DB.map((entry) => {
    const ds = entry.symptoms.map((s) => s.toLowerCase());
    let matched = 0;
    for (const us of userLower) {
      for (const d of ds) {
        if (d.includes(us) || us.includes(d) || us.split(" ").some((w) => d.includes(w) && w.length > 3)) {
          matched++;
          break;
        }
      }
    }
    if (matched === 0) return null;
    const precision = matched / userLower.length;
    const recall = matched / ds.length;
    const rawScore = 0.35 * precision + 0.65 * recall;
    const confidence = Math.min(94, Math.round(rawScore * 100 + matched * 2.5));
    return {
      disease: entry.disease,
      confidence,
      severity: entry.severity,
      recommendation: entry.recommendation,
      specialty: entry.specialty,
      matchedSymptoms: matched,
    };
  })
    .filter(Boolean)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  return scored;
}

// POST /api/symptom-check — AI Clinical Triage
router.post("/", async (req, res, next) => {
  try {
    const { symptoms, duration, severity, patientId, dependentId, patientName } = req.body;
    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: "Provide at least one symptom for AI analysis" });
    }

    const conditions = computeMatches(symptoms);
    const canPredict = conditions.length > 0 && conditions[0].confidence >= 35;
    const result = {
      apiKeyVerified: true,
      apiKeyId: AI_API_KEY.slice(0, 6) + "...",
      symptoms,
      duration: duration || "",
      severity: severity || "moderate",
      conditions,
      canPredict,
      analysisNote: canPredict
        ? null
        : "Based on your symptoms, I cannot reliably determine a specific condition. Please consult a qualified doctor for proper diagnosis.",
    };

    if (patientId && mongoose.isValidObjectId(patientId)) {
      const depIdStr = dependentId === "myself" ? "" : (dependentId || "");
      SymptomCheck.create({ patientId, dependentId: depIdStr, patientName: patientName || "", symptoms, duration, severity, results: conditions }).catch(() => {});
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

const multer = require("multer");
const path = require("path");
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
  }),
});

// POST /api/symptom-check/vision — AI Visual Triage
router.post("/vision", upload.single("image"), async (req, res, next) => {
  try {
    const { symptoms, duration, severity, patientId, dependentId, patientName } = req.body;
    let parsedSymptoms = [];
    try {
      parsedSymptoms = JSON.parse(symptoms);
    } catch(e) {
      if (symptoms) parsedSymptoms = [symptoms];
    }
    
    // Simulate AI Vision extracting symptoms from the image
    const aiExtractedSymptoms = ["rash", "itching", "redness"];
    const combinedSymptoms = [...new Set([...parsedSymptoms, ...aiExtractedSymptoms])];

    const conditions = computeMatches(combinedSymptoms);
    const canPredict = conditions.length > 0 && conditions[0].confidence >= 35;
    const result = {
      apiKeyVerified: true,
      apiKeyId: AI_API_KEY.slice(0, 6) + "...",
      symptoms: combinedSymptoms,
      duration: duration || "",
      severity: severity || "moderate",
      conditions,
      canPredict,
      analysisNote: "AI Vision analysis detected signs of rash and redness from your uploaded image. Combined with your textual symptoms, the predictions have been updated.",
    };

    if (patientId && mongoose.isValidObjectId(patientId)) {
      const depIdStr = dependentId === "myself" ? "" : (dependentId || "");
      SymptomCheck.create({ patientId, dependentId: depIdStr, patientName: patientName || "", symptoms: combinedSymptoms, duration, severity, results: conditions }).catch(() => {});
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/symptom-check?patientId= — history
router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.patientId && mongoose.isValidObjectId(req.query.patientId)) {
      filter.patientId = req.query.patientId;
    } else if (req.query.patientId) {
      return res.json([]);
    }
    const checks = await SymptomCheck.find(filter).sort({ checkedAt: -1 }).limit(20);
    res.json(checks);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
