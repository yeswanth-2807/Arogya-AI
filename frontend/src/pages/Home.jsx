import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import { Button } from "../components/ui";
import { Activity, Stethoscope } from "lucide-react";

const SPECIALTIES = [
  { name: "Cardiology", icon: "🫀", count: "12 Specialists", desc: "Heart failure, hypertension, ECG, & coronary interventions" },
  { name: "Paediatrics", icon: "👶", count: "15 Specialists", desc: "Child care, neonatology, growth & immunization" },
  { name: "Gastroenterology", icon: "🩺", count: "10 Specialists", desc: "Endoscopy, liver diseases, GERD & digestive health" },
  { name: "Neurology", icon: "🧠", count: "8 Specialists", desc: "Brain, stroke, epilepsy, migraine & nerve disorders" },
  { name: "General Physician", icon: "👨‍⚕️", count: "25 Specialists", desc: "Fever, diabetes, hypertension, & routine health checks" },
  { name: "Dermatology", icon: "✨", count: "7 Specialists", desc: "Skin disorders, eczema, psoriasis & allergy care" },
  { name: "ENT & Head-Neck", icon: "👂", count: "6 Specialists", desc: "Ear, nose, throat, sinus & head-neck surgery" },
  { name: "Emergency Medicine", icon: "🚑", count: "24/7 On Duty", desc: "Immediate trauma, acute pain & critical patient care" },
];

function Home() {
  const { user } = useContext(AuthContext);
  const { translate } = useContext(LanguageContext);
  const navigate = useNavigate();

  const handleProtectedClick = (e, path) => {
    if (!user) {
      e.preventDefault();
      alert("Please login to access this feature.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-transparent space-y-0 transition-colors">
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-32 px-4 sm:px-8 overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
        {/* Transparent gradient to blend into the global background smoothly */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 dark:from-slate-950/40 to-transparent pointer-events-none"></div>
        
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-sky-700 dark:text-sky-300 text-xs sm:text-sm font-bold border border-sky-200 dark:border-sky-400/30 mx-auto shadow-xl">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            {translate("hero.eyebrow") || "24/7 AI-Powered Clinical Care & Specialist Consultation"}
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] drop-shadow-lg">
            {translate("hero.title") || "World-Class Multi-Specialty"} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">Telemedicine Portal</span>
          </h1>

          <p className="text-slate-700 dark:text-slate-200 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-sm dark:drop-shadow">
            {translate("hero.subtitle") || "Verified specialist bookings, secure electronic health records, online video consultation, and prescription drug safety checks."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 pt-8 pb-4">
            <Link to="/symptom-checker" onClick={(e) => handleProtectedClick(e, "/symptom-checker")}>
              <Button variant="teal" className="flex items-center gap-2.5 text-base py-4 px-10 font-bold shadow-2xl shadow-teal-600/40 hover:shadow-teal-600/60 hover:-translate-y-1 transition-all duration-300 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-900 border-none">
                <Activity className="w-5 h-5" /> {translate("hero.ctaPrimary") || "AI Symptom Assessment"}
              </Button>
            </Link>
            <Link to="/doctors">
              <Button variant="primary" className="flex items-center gap-2.5 text-base py-4 px-10 font-bold shadow-2xl shadow-sky-600/30 hover:shadow-sky-600/50 hover:-translate-y-1 transition-all duration-300 rounded-full bg-sky-600 hover:bg-sky-500 text-white border-none">
                <Stethoscope className="w-5 h-5" /> {translate("hero.ctaSecondary") || "Book Doctor Consultation"}
              </Button>
            </Link>
          </div>

          {/* Hospital Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 mt-12 max-w-4xl mx-auto">
            {[
              { val: "50,000+", label: "Patients Consulted" },
              { val: "150+", label: "Senior Doctors" },
              { val: "24/7", label: "Emergency Desk" },
              { val: "18+", label: "Medical Departments" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-700/50 shadow-lg transition-transform hover:-translate-y-1">
                <span className="block text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-sky-300">{stat.val}</span>
                <span className="text-xs sm:text-sm text-slate-300 font-medium mt-1 block">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Your Digital Healthcare Journey</h2>
        </div>

        <div className="grid sm:grid-cols-4 gap-6">
          {[
            { step: "01", icon: "📝", title: "Register", desc: "Sign up with your mobile number and password. Receive your permanent Patient ID (PAT-XXXXXX)." },
            { step: "02", icon: "🤖", title: "AI Symptom Triage", desc: "Describe symptoms to get AI-driven preliminary assessment and specialist recommendations." },
            { step: "03", icon: "🩺", title: "Book & Pay", desc: "Select your doctor, choose a time slot, and complete secure payment via UPI / Card / Net Banking." },
            { step: "04", icon: "🎥", title: "Video Consult", desc: "Enter the live video consultation room. Get prescriptions, lab orders, and follow-up schedule." },
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-3 relative">
              <span className="absolute -top-3 left-4 bg-sky-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                Step {item.step}
              </span>
              <div className="text-3xl pt-2">{item.icon}</div>
              <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CLINICAL SPECIALTIES DIRECTORY */}
      <section className="bg-white dark:bg-slate-900 py-16 px-4 sm:px-8 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
              Hospital Departments
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Medical & Surgical Specialties</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Select a department to find senior consultant physicians and book consultations.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SPECIALTIES.map((spec, i) => (
              <Link
                key={i}
                to={`/doctors?spec=${encodeURIComponent(spec.name)}`}
                className="bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 group transition-all hover:border-sky-400 dark:hover:border-sky-600 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform shadow-xs">
                    {spec.icon}
                  </span>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950 px-2.5 py-1 rounded-full">
                    {spec.count}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {spec.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{spec.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section className="bg-slate-900 dark:bg-slate-950 text-white py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400 bg-sky-500/20 px-3 py-1 rounded-full">
              Digital Patient Care
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Integrated Telemedicine Services</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🤖", color: "teal", title: "AI Symptom Diagnostic Checker", desc: "Evaluate symptoms using our 18-condition clinical rule engine, receive confidence scores, and get matched to the right specialist.", link: "/symptom-checker", cta: "Launch Symptom Checker →" },
              { icon: "💊", color: "sky", title: "Drug Interaction Safety Check", desc: "Upload prescriptions or enter medicines manually to check for potential adverse drug-drug interactions and contraindications.", link: "/drug-checker", cta: "Check Drug Safety →" },
              { icon: "📂", color: "amber", title: "Secure Health Record Vault", desc: "Upload and store lab test reports, prescription documents, and imaging records securely for instant doctor reviews.", link: "/health-records", cta: "Manage Health Records →" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-2xl font-bold">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
                <Link
                  to={item.link}
                  onClick={(e) => handleProtectedClick(e, item.link)}
                  className="inline-block text-xs font-bold text-sky-400 hover:underline"
                >
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
