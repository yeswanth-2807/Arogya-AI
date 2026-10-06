import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/client";
import { Button } from "../components/ui";

function Appointments() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected prescription modal for printable view
  const [selectedRx, setSelectedRx] = useState(null);

  useEffect(() => {
    if (!user) {
      alert("Please login to access this feature.");
      navigate("/login");
      return;
    }

    fetchPatientData();
  }, [user]);

  const fetchPatientData = async () => {
    try {
      const patientId = user._id || user.id;
      const [aptData, rxData] = await Promise.all([
        api.getPatientAppointments(patientId),
        api.getPatientPrescriptions(patientId),
      ]);

      setAppointments(aptData || []);
      setPrescriptions(rxData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (aptId, isDoctorFault = false) => {
    let reason = "Doctor Missed Appointment";
    if (!isDoctorFault) {
      const userReason = window.prompt("Please provide a reason for cancellation:\n(e.g., Schedule conflict, Personal reason)", "Personal reason");
      if (userReason === null) return; // User cancelled prompt
      reason = userReason;
    }

    try {
      const res = await api.cancelAppointment(aptId, { reason, initiator: "PATIENT" });
      alert(res.message || "Appointment cancelled. A refund has been initiated if eligible.");
      fetchPatientData();
    } catch (err) {
      alert("Cancellation failed: " + err.message);
    }
  };

  const handleReschedule = async (aptId) => {
    const newDate = window.prompt("Enter new date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!newDate) return;
    const newTime = window.prompt("Enter new time (HH:MM):", "14:00");
    if (!newTime) return;

    if (!window.confirm(`Reschedule to ${newDate} at ${newTime}?`)) return;

    try {
      const res = await api.rescheduleAppointment(aptId, { newDate, newTime });
      alert(res.message || "Appointment rescheduled.");
      fetchPatientData();
    } catch (err) {
      alert("Rescheduling failed: " + err.message);
    }
  };

  const getRefundBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case "REFUND_PENDING":
        return <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">⌛ Refund Pending</span>;
      case "REFUNDED":
        return <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">💰 Refunded</span>;
      case "REFUND_FAILED":
        return <span className="bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">❌ Refund Failed</span>;
      default:
        return null;
    }
  };

  if (!user) return null;

  const handleJoinVideoRoom = (apt) => {
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
    navigate(`/consultation/${apt._id}`);
  };

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-white transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
              Patient Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">My Telemedicine Consultations & Prescriptions</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Patient: <strong>{user.name}</strong> · ID: <strong className="font-mono text-sky-600 dark:text-sky-400">{user.patientId}</strong>
            </p>
          </div>

          <Link to="/doctors">
            <Button variant="teal" className="font-bold text-xs py-3 px-5">
              + Book New Doctor Consultation
            </Button>
          </Link>
        </div>

        {/* Appointments Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold">Scheduled Consultations</h2>

          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading consultations...
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 space-y-3">
              <div className="text-4xl">🗓️</div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">No consultation appointments booked</h3>
              <p className="text-xs text-slate-400">Search available senior doctors to schedule your first online video consultation.</p>
              <Link to="/doctors">
                <Button variant="primary" className="font-bold text-xs mt-2 bg-sky-600 hover:bg-sky-500">Find Doctor</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => {
                const doc = apt.doctorId || {};
                return (
                  <div
                    key={apt._id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {doc.name || apt.doctorName || "Doctor"}
                        </h3>
                        <span className="bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          {doc.specialty || "Specialist"}
                        </span>
                        {apt.patientName && (
                          <span className="bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-fuchsia-200 dark:border-fuchsia-800">
                            For: {apt.patientName}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          apt.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : apt.status === "cancelled"
                            ? "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30"
                            : "bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30"
                        }`}>
                          ● {apt.status?.toUpperCase()}
                        </span>
                        {getRefundBadge(apt.paymentStatus)}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        🗓️ Date: {apt.date} at ⏰ {apt.time} · Hospital: {doc.hospital || "Arogya Hospital"}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        Appointment ID: {apt.appointmentId || "APT-000"} · Reason: {apt.reason}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      {["BOOKED", "CONFIRMED"].includes(apt.status) && (
                        <>
                          <button
                            onClick={() => handleJoinVideoRoom(apt)}
                            className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm"
                          >
                            🎥 Join Consultation
                          </button>
                          <button
                            onClick={() => handleReschedule(apt._id)}
                            className="py-2.5 px-3 rounded-xl border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950 font-bold text-xs"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(apt._id)}
                            className="py-2.5 px-3 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 font-bold text-xs"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      
                      {apt.status === "MISSED_BY_PATIENT" && (
                        <div className="flex gap-2">
                          <Link to="/doctors">
                            <button
                              className="py-2.5 px-3 rounded-xl bg-sky-100 text-sky-700 font-bold text-xs hover:bg-sky-200"
                            >
                              Book New (Payment Required)
                            </button>
                          </Link>
                        </div>
                      )}
                      
                      {apt.status === "MISSED_BY_DOCTOR" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReschedule(apt._id)}
                            className="py-2.5 px-3 rounded-xl bg-sky-100 text-sky-700 font-bold text-xs"
                          >
                            Reschedule (Free)
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(apt._id, true)}
                            className="py-2.5 px-3 rounded-xl bg-red-100 text-red-700 font-bold text-xs"
                          >
                            Cancel (Full Refund)
                          </button>
                        </div>
                      )}

                      {apt.status === "PENDING_FOLLOW_UP" && (
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              if (window.confirm("Pay ₹500 to confirm your follow-up appointment?")) {
                                try {
                                  await api.updateAppointmentStatus(apt._id, { status: "BOOKED", paymentStatus: "PAID" });
                                  alert("Payment successful! Follow-up confirmed.");
                                  fetchPatientData();
                                } catch (e) {
                                  alert("Error: " + e.message);
                                }
                              }
                            }}
                            className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm"
                          >
                            💳 Confirm & Pay Follow-up Fee
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Prescriptions Section */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-extrabold">Digital Prescriptions ({prescriptions.length})</h2>

          {prescriptions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 text-xs">
              No digital prescriptions issued yet. Once your doctor submits an e-prescription during or after consultation, it will appear here.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {prescriptions.map((rx) => (
                <div
                  key={rx._id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm hover:border-teal-500 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400">
                        {rx.prescriptionId}
                      </span>
                      <h4 className="font-extrabold text-sm">{rx.doctorName}</h4>
                      <p className="text-[10px] text-slate-400">{rx.doctorSpecialty} · {rx.date}</p>
                    </div>
                    <button
                      onClick={() => setSelectedRx(rx)}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 font-bold text-xs hover:bg-teal-100"
                    >
                      🖨️ View & Print
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Prescribed Medications:</p>
                    {rx.medicines?.map((m, idx) => (
                      <div key={idx} className="bg-transparent p-2 rounded-xl text-xs flex items-center justify-between">
                        <span className="font-bold text-sky-600 dark:text-sky-400">{m.name} ({m.dosage})</span>
                        <span className="text-[10px] text-slate-400 font-mono">{m.frequency} · {m.duration}</span>
                      </div>
                    ))}
                  </div>

                  {rx.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-transparent p-2 rounded-xl">
                      "{rx.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Printable Digital Prescription Modal */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white text-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative border-4 border-teal-600 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold text-lg"
            >
              ✕
            </button>

            {/* Prescription Letterhead Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-sky-900">AROGYA MULTI-SPECIALTY HOSPITAL</h2>
                <p className="text-xs text-slate-600 font-semibold">Telemedicine & Digital Health Center</p>
                <p className="text-[10px] text-slate-500">24/7 Helpline: 108 · License No: HOS-IN-2026</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-teal-700">{selectedRx.prescriptionId}</span>
                <p className="text-xs font-bold text-slate-800">{selectedRx.date}</p>
              </div>
            </div>

            {/* Doctor & Patient Information */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-500 text-[10px]">CONSULTANT PHYSICIAN</p>
                <p className="font-extrabold text-slate-900">{selectedRx.doctorName}</p>
                <p className="text-slate-600">{selectedRx.doctorSpecialty}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px]">PATIENT DETAILS</p>
                <p className="font-extrabold text-slate-900">{selectedRx.patientName}</p>
                <p className="text-slate-600 font-mono">Patient ID: {selectedRx.patientCustomId}</p>
              </div>
            </div>

            {/* Medicines List Rx Symbol */}
            <div className="space-y-3">
              <span className="text-3xl font-serif font-black text-teal-800">℞</span>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600">
                    <th className="py-2">Medicine Name</th>
                    <th className="py-2">Dosage</th>
                    <th className="py-2">Frequency</th>
                    <th className="py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRx.medicines?.map((m, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2 font-bold text-slate-900">{m.name}</td>
                      <td className="py-2 text-slate-700">{m.dosage}</td>
                      <td className="py-2 font-mono text-slate-700">{m.frequency}</td>
                      <td className="py-2 text-slate-700">{m.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes & Doctor Stamp */}
            {selectedRx.notes && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-700">Doctor Advice:</p>
                <p className="text-slate-600">{selectedRx.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-[10px] text-slate-400">Digitally Verified E-Prescription</span>
              <button
                onClick={() => window.print()}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                🖨️ Print Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;
