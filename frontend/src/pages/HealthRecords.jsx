import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { api, API_ORIGIN } from "../api/client";
import { Button, Input } from "../components/ui";

export default function HealthRecords() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [fullUser, setFullUser] = useState(null);
  const [selectedDependentId, setSelectedDependentId] = useState("myself");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const patientId = user.id || user._id;
    api
      .getUserProfile(patientId)
      .then((data) => setFullUser(data))
      .catch(() => setFullUser(user));

    api
      .getHealthRecords(patientId)
      .then((data) => setRecords(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const upload = async (e) => {
    e.preventDefault();
    setError("");
    if (!user) return setError("Log in first to upload a report.");
    if (!file) return setError("Choose a PDF, PNG, or JPG file first.");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("patientId", user.id || user._id);
      formData.append("dependentId", selectedDependentId);
      formData.append("notes", notes);
      const record = await api.uploadHealthRecord(formData);
      setRecords((r) => [record, ...r]);
      setFile(null);
      setNotes("");
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.deleteHealthRecord(id);
      setRecords((r) => r.filter((x) => x._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent py-16 px-4 flex items-center justify-center transition-colors">
        <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4 shadow-sm text-slate-900 dark:text-white">
          <div className="text-4xl">🔒</div>
          <h2 className="text-xl font-bold">Log in to access Health Records</h2>
          <p className="text-xs text-slate-500">You need to be authenticated to upload and manage your medical reports.</p>
          <Link to="/login">
            <Button variant="primary" className="w-full font-bold">Log in to Patient Portal</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-6 sm:py-8 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-white transition-colors">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            Secure Health Vault
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mt-2">Electronic Health Records</h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Upload lab test reports, prescriptions, and imaging documents. Your doctor can access them during live consultations.
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-sm space-y-4">
          <h2 className="font-bold text-base sm:text-lg">Upload New Report</h2>
          <form onSubmit={upload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 sm:p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/50 hover:border-sky-500 transition-colors">
              <div className="text-3xl sm:text-4xl">📑</div>
              <div>
                <label htmlFor="health-file" className="cursor-pointer font-bold text-sky-600 hover:underline text-sm block">
                  Choose Report File
                </label>
                <span className="text-xs text-slate-400">Supports PDF, PNG, or JPG (Max 10MB)</span>
              </div>
              <input
                id="health-file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              {file && (
                <p className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 p-2 rounded-lg inline-block border border-emerald-200">
                  ✓ {file.name}
                </p>
              )}
            </div>

            {fullUser && (
              <div>
                <label className="block text-xs font-bold mb-1">Who does this report belong to?</label>
                <select
                  value={selectedDependentId}
                  onChange={(e) => setSelectedDependentId(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="myself">Myself ({(fullUser && fullUser.name) || user?.name || "Patient"})</option>
                  {fullUser?.dependents?.map(dep => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name} ({dep.relation})
                    </option>
                  ))}
                </select>
                {(!fullUser?.dependents || fullUser?.dependents?.length === 0) && (
                  <p className="text-[10px] text-slate-500 mt-1">You can add family members in your Profile.</p>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-bold block mb-1">Notes (optional)</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Fasting blood sugar, taken at Apollo Diagnostics"
              />
            </div>

            {error && <p className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs p-3 rounded-xl font-semibold">{error}</p>}

            <Button type="submit" variant="teal" disabled={uploading} className="w-full sm:w-auto font-bold">
              {uploading ? "Uploading..." : "📂 Upload Report"}
            </Button>
          </form>
        </div>

        {/* Records List */}
        <div className="space-y-4">
          <h2 className="font-bold text-base sm:text-lg">Previous Reports</h2>
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading records...
            </div>
          ) : !Array.isArray(records) || records.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center text-slate-500 text-xs space-y-2">
              <div className="text-4xl">🩸</div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">No reports yet</h3>
              <p>Upload your first blood test or lab report above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {records.map((r) => (
                <div key={r._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-3 shadow-xs">
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{r.notes || "Untitled report"}</p>
                      {r.patientName && (
                        <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full font-bold">
                          {r.patientName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs uppercase tracking-wide text-slate-400 mt-1">{r.fileType}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(r.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-3 text-xs font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href={`${API_ORIGIN}${r.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-600 hover:underline"
                    >
                      📄 Open
                    </a>
                    <button onClick={() => remove(r._id)} className="text-red-600 hover:underline">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
