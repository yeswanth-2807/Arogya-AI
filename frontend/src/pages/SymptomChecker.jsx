import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import { Button, Input, Badge } from "../components/ui";

const COMMON_SYMPTOMS = [
  "High Fever", "Chest Pain", "Severe Headache", "Cough", "Joint Pain",
  "Shortness of Breath", "Vomiting", "Nausea", "Dizziness", "Stomach Pain",
  "Fatigue", "Rash", "Heartburn", "Burning Urination", "Loss of Appetite"
];

function SymptomChecker() {
  const { user } = useContext(AuthContext);
  const { translate } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [symptomInput, setSymptomInput] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [duration, setDuration] = useState("1-3 days");
  const [severity, setSeverity] = useState("moderate");
  const [visionImage, setVisionImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [fullUser, setFullUser] = useState(null);
  const [selectedDependentId, setSelectedDependentId] = useState("myself");

  React.useEffect(() => {
    if (user) {
      const patientId = user.id || user._id;
      api.getUserProfile(patientId)
        .then((data) => setFullUser(data))
        .catch(() => setFullUser(user));
    }
  }, [user]);

  const addSymptom = (term) => {
    const val = (term || symptomInput).trim();
    if (val && !symptoms.includes(val)) {
      setSymptoms([...symptoms, val]);
      setSymptomInput("");
    }
  };

  const removeSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (symptoms.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      let patientName = fullUser?.name || user?.name || "Patient";
      if (selectedDependentId !== "myself" && fullUser?.dependents) {
        const dep = fullUser.dependents.find(d => d.id === selectedDependentId);
        if (dep) patientName = `${dep.name} (${dep.relation})`;
      }

      const payload = {
        symptoms,
        duration,
        severity,
        patientId: user?.id || user?._id,
        dependentId: selectedDependentId,
        patientName: patientName
      };
      const data = await api.checkSymptoms(payload);
      
      setResult(data);
    } catch (err) {
      console.error("Symptom check error:", err);
      setResult({
        canPredict: false,
        error: "Server connectivity issue. Please try again or consult a doctor directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-8 text-slate-900 dark:text-white transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 text-xs font-bold border border-sky-200 dark:border-sky-800">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                AI Clinical Diagnostic Assistant
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Symptom Checker & Triage
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
              Select your symptoms below. Our AI clinical triage engine evaluates potential conditions and matches you with the right specialist doctor.
            </p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-xs text-amber-800 dark:text-amber-300 max-w-xs">
            <strong>⚠️ Medical Disclaimer:</strong> AI symptom checker is for informational assessment only and does not replace professional emergency care.
          </div>
        </div>

        {/* Symptom Input Form & Quick Pick */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 flex items-center justify-center text-xs font-bold">1</span>
              Add Your Symptoms
            </h2>

            {fullUser && (
              <div className="mb-6">
                <label className="block text-xs font-bold mb-2">Who is experiencing these symptoms?</label>
                <select
                  value={selectedDependentId}
                  onChange={(e) => setSelectedDependentId(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white transition-colors focus:ring-2 focus:ring-sky-500"
                >
                  <option value="myself">Myself ({(fullUser && fullUser.name) || user?.name || "Patient"})</option>
                  {fullUser?.dependents?.map(dep => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name} ({dep.relation})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Input bar */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a symptom (e.g. fever, headache, chest tightness)..."
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSymptom()}
              />
              <Button variant="primary" onClick={() => addSymptom()} className="bg-sky-600 hover:bg-sky-500">
                + Add
              </Button>
            </div>


            {/* Quick Pick Pills */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Common Symptoms Quick Selection:
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.map((sym) => {
                  const isSelected = symptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      onClick={() => (isSelected ? removeSymptom(symptoms.indexOf(sym)) : addSymptom(sym))}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                        isSelected
                          ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Symptoms Badge List */}
            {symptoms.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Your Selected Symptoms ({symptoms.length}):
                </label>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-3 py-1 rounded-full text-xs font-bold"
                    >
                      {s}
                      <button
                        onClick={() => removeSymptom(i)}
                        className="hover:text-red-600 font-bold ml-1 text-sm leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center text-xs font-bold">2</span>
                Symptom Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Duration of Symptoms</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold focus:border-sky-500 focus:outline-none"
                  >
                    <option value="Less than 24 hours">Less than 24 hours</option>
                    <option value="1-3 days">1-3 days</option>
                    <option value="4-7 days">4-7 days</option>
                    <option value="More than a week">More than a week</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold focus:border-sky-500 focus:outline-none"
                  >
                    <option value="mild">Mild (Manageable daily activities)</option>
                    <option value="moderate">Moderate (Noticeable discomfort)</option>
                    <option value="severe">Severe (High pain or difficulty)</option>
                  </select>
                </div>
              </div>
            </div>

            <Button
              variant="teal"
              onClick={handleAnalyze}
              disabled={loading || symptoms.length === 0}
              className="w-full py-3 text-base font-bold shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Analyzing Clinical Database...
                </span>
              ) : (
                "🤖 Run AI Medical Assessment"
              )}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6">
            <h2 className="text-xl font-bold flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <span>Clinical Analysis & Diagnostic Assessment</span>
            </h2>

            {!result.canPredict ? (
              <div className="bg-red-50 dark:bg-red-950/60 border-2 border-red-200 dark:border-red-800 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-md">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900 dark:text-red-300">
                      Inconclusive AI Symptom Pattern — Specialist Doctor Consultation Required
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-400 mt-1 leading-relaxed">
                      {result.analysisNote ||
                        "Our AI diagnostic engine could not establish a high-confidence disease prediction for your combination of symptoms. Please do not self-diagnose. Consult a qualified doctor directly for proper clinical diagnosis and lab tests."}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-red-200 dark:border-red-800 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-xs font-bold text-red-900 dark:text-red-300">
                    Recommended Action: Schedule an immediate online or in-person consultation with a doctor.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/doctors")}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 shadow-md"
                  >
                    Consult Doctor Immediately →
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-emerald-900 dark:text-emerald-300 text-sm flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <strong>AI Triage Analysis Complete:</strong> We identified {result.conditions.length} potential conditions matching your symptom profile.
                  </div>
                </div>

                <div className="grid gap-4">
                  {result.conditions.map((cond, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-sky-400 dark:hover:border-sky-600 transition-all bg-slate-50/50 dark:bg-slate-950 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                            #{idx + 1}
                          </span>
                          <div>
                            <h3 className="font-bold text-lg">{cond.disease}</h3>
                            <p className="text-xs text-slate-500">Recommended Specialist: <strong className="text-sky-600 dark:text-sky-400">{cond.specialty}</strong></p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                            cond.severity === "severe" ? "bg-red-100 text-red-700" : cond.severity === "moderate" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {cond.severity} Severity
                          </span>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-500 block">AI Match Confidence</span>
                            <span className="text-lg font-black text-sky-600 dark:text-sky-400">{cond.confidence}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${cond.confidence}%` }}
                        />
                      </div>

                      <p className="text-xs sm:text-sm bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        💡 <strong>Clinical Recommendation:</strong> {cond.recommendation}
                      </p>

                      <div className="flex justify-end pt-2">
                        <Button
                          variant="primary"
                          onClick={() => navigate(`/doctors?spec=${encodeURIComponent(cond.specialty)}`)}
                          className="text-xs font-bold bg-sky-600 hover:bg-sky-500"
                        >
                          Book Appointment with {cond.specialty} Specialist →
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SymptomChecker;
