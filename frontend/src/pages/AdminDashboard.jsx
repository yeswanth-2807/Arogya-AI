import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { Users, UserPlus, Stethoscope, Activity, Trash2, ShieldCheck, Edit, IndianRupee } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { tab } = useParams();

  const [stats, setStats] = useState({ 
    doctors: 0, patients: 0, appointments: 0, revenue: 0, 
    revenueByDay: [], appointmentsBySpecialty: [] 
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState({ gracePeriodMinutes: 15, missedAppointmentRefundPolicy: "NO_REFUND" });
  
  const activeTab = tab || "overview";

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, docRes, patRes, refRes, auditRes, settingsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/doctors"),
        api.get("/admin/patients"),
        api.get("/admin/refunds"),
        api.get("/admin/audit-logs"),
        api.get("/admin/settings")
      ]);
      setStats({
        doctors: statsRes.totalDoctors,
        patients: statsRes.totalPatients,
        appointments: statsRes.totalAppointments,
        revenue: statsRes.revenue,
        revenueByDay: statsRes.revenueByDay || [],
        appointmentsBySpecialty: statsRes.appointmentsBySpecialty || []
      });
      setDoctors(docRes);
      setPatients(patRes);
      setRefunds(refRes);
      setAuditLogs(auditRes);
      if (settingsRes) setSettings(settingsRes);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await api.put("/admin/settings", settings);
      alert(res.message || "Settings updated successfully!");
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    }
  };

  const toggleDoctorVerification = async (id, currentStatus) => {
    try {
      await api.put(`/doctors/${id}/verify`, { isVerified: !currentStatus });
      fetchData(); // Refresh the list
    } catch (err) {
      alert("Failed to update verification status: " + err.message);
    }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm("Are you sure you want to completely remove this doctor?")) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      setDoctors(doctors.filter(d => d._id !== id));
    } catch (err) {
      alert("Failed to delete doctor.");
    }
  };

  const editDoctor = async (doc) => {
    const newName = window.prompt("Enter new name for Doctor:", doc.name);
    if (!newName) return;
    const newSpec = window.prompt("Enter new specialty:", doc.specialty);
    try {
      const res = await api.put(`/admin/doctors/${doc._id}`, { name: newName, specialty: newSpec || doc.specialty });
      setDoctors(doctors.map(d => d._id === doc._id ? res : d));
    } catch (err) {
      alert("Failed to update doctor.");
    }
  };

  const deletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to completely remove this patient?")) return;
    try {
      await api.delete(`/admin/patients/${id}`);
      setPatients(patients.filter(p => p._id !== id));
    } catch (err) {
      alert("Failed to delete patient.");
    }
  };

  const editPatient = async (pat) => {
    const newName = window.prompt("Enter new name for Patient:", pat.name);
    if (!newName) return;
    const newPhone = window.prompt("Enter new phone number:", pat.phone);
    try {
      const res = await api.put(`/admin/patients/${pat._id}`, { name: newName, phone: newPhone || pat.phone });
      setPatients(patients.map(p => p._id === pat._id ? res : p));
    } catch (err) {
      alert("Failed to update patient.");
    }
  };

  const processRefund = async (id) => {
    if (!window.confirm("Approve and execute this refund via the payment gateway?")) return;
    try {
      const res = await api.approveRefund(id);
      alert(res.message);
      fetchData();
    } catch (err) {
      alert("Refund failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 text-slate-900 dark:text-white transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 p-3 rounded-xl text-red-500 border border-red-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Yeswanth's Admin Control Center</h1>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">System Overview & Management</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate("/doctor/login"); }} className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-all border border-transparent dark:hover:border-red-800/50">
            Secure Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {['overview', 'doctors', 'patients', 'refunds', 'settings', 'audit'].map(t => (
            <button
              key={t}
              onClick={() => navigate(`/admin/${t}`)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${activeTab === t ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"}`}
            >
              {t} Management
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                <Stethoscope className="w-8 h-8 text-sky-500 mb-2" />
                <div className="text-3xl font-black">{stats.doctors}</div>
                <div className="text-xs font-bold text-slate-500 uppercase mt-1">Total Doctors</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                <Users className="w-8 h-8 text-teal-500 mb-2" />
                <div className="text-3xl font-black">{stats.patients}</div>
                <div className="text-xs font-bold text-slate-500 uppercase mt-1">Total Patients</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                <Activity className="w-8 h-8 text-indigo-500 mb-2" />
                <div className="text-3xl font-black">{stats.appointments}</div>
                <div className="text-xs font-bold text-slate-500 uppercase mt-1">Appointments</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                <IndianRupee className="w-8 h-8 text-emerald-500 mb-2" />
                <div className="text-3xl font-black">₹{stats.revenue.toLocaleString()}</div>
                <div className="text-xs font-bold text-slate-500 uppercase mt-1">Est. Platform Volume</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Line Chart */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-6">Revenue Overview (Last 7 Days)</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} />
                      <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`₹${value}`, "Revenue"]}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Specialty Pie Chart */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-6">Doctors by Specialty</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.appointmentsBySpecialty}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.appointmentsBySpecialty.map((entry, index) => {
                          const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === "doctors" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="p-4 font-bold">Doctor Info</th>
                    <th className="p-4 font-bold">Specialty</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {doctors.map(doc => (
                    <tr key={doc._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {doc.name}
                          {!doc.isVerified && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">Pending Approval</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{doc.doctorId} · {doc.email}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        {doc.specialty}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => toggleDoctorVerification(doc._id, doc.isVerified)} 
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-all mr-2 ${doc.isVerified ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}
                        >
                          {doc.isVerified ? "Revoke" : "Approve"}
                        </button>
                        <button onClick={() => editDoctor(doc)} className="p-2 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors mr-2">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteDoctor(doc._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {doctors.length === 0 && (
                    <tr><td colSpan="3" className="p-8 text-center text-slate-500 italic">No doctors registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="p-4 font-bold">Patient Info</th>
                    <th className="p-4 font-bold">Phone</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {patients.map(pat => (
                    <tr key={pat._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{pat.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{pat.patientId}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        {pat.phone}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => editPatient(pat)} className="p-2 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors mr-2">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => deletePatient(pat._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {patients.length === 0 && (
                    <tr><td colSpan="3" className="p-8 text-center text-slate-500 italic">No patients registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Refunds Tab */}
        {activeTab === "refunds" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="p-4 font-bold">Appointment ID</th>
                    <th className="p-4 font-bold">Patient & Doctor</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {refunds.map(app => (
                    <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {app.appointmentId || app._id.slice(-6)}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{app.patientId?.name || "Unknown"}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Consulting: {app.doctorId?.name || "Unknown"}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          app.paymentStatus === 'REFUNDED' ? 'bg-emerald-100 text-emerald-700' :
                          app.paymentStatus === 'REFUND_PENDING' ? 'bg-amber-100 text-amber-700' :
                          app.paymentStatus === 'REFUND_FAILED' ? 'bg-red-100 text-red-700' :
                          'bg-sky-100 text-sky-700'
                        }`}>
                          {app.paymentStatus || "UNKNOWN"}
                        </span>
                        {app.paymentStatus === 'REFUND_PENDING' && (
                          <div className="text-xs text-slate-500 mt-1">
                            Amount: ₹{app.refundAmount} <br/>
                            Reason: {app.cancellationReason}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {app.paymentStatus === 'REFUND_PENDING' ? (
                          <button onClick={() => processRefund(app._id)} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-lg shadow-sm transition-all">
                            Approve Refund
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 italic">No Action Needed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {refunds.length === 0 && (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-500 italic">No appointments found for refunds.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Refund & Appointment Policies</h2>
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                <label className="block text-sm font-bold mb-1">Grace Period (Minutes)</label>
                <input 
                  type="number" 
                  value={settings.gracePeriodMinutes || 15} 
                  onChange={(e) => setSettings({ ...settings, gracePeriodMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-2" 
                />
                <p className="text-xs text-slate-500 mt-1">Time allowed for patient to join before marking as missed.</p>
              </div>
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                <label className="block text-sm font-bold mb-1">Patient Missed Appointment Policy</label>
                <select 
                  value={settings.missedAppointmentRefundPolicy || "NO_REFUND"}
                  onChange={(e) => setSettings({ ...settings, missedAppointmentRefundPolicy: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-2"
                >
                  <option value="NO_REFUND">No Refund</option>
                  <option value="PARTIAL_REFUND">Partial Refund</option>
                  <option value="FULL_REFUND">Full Refund</option>
                </select>
              </div>
              <button 
                onClick={handleSaveSettings}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-md"
              >
                Save Policies
              </button>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === "audit" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 dark:text-white">Immutable Audit Trail</h2>
              <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300 font-mono">System Integrity Enforced</span>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 sticky top-0 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                    <th className="p-4 font-bold">Timestamp</th>
                    <th className="p-4 font-bold">Action</th>
                    <th className="p-4 font-bold">Resource / ID</th>
                    <th className="p-4 font-bold">State Changes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {auditLogs.map(log => (
                    <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md tracking-wide text-slate-700 dark:text-slate-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.resource}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.resourceId}</div>
                      </td>
                      <td className="p-4">
                        <pre className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg max-w-xs overflow-x-auto border border-slate-200 dark:border-slate-800">
                          {JSON.stringify(log.newValue || log.previousValue || {}, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-500 italic">No audit events recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
