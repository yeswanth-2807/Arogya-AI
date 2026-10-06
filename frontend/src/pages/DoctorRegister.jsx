import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/client";
import { Button, Input } from "../components/ui";

const SPECIALTIES = [
  "General Physician",
  "Cardiology",
  "Neurology",
  "Nephrology",
  "Urology",
  "Gastroenterology",
  "Pulmonology",
  "Endocrinology",
  "Oncology",
  "Rheumatology",
  "Hematology",
  "Paediatrics",
  "Neonatology",
  "Gynecology & Obstetrics",
  "Orthopaedics",
  "Dermatology",
  "Psychiatry",
  "Ophthalmology",
  "ENT & Head-Neck",
  "Emergency Medicine",
  "General Surgery",
  "Neurosurgery",
  "Cardiothoracic Surgery",
  "Plastic Surgery",
  "Dentistry",
  "Infectious Diseases",
  "Anesthesiology",
  "Radiology",
  "Pathology",
];

function DoctorRegister() {
  const { loginDoctor } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialty: "General Physician",
    qualification: "MBBS, MD",
    hospital: "Arogya Multi-Specialty Hospital",
    experience: "5+ Years",
    fee: "500",
    availableTime: "10:00 AM - 05:00 PM",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.registerDoctor(form);
      loginDoctor(res.doctor, res.token);
      alert(`Registration Successful! Your Doctor ID is ${res.doctor.doctorId}`);
      navigate("/doctor/dashboard");
    } catch (err) {
      setError(err.message || "Failed to register doctor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-10 px-4 flex items-center justify-center transition-colors">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-6 text-slate-900 dark:text-white">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-600/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-3xl font-bold mx-auto">
            👨‍⚕️
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Doctor Portal Registration</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Register your clinical credentials to join the Arogya Telemedicine Network and conduct online consultations.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs p-3.5 rounded-2xl font-bold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Doctor Full Name *</label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Dr. Rajesh Kumar"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Specialization *</label>
              <select
                name="specialty"
                value={form.specialty}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-sky-500"
                required
              >
                {SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Email Address *</label>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="doctor@hospital.org"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Mobile Number (Optional)</label>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Password *</label>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create account password"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Qualifications</label>
              <Input
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                placeholder="e.g. MBBS, MD (Cardiology)"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Hospital / Clinic</label>
              <Input
                name="hospital"
                value={form.hospital}
                onChange={handleChange}
                placeholder="Arogya Medical Center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Experience</label>
              <Input
                name="experience"
                value={form.experience}
                onChange={handleChange}
                placeholder="10+ Years"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Consultation Fee (₹)</label>
              <Input
                type="number"
                name="fee"
                value={form.fee}
                onChange={handleChange}
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Available Time</label>
              <Input
                name="availableTime"
                value={form.availableTime}
                onChange={handleChange}
                placeholder="e.g. 10:00 AM - 05:00 PM"
              />
            </div>
          </div>

          <Button type="submit" variant="teal" disabled={loading} className="w-full font-bold py-3.5 mt-2">
            {loading ? "Registering Credentials..." : "✍️ Complete Doctor Registration"}
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          Already registered?{" "}
          <Link to="/doctor/login" className="text-sky-600 dark:text-sky-400 font-bold hover:underline">
            Doctor Login Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DoctorRegister;
