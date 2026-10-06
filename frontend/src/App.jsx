import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import EmergencyButton from "./components/EmergencyButton.jsx";
import Home from "./pages/Home.jsx";
import SymptomChecker from "./pages/SymptomChecker.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import DoctorRegister from "./pages/DoctorRegister.jsx";
import DoctorLogin from "./pages/DoctorLogin.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import DrugChecker from "./pages/DrugChecker.jsx";
import HealthRecords from "./pages/HealthRecords.jsx";
import Doctors from "./pages/Doctors.jsx";
import Appointments from "./pages/Appointments.jsx";
import ConsultationRoom from "./pages/ConsultationRoom.jsx";
import Profile from "./pages/Profile.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminProtectedRoute from "./components/AdminProtectedRoute.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-24 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
    </div>
  );
}

export default function App() {
  return (
    <div 
      className="min-h-screen flex flex-col justify-between transition-colors text-slate-900 dark:text-slate-100 relative bg-fixed bg-center bg-cover"
      style={{
        backgroundImage: "url('/hero-bg.jpg')",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Global gradient overlay adapting to Light / Dark themes for text readability */}
      <div className="absolute inset-0 bg-white/85 dark:bg-slate-900/85 sm:dark:bg-slate-950/90 mix-blend-screen dark:mix-blend-multiply z-0 pointer-events-none transition-colors duration-300"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/50 to-white/90 dark:from-slate-950/95 dark:via-transparent dark:to-slate-900/90 z-0 pointer-events-none transition-colors duration-300"></div>

      <div className="relative z-10 flex-1 flex flex-col">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Separate Doctor Auth & Workspace Routes */}
            <Route path="/doctor/register" element={<DoctorRegister />} />
            <Route path="/doctor/login" element={<DoctorLogin />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

            <Route path="/drug-checker" element={<DrugChecker />} />
            <Route path="/health-records" element={<ErrorBoundary><HealthRecords /></ErrorBoundary>} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/consultation/:appointmentId" element={<ConsultationRoom />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/:tab" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      <footer className="relative z-10 bg-slate-950/50 backdrop-blur-md text-slate-400 text-xs py-8 border-t border-slate-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <strong className="text-white">Arogya AI Multi-Specialty Telemedicine Network</strong>
            <p className="mt-1">Providing 24/7 digital clinical triage, senior physician consultations, and drug safety checks.</p>
          </div>
          <div className="text-slate-500">
            Emergency Helpline: <a href="tel:108" className="text-red-400 font-bold">108</a>
          </div>
        </div>
      </footer>

      <EmergencyButton />
    </div>
  );
}
