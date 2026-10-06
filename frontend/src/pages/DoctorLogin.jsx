import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/client";
import { Button, Input } from "../components/ui";

function DoctorLogin() {
  const { loginDoctor, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.loginDoctor({ identifier: email, password });
      
      if (res.isAdmin) {
        login(res.admin, res.token);
        navigate("/admin");
      } else {
        loginDoctor(res.doctor, res.token);
        navigate("/doctor/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 flex items-center justify-center transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-6 text-slate-900 dark:text-white">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-600/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-3xl font-bold mx-auto">
            👨‍⚕️
          </div>
          <h1 className="text-2xl font-extrabold">Doctor Portal Login</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in with your Registered Email Address.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs p-3.5 rounded-2xl font-bold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@hospital.org"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <Button type="submit" variant="teal" disabled={loading} className="w-full font-bold py-3 mt-2">
            {loading ? "Verifying Credentials..." : "🔑 Log in as Doctor"}
          </Button>
        </form>

        <div className="space-y-2 text-center pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <p>
            New doctor?{" "}
            <Link to="/doctor/register" className="text-sky-600 dark:text-sky-400 font-bold hover:underline">
              Register Credentials
            </Link>
          </p>
          <p>
            Are you a patient?{" "}
            <Link to="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
              Patient Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DoctorLogin;
