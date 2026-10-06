import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/client";
import { Button, Input, Card } from "../components/ui";
import IdCard from "../components/IdCard";

function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search Patient History state
  const [searchPatientId, setSearchPatientId] = useState("");
  const [patientRecord, setPatientRecord] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Prescription Modal State
  const [showRxModal, setShowRxModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rxMedicines, setRxMedicines] = useState([
    { name: "Paracetamol", dosage: "650 mg", frequency: "1-0-1 (Twice daily)", duration: "5 days", instructions: "After meals" },
  ]);
  const [rxNotes, setRxNotes] = useState("Rest adequately and stay hydrated.");
  const [rxFollowUp, setRxFollowUp] = useState("");
  const [rxSubmitting, setRxSubmitting] = useState(false);

  // Manage Availability State
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [activeDayTab, setActiveDayTab] = useState("Monday");
  const [availabilityForm, setAvailabilityForm] = useState({
    availableTime: user?.availableTime || "10:00 AM - 05:00 PM",
    weeklySchedule: user?.weeklySchedule || {
      Monday: ["09:00 AM", "11:00 AM"], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    },
    isAvailable: user?.isAvailable !== undefined ? user.isAvailable : true,
  });
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false);

  // Edit Profile State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    specialty: user?.specialty || "",
    qualification: user?.qualification || "",
    hospital: user?.hospital || "",
    experience: user?.experience || "",
    fee: user?.fee || 500,
    rating: user?.rating || 4.8,
  });
  const [profileUpdating, setProfileUpdating] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "doctor") {
      alert("Doctor authorization required.");
      navigate("/doctor/login");
      return;
    }

    fetchDoctorAppointments();
  }, [user]);

  const fetchDoctorAppointments = async () => {
    try {
      const data = await api.getDoctorAppointments(user._id);
      setAppointments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search Patient Medical History by Patient ID
  const handleSearchPatientHistory = async (e, customId) => {
    if (e) e.preventDefault();
    const query = customId || searchPatientId;
    if (!query.trim()) return;

    setSearchLoading(true);
    setSearchError("");
    setPatientRecord(null);

    try {
      const res = await api.searchPatientHistory(query);
      setPatientRecord(res);
    } catch (err) {
      setSearchError(err.message || "No patient records found.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Doctor joins video consultation
  const handleJoinVideoRoom = async (apt) => {
    // 5-minute time lock check
    const [timeStr, modifier] = apt.time.split(" ");
    let [hours, minutes] = timeStr.split(":");
    hours = parseInt(hours, 10);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    
    const aptDate = new Date(`${apt.date}T00:00:00`);
    aptDate.setHours(hours, parseInt(minutes, 10), 0, 0);

    const now = new Date();
    if (aptDate.getTime() - now.getTime() > 300000) { // > 5 minutes
      alert(`You can only join the consultation 5 minutes before the scheduled time.\n\nAppointment is scheduled for: ${apt.date} at ${apt.time}`);
      return;
    }

    try {
      // Set room status active so patient in waiting room gets auto-connected
      await api.updateAppointmentStatus(apt._id, { roomStatus: "active" });
      navigate(`/consultation/${apt._id}`);
    } catch (err) {
      alert("Error joining video room: " + err.message);
    }
  };

  // Open Prescription Modal
  const handleOpenRxModal = (apt) => {
    setSelectedAppointment(apt);
    setRxFollowUp("");
    setShowRxModal(true);
  };

  // Add Prescription Medicine line item
  const handleAddMedicineLine = () => {
    setRxMedicines((prev) => [
      ...prev,
      { name: "", dosage: "", frequency: "1-0-1", duration: "3 days", instructions: "After meals" },
    ]);
  };

  const handleMedicineChange = (index, field, value) => {
    setRxMedicines((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleRemoveMedicineLine = (index) => {
    setRxMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Prescription
  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    if (rxMedicines.some((m) => !m.name.trim())) {
      alert("Please specify medicine names for all prescription items.");
      return;
    }

    setRxSubmitting(true);
    try {
      const patientId = selectedAppointment.patientId._id || selectedAppointment.patientId;
      await api.createPrescription({
        appointmentId: selectedAppointment._id,
        patientId,
        doctorId: user._id,
        medicines: rxMedicines,
        notes: rxNotes,
        followUpDays: rxFollowUp || "",
      });

      alert("Digital Prescription submitted & saved to database successfully!");
      setShowRxModal(false);
      fetchDoctorAppointments();
    } catch (err) {
      alert("Error submitting prescription: " + err.message);
    } finally {
      setRxSubmitting(false);
    }
  };

  const handleUpdateAvailability = async (e) => {
    if (e) e.preventDefault();
    setAvailabilityUpdating(true);
    try {
      const updatedDoctor = await api.updateDoctor(user._id, {
        availableTime: availabilityForm.availableTime,
        weeklySchedule: availabilityForm.weeklySchedule,
        isAvailable: availabilityForm.isAvailable,
      });
      alert("Availability updated successfully! Changes will be visible to patients.");
      setShowAvailabilityModal(false);
      // Optional: update local context if needed
    } catch (err) {
      alert("Error updating availability: " + err.message);
    } finally {
      setAvailabilityUpdating(false);
    }
  };

  const handleMarkAbsent = async () => {
    if (!window.confirm("Are you sure you want to mark yourself as Absent? This will clear your current slots and update immediately.")) return;
    setAvailabilityUpdating(true);
    try {
      const emptySchedule = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] };
      await api.updateDoctor(user._id, {
        availableTime: "Absent",
        weeklySchedule: emptySchedule,
        isAvailable: false,
      });
      setAvailabilityForm({ availableTime: "Absent", weeklySchedule: emptySchedule, isAvailable: false });
      alert("You have been marked Absent! Patients can no longer book you.");
      setShowAvailabilityModal(false);
    } catch (err) {
      alert("Error updating availability: " + err.message);
    } finally {
      setAvailabilityUpdating(false);
    }
  };

  const handleMarkPresent = async () => {
    if (!window.confirm("Restore default availability? This will set your time to 10:00 AM - 05:00 PM.")) return;
    setAvailabilityUpdating(true);
    const defaultSlots = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"];
    const defaultSchedule = { Monday: defaultSlots, Tuesday: defaultSlots, Wednesday: defaultSlots, Thursday: defaultSlots, Friday: defaultSlots, Saturday: [], Sunday: [] };
    try {
      await api.updateDoctor(user._id, {
        availableTime: "10:00 AM - 05:00 PM",
        weeklySchedule: defaultSchedule,
        isAvailable: true,
      });
      setAvailabilityForm({ availableTime: "10:00 AM - 05:00 PM", weeklySchedule: defaultSchedule, isAvailable: true });
      alert("You are now marked Present and available for booking!");
      setShowAvailabilityModal(false);
    } catch (err) {
      alert("Error updating availability: " + err.message);
    } finally {
      setAvailabilityUpdating(false);
    }
  };

  const [slotDuration, setSlotDuration] = useState(15);

  const generateSlots = () => {
    const timeRange = availabilityForm.availableTime.split("-");
    if (timeRange.length !== 2) {
      alert("Please enter time range in format 'HH:MM AM/PM - HH:MM AM/PM' (e.g., 05:00 PM - 09:00 PM)");
      return;
    }
    
    const parseTime = (timeStr) => {
      const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return null;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const formatTime = (totalMinutes) => {
      let hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      if (hours === 0) hours = 12;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const startMins = parseTime(timeRange[0]);
    const endMins = parseTime(timeRange[1]);

    if (startMins === null || endMins === null || startMins >= endMins) {
      alert("Invalid time range. Ensure it looks like '05:00 PM - 09:00 PM' and start time is before end time.");
      return;
    }

    const slots = [];
    let currentMins = startMins;
    while (currentMins < endMins) {
      slots.push(formatTime(currentMins));
      currentMins += Number(slotDuration);
    }

    setAvailabilityForm({ 
      ...availabilityForm, 
      weeklySchedule: { ...availabilityForm.weeklySchedule, [activeDayTab]: slots },
      isAvailable: true 
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileUpdating(true);
    try {
      await api.updateDoctor(user._id, {
        name: profileForm.name,
        specialty: profileForm.specialty,
        qualification: profileForm.qualification,
        hospital: profileForm.hospital,
        experience: profileForm.experience,
        fee: Number(profileForm.fee),
        rating: Number(profileForm.rating)
      });
      alert("Profile updated successfully!");
      setShowProfileModal(false);
    } catch (err) {
      alert("Error updating profile: " + err.message);
    } finally {
      setProfileUpdating(false);
    }
  };

  if (!user || user.role !== "doctor") return null;

  return (
    <div className="min-h-screen bg-transparent py-6 sm:py-8 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Doctor Banner & Profile Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-600/10 text-sky-600 dark:text-sky-400 border border-sky-400/30 flex items-center justify-center text-3xl font-bold flex-shrink-0">
              👨‍⚕️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold">{user.name}</h1>
                <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  ✓ Verified Doctor
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                {user.specialty} · {user.hospital}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400 mt-2">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">ID: {user.doctorId}</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Fee: ₹{user.fee}</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Rating: ⭐ 4.9</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block ml-4">
             <IdCard user={user} type="Doctor" />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex-1 sm:flex-initial text-xs font-bold py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={() => setShowAvailabilityModal(true)}
              className="flex-1 sm:flex-initial text-xs font-bold py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              ⚙️ Manage Availability
            </button>
          </div>
        </div>

        {/* Section 1: Patient Medical Records Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <div>
              <h2 className="text-base font-extrabold">Authorised Patient Medical Records Lookup</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter Patient ID (e.g., <strong className="text-sky-500 font-mono">PAT-849204</strong>) or Mobile Number to pull patient history, lab reports, AI checker results, and past prescriptions.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearchPatientHistory} className="flex gap-2 max-w-xl">
            <Input
              value={searchPatientId}
              onChange={(e) => setSearchPatientId(e.target.value)}
              placeholder="Search Patient ID or Phone Number..."
              required
            />
            <Button type="submit" variant="teal" disabled={searchLoading} className="font-bold flex-shrink-0">
              {searchLoading ? "Searching..." : "Search Patient Records"}
            </Button>
          </form>

          {searchError && (
            <div className="bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs p-3 rounded-xl font-semibold">
              ⚠️ {searchError}
            </div>
          )}

          {/* Searched Patient Clinical Summary View */}
          {patientRecord && (
            <div className="mt-4 bg-transparent rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-lg text-sky-600 dark:text-sky-400">
                    Patient Medical History: {patientRecord.patient.name} {patientRecord.patient.relation && patientRecord.patient.relation !== "Primary" && <span className="text-xs uppercase bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full tracking-wider align-middle ml-2">{patientRecord.patient.relation}</span>}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Patient ID: {patientRecord.patient.patientId} · Gender: {patientRecord.patient.gender} · Age: {patientRecord.patient.age || "N/A"} · Phone: {patientRecord.patient.phone}
                  </p>
                </div>
                <button
                  onClick={() => setPatientRecord(null)}
                  className="text-xs font-bold text-slate-400 hover:text-red-500"
                >
                  ✕ Close Record
                </button>
              </div>

              {/* 4 History Sub-Tabs */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* AI Symptom History */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-xs text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🤖</span> AI Symptom Checker Results ({patientRecord.symptomChecks?.length || 0})
                  </h4>
                  {patientRecord.symptomChecks?.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {patientRecord.symptomChecks.map((sc, i) => (
                        <div key={i} className="text-xs p-2.5 rounded-lg bg-transparent space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white">Symptoms: {sc.symptoms?.join(", ")}</p>
                          <p className="text-slate-500">Condition: <strong>{sc.results?.[0]?.name}</strong> ({sc.results?.[0]?.confidence}% confidence)</p>
                          <p className="text-[10px] text-slate-400">{new Date(sc.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No AI symptom assessments logged yet.</p>
                  )}
                </div>

                {/* Lab & Health Records */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-xs text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📂</span> Uploaded Lab & Medical Reports ({patientRecord.healthRecords?.length || 0})
                  </h4>
                  {patientRecord.healthRecords?.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {patientRecord.healthRecords.map((hr, i) => (
                        <div key={i} className="text-xs p-2.5 rounded-lg bg-transparent flex items-center justify-between">
                          <div>
                            <p className="font-bold">{hr.notes || "Lab Document"}</p>
                            <p className="text-[10px] text-slate-400">{new Date(hr.uploadedAt).toLocaleDateString()}</p>
                          </div>
                          <a href={`http://localhost:5000${hr.fileUrl}`} target="_blank" rel="noreferrer" className="text-sky-500 font-bold hover:underline">
                            Open 📄
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No uploaded lab documents available.</p>
                  )}
                </div>

                {/* Prescription History */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 md:col-span-2">
                  <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📋</span> Prescription History ({patientRecord.prescriptions?.length || 0})
                  </h4>
                  {patientRecord.prescriptions?.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                      {patientRecord.prescriptions.map((rx, i) => (
                        <div key={i} className="text-xs p-3 rounded-xl bg-transparent border border-slate-200 dark:border-slate-800 space-y-1">
                          <div className="flex justify-between font-bold">
                            <span>Prescription {rx.prescriptionId}</span>
                            <span className="text-slate-400">{rx.date}</span>
                          </div>
                          <p className="text-slate-500">Doctor: {rx.doctorName} ({rx.doctorSpecialty})</p>
                          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                            {rx.medicines?.map((m) => `${m.name} (${m.dosage})`).join(", ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No prior digital prescriptions recorded.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Doctor Appointments Workspace */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold">Patient Appointments & Telemedicine Queue</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live consultations scheduled with you. Conduct video consultations or issue digital prescriptions.
              </p>
            </div>
            <span className="bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 text-xs font-extrabold px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
              {appointments.length} Total Bookings
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading your clinical appointment queue...
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <div className="text-4xl">🗓️</div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">No appointments booked yet</h3>
              <p>When patients book consultations with you, their details will automatically appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => {
                const patient = apt.patientId || {};
                const customId = apt.patientCustomId || patient.patientId || "PAT-XXXXXX";

                return (
                  <div
                    key={apt._id}
                    className="bg-transparent rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all hover:border-sky-400"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          {apt.patientName || patient.name || "Patient"}
                        </span>
                        <span className="bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                          ID: {customId}
                        </span>
                        <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                          Apt ID: {apt.appointmentId || "APT-001"}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          apt.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : apt.status === "cancelled"
                            ? "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30"
                            : "bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30"
                        }`}>
                          ● {apt.status?.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        🗓️ {apt.date} at ⏰ {apt.time} · Reason: {apt.reason}
                      </p>
                      {apt.medicalDocuments && apt.medicalDocuments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {apt.medicalDocuments.map((docUrl, i) => (
                            <a 
                              key={i} 
                              href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${docUrl.replace('/api', '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                            >
                              📄 Attached File {i + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                      <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        <button
                          onClick={() => handleSearchPatientHistory(null, customId)}
                          className="flex-1 lg:flex-initial text-xs font-bold py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
                        >
                          🔍 View Medical History
                        </button>

                        <button
                          onClick={() => handleOpenRxModal(apt)}
                          className="flex-1 lg:flex-initial text-xs font-bold py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors"
                        >
                          💊 Write Prescription
                        </button>

                        <button
                          onClick={() => handleJoinVideoRoom(apt)}
                          disabled={apt.status === "COMPLETED"}
                          className={`flex-1 lg:flex-initial text-xs font-bold py-2 px-3 rounded-xl shadow-sm transition-colors ${
                            apt.status === "COMPLETED"
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
                              : "bg-sky-600 hover:bg-sky-500 text-white"
                          }`}
                        >
                          {apt.status === "COMPLETED" ? "✅ Consultation Ended" : "🎥 Join Consultation Room"}
                        </button>
                      </div>
                    </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Write Prescription Modal */}
      {showRxModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <span>📋</span> Digital Prescription Submission
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: <strong>{selectedAppointment.patientName || selectedAppointment.patientId?.name}</strong> (ID: {selectedAppointment.patientCustomId || selectedAppointment.patientId?.patientId})
                </p>
              </div>
              <button onClick={() => setShowRxModal(false)} className="text-slate-400 font-bold hover:text-red-500">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold">Medicines & Dosage Instructions</label>
                  <button
                    type="button"
                    onClick={handleAddMedicineLine}
                    className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    + Add Medicine
                  </button>
                </div>

                {rxMedicines.map((med, idx) => (
                  <div key={idx} className="bg-transparent p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <Input
                        placeholder="Medicine Name (e.g. Amoxicillin)"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(idx, "name", e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Dosage (e.g. 500 mg)"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, "dosage", e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Frequency (e.g. 1-0-1)"
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(idx, "frequency", e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Duration (e.g. 5 days)"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(idx, "duration", e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Instructions (e.g. Take after meals with lukewarm water)"
                        value={med.instructions}
                        onChange={(e) => handleMedicineChange(idx, "instructions", e.target.value)}
                      />
                      {rxMedicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicineLine(idx)}
                          className="text-red-500 font-bold text-xs p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Doctor Clinical Advice / Notes</label>
                <textarea
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500"
                  placeholder="Additional patient instructions or lifestyle recommendations..."
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Schedule Automatic Follow-up</label>
                <select
                  value={rxFollowUp}
                  onChange={(e) => setRxFollowUp(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="">No Follow-up Needed</option>
                  <option value="3">In 3 Days</option>
                  <option value="7">In 1 Week</option>
                  <option value="14">In 2 Weeks</option>
                  <option value="30">In 1 Month</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="teal" disabled={rxSubmitting} className="flex-1 font-bold">
                  {rxSubmitting ? "Submitting E-Prescription..." : "✍️ Submit Prescription to Patient"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowRxModal(false)} className="font-bold">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">⚙️ Manage Availability</h3>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="text-slate-400 hover:text-red-500 font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateAvailability} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">Available Time Range</label>
                <div className="flex gap-2">
                  <Input
                    value={availabilityForm.availableTime}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, availableTime: e.target.value })}
                    placeholder="e.g. 05:00 PM - 09:00 PM"
                    required
                    className="flex-1"
                  />
                  {!availabilityForm.isAvailable ? (
                    <Button type="button" variant="outline" onClick={handleMarkPresent} className="whitespace-nowrap text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                      Mark Present
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" onClick={handleMarkAbsent} className="whitespace-nowrap text-red-500 border-red-200 hover:bg-red-50">
                      Mark Absent
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-black text-sky-600 dark:text-sky-400">⚡ Auto-Generate Slots</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(e.target.value)}
                    placeholder="Mins (e.g. 15)"
                    className="w-24"
                    min="5"
                  />
                  <span className="text-xs font-bold text-slate-500">minutes per slot</span>
                  <div className="flex-1"></div>
                  <Button type="button" variant="teal" onClick={generateSlots} className="py-2 text-xs">
                    Generate
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-slate-300">Weekly Schedule</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => setActiveDayTab(day)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-colors ${activeDayTab === day ? "bg-sky-600 text-white border-sky-600" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"}`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <label className="block text-[10px] font-bold mb-1 text-slate-500">{activeDayTab}'s Specific Time Slots (comma-separated)</label>
                <textarea
                  value={availabilityForm.weeklySchedule[activeDayTab]?.join(", ") || ""}
                  onChange={(e) => {
                    const newArr = e.target.value.split(",").map(s => s.trim()).filter(s => s);
                    setAvailabilityForm({
                      ...availabilityForm,
                      weeklySchedule: { ...availabilityForm.weeklySchedule, [activeDayTab]: newArr }
                    });
                  }}
                  placeholder="e.g. 09:00 AM, 09:15 AM, 09:30 AM"
                  rows={3}
                  className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500"
                  required={availabilityForm.isAvailable && activeDayTab === "Monday"}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="isAvailable"
                      checked={availabilityForm.isAvailable === true}
                      onChange={() => setAvailabilityForm({ ...availabilityForm, isAvailable: true })}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    Present (Available)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="isAvailable"
                      checked={availabilityForm.isAvailable === false}
                      onChange={() => setAvailabilityForm({ ...availabilityForm, isAvailable: false })}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    Absent (Unavailable)
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" disabled={availabilityUpdating} className="flex-1 font-bold bg-sky-600 hover:bg-sky-500 text-white">
                  {availabilityUpdating ? "Saving..." : "Save Availability"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAvailabilityModal(false)} className="font-bold">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">✏️ Edit Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-red-500 font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-left">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">Name</label>
                  <Input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">Specialty</label>
                  <Input
                    value={profileForm.specialty}
                    onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">Qualification (Degrees)</label>
                  <Input
                    value={profileForm.qualification}
                    onChange={(e) => setProfileForm({ ...profileForm, qualification: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">Experience</label>
                  <Input
                    value={profileForm.experience}
                    onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">Hospital/Clinic Name</label>
                  <Input
                    value={profileForm.hospital}
                    onChange={(e) => setProfileForm({ ...profileForm, hospital: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">Consultation Fee (₹)</label>
                  <Input
                    type="number"
                    value={profileForm.fee}
                    onChange={(e) => setProfileForm({ ...profileForm, fee: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">Profile Rating (0.0 to 5.0)</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={profileForm.rating}
                  onChange={(e) => setProfileForm({ ...profileForm, rating: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" disabled={profileUpdating} className="flex-1 font-bold bg-sky-600 hover:bg-sky-500 text-white">
                  {profileUpdating ? "Saving..." : "Save Profile"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowProfileModal(false)} className="font-bold">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
