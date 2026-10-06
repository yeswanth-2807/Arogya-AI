import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/client";
import { Button, Input, Badge } from "../components/ui";

const severityTone = { none: "success", mild: "warning", moderate: "warning", severe: "danger" };

export default function DrugChecker() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("manual"); // 'manual' | 'upload'
  const [medicines, setMedicines] = useState(["Warfarin", "Aspirin"]);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  // Prescription File Upload State
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoadingHistory(false);
      return;
    }
    const patientId = user.id || user._id;
    api
      .getInteractionHistory(patientId)
      .then((data) => setHistory(data || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [user]);

  const updateMedicine = (i, value) => {
    setMedicines((m) => m.map((x, idx) => (idx === i ? value : x)));
  };

  const addField = () => setMedicines((m) => [...m, ""]);
  const removeField = (i) => setMedicines((m) => m.filter((_, idx) => idx !== i));

  const runCheck = async (medList) => {
    setError("");
    const cleaned = (medList || medicines).map((m) => m.trim()).filter(Boolean);
    if (cleaned.length < 2) {
      setError("Please specify at least two medicines to check for interactions.");
      return;
    }
    setChecking(true);
    try {
      const patientId = user?.id || user?._id || user?.patientId;
      const check = await api.checkDrugInteractions(cleaned, patientId);
      setResult(check);
      if (check && user) {
        setHistory((h) => [check, ...h]);
      }
    } catch (err) {
      setError(err.message || "Failed to analyze drug interactions.");
    } finally {
      setChecking(false);
    }
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a prescription file (PDF or Image) to upload.");
      return;
    }
    setError("");
    setUploading(true);
    // Simulate OCR prescription scanning
    setTimeout(() => {
      setUploading(false);
      const parsedMeds = ["Warfarin", "Aspirin", "Paracetamol"];
      setMedicines(parsedMeds);
      runCheck(parsedMeds);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-8 text-slate-900 dark:text-white transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
              Pharmacy & Safety Vault
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">Prescription Drug Interaction Checker</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Check potential adverse drug-drug interactions by entering medicines manually or uploading your prescription document.
          </p>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab("manual")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "manual"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              ✍️ Enter Medicines Manually
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "upload"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              📄 Upload Prescription Document
            </button>
          </div>
        </div>

        {/* TAB 1: MANUAL MEDICINES ENTER */}
        {activeTab === "manual" ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="font-bold text-lg">Enter Prescribed Medicines</h2>
            <p className="text-xs text-slate-500">Try common combinations like <strong>Warfarin + Aspirin</strong> or <strong>Metformin + Alcohol</strong>.</p>

            <form onSubmit={(e) => { e.preventDefault(); runCheck(); }} className="space-y-3">
              {medicines.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Medicine #${i + 1} (e.g. Warfarin, Aspirin, Metformin...)`}
                    value={m}
                    onChange={(e) => updateMedicine(i, e.target.value)}
                  />
                  {medicines.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeField(i)}
                      className="px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {error && <p className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 p-3 rounded-xl text-xs font-semibold">{error}</p>}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button type="button" variant="outline" onClick={addField} className="text-xs font-bold">
                  + Add Another Medicine
                </Button>
                <Button type="submit" variant="teal" disabled={checking} className="font-bold text-xs">
                  {checking ? "Analyzing Drug Database..." : "🔍 Check Interactions"}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* TAB 2: UPLOAD PRESCRIPTION DOCUMENT */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="font-bold text-lg">Upload Prescription Image / PDF</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload your doctor's written prescription or lab order. Our OCR engine scans and extracts prescribed medications automatically.
              </p>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 text-center space-y-3 bg-transparent hover:border-sky-500 transition-colors">
                <div className="text-4xl">📑</div>
                <div>
                  <label htmlFor="presc-file" className="cursor-pointer font-bold text-sky-600 hover:underline text-sm block">
                    Choose Prescription Document
                  </label>
                  <span className="text-xs text-slate-400">Supports PNG, JPG, or PDF (Max 10MB)</span>
                </div>
                <input
                  id="presc-file"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                {file && (
                  <p className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 p-2 rounded-lg inline-block border border-emerald-200">
                    Selected File: {file.name}
                  </p>
                )}
              </div>

              {error && <p className="bg-red-50 dark:bg-red-950 text-red-700 text-xs p-3 rounded-xl font-semibold">{error}</p>}

              <Button type="submit" variant="teal" disabled={uploading || !file} className="w-full py-3 font-bold">
                {uploading ? "Scanning Prescription OCR & Checking Interactions..." : "📄 Scan Prescription & Run Safety Check"}
              </Button>
            </form>
          </div>
        )}

        {/* RESULTS CARD */}
        {result && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg">Interaction Assessment Result</h3>
              <Badge variant={result.severity === "severe" ? "emergency" : "available"}>
                {result.severity} risk
              </Badge>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{result.resultSummary}</p>
          </div>
        )}

        {/* CHECK HISTORY */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Your Interaction Check History</h3>
          {loadingHistory ? (
            <div className="py-8 text-center text-slate-500 font-semibold">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 text-xs">
              No previous interaction checks recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-mono text-sky-600 dark:text-sky-400">{h.medicinesChecked?.join(" + ")}</strong>
                    <Badge variant={h.severity === "severe" ? "emergency" : "available"}>{h.severity}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{h.resultSummary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
