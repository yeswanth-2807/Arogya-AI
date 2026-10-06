import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";

import { 
  Home, Activity, Stethoscope, ShieldPlus, 
  FolderOpen, CalendarDays, Sun, Moon, LogOut, User 
} from "lucide-react";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { translate } = useContext(LanguageContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const isDoctor = user?.role === "doctor";
  const isPatient = user && !isDoctor && !isAdmin;

  const handleProtectedClick = (e, path) => {
    if (!user) {
      e.preventDefault();
      alert("Please login to access this feature.");
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Emergency Header Bar */}
      <div className="bg-red-600 text-white text-[11px] font-bold py-1 px-4 text-center flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <span className="truncate">🚑 Emergency Ambulance & Trauma Desk: Call <strong>108</strong> (24/7)</span>
          <span className="hidden sm:inline">🏥 Arogya AI Multi-Specialty Hospital Network</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-extrabold shadow-md">
              <ShieldPlus className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight block leading-none">
                Arogya<span className="text-sky-600 dark:text-sky-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mt-0.5">
                Hospital Telemedicine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive("/") ? "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Home className="w-4 h-4" /> {translate("nav.home") || "Home"}
            </Link>

            {isDoctor ? (
              <>
                <Link
                  to="/doctor/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive("/doctor/dashboard") ? "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Activity className="w-4 h-4" /> Doctor Dashboard
                </Link>
                <Link
                  to="/appointments"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive("/appointments") ? "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <CalendarDays className="w-4 h-4" /> Consultations
                </Link>
              </>
            ) : isAdmin ? (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive("/admin") || location.pathname.startsWith("/admin") ? "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <ShieldPlus className="w-4 h-4" /> Admin Control Center
              </Link>
            ) : null}

            {/* General Links (Visible to Patients and Admins, but not Doctors) */}
            {(!isDoctor) && (
              <>
                <Link
                  to="/symptom-checker"
                  onClick={(e) => handleProtectedClick(e, "/symptom-checker")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive("/symptom-checker") ? "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Activity className="w-4 h-4" /> {translate("nav.symptoms") || "AI Symptom Checker"}
                </Link>

                <Link
                  to="/doctors"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive("/doctors") ? "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Stethoscope className="w-4 h-4" /> {translate("nav.doctors") || "Book Doctor"}
                </Link>

                <Link
                  to="/drug-checker"
                  onClick={(e) => handleProtectedClick(e, "/drug-checker")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive("/drug-checker") ? "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <ShieldPlus className="w-4 h-4" /> {translate("nav.checker") || "Drug Safety"}
                </Link>

                <Link
                  to="/health-records"
                  onClick={(e) => handleProtectedClick(e, "/health-records")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive("/health-records") ? "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <FolderOpen className="w-4 h-4" /> {translate("nav.records") || "Health Records"}
                </Link>

                {user && (
                  <Link
                    to="/appointments"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive("/appointments") ? "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <CalendarDays className="w-4 h-4" /> {translate("nav.appointments") || "My Appointments"}
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Action Tools: Dark Mode Toggle, Language Switcher, Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {user && <NotificationBell />}
            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold flex items-center gap-1.5"
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <><Sun className="w-4 h-4"/> Light</> : <><Moon className="w-4 h-4"/> Dark</>}
            </button>

            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <Link 
                  to={isDoctor ? "/doctor/dashboard" : isAdmin ? "/admin" : "/profile"}
                  className="text-right hover:opacity-80 transition-opacity cursor-pointer group flex flex-col items-end max-w-[120px]"
                >
                  <span className="block text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate w-full" title={user.name || "Admin"}>
                    {user.name || "Admin"}
                  </span>
                  <span className="block text-[10px] text-sky-600 dark:text-sky-400 font-mono whitespace-nowrap">
                    {isDoctor ? `ID: ${user.doctorId}` : isAdmin ? "System Admin" : `ID: ${user.patientId}`}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-700 dark:text-slate-300 hover:text-red-600 text-xs font-bold transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:shadow-md"
                >
                  <User className="w-3.5 h-3.5 text-sky-500" /> Patient Login
                </Link>
                <Link
                  to="/doctor/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 whitespace-nowrap hover:-translate-y-0.5"
                >
                  <Stethoscope className="w-3.5 h-3.5" /> Doctor Portal
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center lg:hidden gap-2">
            {user && <NotificationBell />}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="text-xl">{mobileMenuOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Home className="w-5 h-5" /> {translate("nav.home") || "Home"}
          </Link>

          {isDoctor ? (
            <>
              <Link
                to="/doctor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950"
              >
                <Activity className="w-5 h-5" /> Doctor Dashboard
              </Link>
              <Link
                to="/appointments"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <CalendarDays className="w-5 h-5" /> Consultations
              </Link>
            </>
          ) : isAdmin ? (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950"
            >
              <ShieldPlus className="w-5 h-5" /> Admin Control Center
            </Link>
          ) : null}

          {/* General Links for Patients and Admins */}
          {(!isDoctor) && (
            <>
              <Link
                to="/symptom-checker"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleProtectedClick(e, "/symptom-checker");
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Activity className="w-5 h-5" /> {translate("nav.symptoms") || "AI Symptom Checker"}
              </Link>

              <Link
                to="/doctors"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Stethoscope className="w-5 h-5" /> {translate("nav.doctors") || "Book Doctor"}
              </Link>

              <Link
                to="/drug-checker"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleProtectedClick(e, "/drug-checker");
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ShieldPlus className="w-5 h-5" /> {translate("nav.checker") || "Drug Safety"}
              </Link>

              <Link
                to="/health-records"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleProtectedClick(e, "/health-records");
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FolderOpen className="w-5 h-5" /> {translate("nav.records") || "Health Records"}
              </Link>

              {user && (
                <Link
                  to="/appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <CalendarDays className="w-5 h-5" /> {translate("nav.appointments") || "My Appointments"}
                </Link>
              )}
            </>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-2">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate("/");
                }}
                className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Logout ({user.name})
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2 text-center rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white"
                >
                  Patient Login
                </Link>
                <Link
                  to="/doctor/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2 text-center rounded-xl bg-sky-600 text-white font-bold text-xs"
                >
                  👨‍⚕️ Doctor Portal
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
