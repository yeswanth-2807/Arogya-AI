import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Button, Input } from "../components/ui";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Admin login failed.");

      login(data.admin, data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner border border-red-500/30">
            🛡️
          </div>
          <h1 className="text-2xl font-black text-white">System Administration</h1>
          <p className="text-slate-400 text-sm mt-1">Authorized personnel only.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/20 mb-4 font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Admin Email</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@arogya.com"
              required
              className="bg-slate-900 text-white border-slate-700 w-full"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Passphrase</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
              className="bg-slate-900 text-white border-slate-700 w-full"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl border-none shadow-lg shadow-red-900/50">
            {loading ? "Verifying..." : "Authenticate"}
          </Button>
        </form>
      </div>
    </div>
  );
}
