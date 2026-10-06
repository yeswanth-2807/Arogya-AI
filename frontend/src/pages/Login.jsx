import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import api from "../api/client";
import { Button, Input } from "../components/ui";

export default function Login() {
  const { login } = useContext(AuthContext);
  const { translate } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loginFn = api.loginUser || api.login;
      const res = await loginFn({ phone, password });
      login(res.user || res, res.token);
      navigate("/symptom-checker");
    } catch (err) {
      setError(err.message || "Invalid mobile number or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-8 flex items-center justify-center transition-colors">
      <div className="max-w-4xl w-full grid md:grid-cols-12 gap-8 items-center">
        {/* LEFT PANEL: GET STARTED INFO & BENEFITS */}
        <div className="md:col-span-6 bg-gradient-to-br from-sky-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 shadow-2xl border border-slate-800 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-400/30">
            <span>🏥</span> Arogya AI Patient Network
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to Arogya AI Hospital Portal
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Log in to access your unique Patient ID, AI symptom triage assessment, video consultations with senior hospital doctors, and secure health record vault.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 text-xs text-slate-200">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">✓</span>
              <div>
                <strong className="block text-white">Unique Patient ID Generation</strong>
                <span className="text-slate-400">Instant registration with permanent digital health ID (PAT-XXXXXX).</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-slate-200">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold flex-shrink-0">✓</span>
              <div>
                <strong className="block text-white">150+ Senior Hospital Specialists</strong>
                <span className="text-slate-400">Instant video consultations across Cardiology, Paediatrics, Neurology & more.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-slate-200">
              <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold flex-shrink-0">✓</span>
              <div>
                <strong className="block text-white">24/7 AI Clinical Symptom Check</strong>
                <span className="text-slate-400">Evaluate symptoms with 18-disease medical rule engine.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>New Patient?</span>
            <Link to="/signup">
              <Button variant="teal" className="text-xs font-bold py-2 px-4">
                Get Started & Sign Up →
              </Button>
            </Link>
          </div>
        </div>

        {/* RIGHT PANEL: LOGIN FORM */}
        <div className="md:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6 text-slate-900 dark:text-white">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <span className="text-3xl">👤</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {translate("auth.loginTitle") || "Welcome Back"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {translate("auth.loginSubtitle") || "Sign in to access your health portal"}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl font-semibold border border-red-100 dark:border-red-800/50 flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mobile Number</label>
              <Input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-slate-50 dark:bg-slate-900/50"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{translate("auth.password") || "Password"}</label>
              </div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-900/50"
              />
            </div>

            <Button type="submit" variant="primary" disabled={loading} className="w-full py-3 text-base shadow-lg shadow-sky-600/20 mt-2">
              {loading ? "Authenticating Patient Account..." : (translate("auth.submitLogin") || "Sign In")}
            </Button>
          </form>

          <p className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400 mt-6">
            {translate("auth.noAccount") || "Don't have an account?"}{" "}
            <Link to="/signup" className="text-sky-600 dark:text-sky-400 hover:underline">
              {translate("auth.submitSignup") || "Sign up"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
