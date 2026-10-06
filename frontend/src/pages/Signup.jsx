import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/client";
import { Button, Input } from "../components/ui";

export default function Signup() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    age: "",
    gender: "Male",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdPatientId, setCreatedPatientId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.signupUser(formData);
      const user = res.user || res;
      setCreatedPatientId(user.patientId);
      login(user, res.token);
      setTimeout(() => {
        navigate("/symptom-checker");
      }, 2000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-8 flex items-center justify-center transition-colors">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-md w-full shadow-xl space-y-6 text-slate-900 dark:text-white">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-md">
            ✚
          </div>
          <h1 className="text-2xl font-extrabold">Patient Portal Registration</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create your patient account to get your unique Patient ID and access AI telemedicine care.
          </p>
        </div>

        {createdPatientId ? (
          <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center space-y-3 text-emerald-900 dark:text-emerald-200 animate-rise">
            <div className="text-4xl">🎉</div>
            <h3 className="font-bold text-lg">Registration Successful!</h3>
            <p className="text-xs">Your official Arogya AI Patient ID has been generated:</p>
            <div className="text-2xl font-black font-mono tracking-wider bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 shadow-sm">
              {createdPatientId}
            </div>
            <p className="text-xs text-slate-500">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs p-3 rounded-xl border border-red-200 dark:border-red-800 font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-bold block mb-1">Full Name</label>
              <Input
                type="text"
                placeholder="Enter patient full name..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Mobile Number (For Login)</label>
              <Input
                type="tel"
                placeholder="10-digit mobile number..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Account Password</label>
              <Input
                type="password"
                placeholder="Create secure password..."
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold block mb-1">Age</label>
                <Input
                  type="number"
                  placeholder="e.g. 35"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Email Address (Optional)</label>
              <Input
                type="email"
                placeholder="patient@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <Button type="submit" variant="primary" disabled={loading} className="w-full py-3 font-bold shadow-md">
              {loading ? "Registering Patient Account..." : "Create Patient Account →"}
            </Button>

            <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              Already registered?{" "}
              <Link to="/login" className="font-bold text-sky-600 hover:underline">
                Log in with Mobile & Password
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
