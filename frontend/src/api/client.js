const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const defaultApi = `http://${hostname}:5000/api`;
const BASE_URL = import.meta.env.VITE_API_URL || defaultApi;

export const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

async function request(path, options = {}) {
  const token = localStorage.getItem("arogya_token");
  const defaultHeaders = {};
  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || error.message || "Request failed");
  }
  return res.json();
}

export const api = {
  // Generic HTTP methods
  get: (path) => request(path),
  post: (path, data) => request(path, { method: "POST", body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: "PUT", body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: "DELETE" }),

  // Admin
  approveRefund: (id, data) => request(`/admin/refunds/${id}/approve`, { method: "POST", body: JSON.stringify(data) }),

  // Authentication - Patient
  signup: (data) => request("/users/signup", { method: "POST", body: JSON.stringify(data) }),
  signupUser: (data) => request("/users/signup", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => request("/users/login", { method: "POST", body: JSON.stringify(data) }),
  loginUser: (data) => request("/users/login", { method: "POST", body: JSON.stringify(data) }),
  lookupUser: (phone) => request(`/users/lookup?phone=${encodeURIComponent(phone)}`),
  getUserProfile: (id) => request(`/users/${id}`),
  addDependent: (userId, data) => request(`/users/${userId}/dependents`, { method: "POST", body: JSON.stringify(data) }),
  removeDependent: (userId, depId) => request(`/users/${userId}/dependents/${encodeURIComponent(depId)}`, { method: "DELETE" }),

  // Authentication - Doctor
  registerDoctor: (data) => request("/doctors/register", { method: "POST", body: JSON.stringify(data) }),
  loginDoctor: (data) => request("/doctors/login", { method: "POST", body: JSON.stringify(data) }),

  // Doctors Catalog & Verification
  getDoctors: () => request("/doctors"), // Verified doctors
  getAllDoctors: () => request("/doctors/all"), // Admin all doctors
  getDoctor: (id) => request(`/doctors/${id}`),
  updateDoctor: (id, data) => request(`/doctors/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  verifyDoctor: (id, isVerified) => request(`/doctors/${id}/verify`, { method: "PUT", body: JSON.stringify({ isVerified }) }),
  searchPatientHistory: (patientId) => request(`/doctors/patient-history/${encodeURIComponent(patientId)}`),
  getBookedSlots: (doctorId, date) => request(`/doctors/${doctorId}/booked-slots?date=${date}`),

  // Appointments
  bookAppointment: (data) => request("/appointments", { method: "POST", body: JSON.stringify(data) }),
  uploadDocuments: async (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("documents", files[i]);
    }
    const token = localStorage.getItem("arogya_token");
    const res = await fetch(`${API_ORIGIN}/api/appointments/upload`, {
      method: "POST",
      headers: token ? { "Authorization": `Bearer ${token}` } : {},
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "File upload failed");
    }
    return res.json();
  },
  getPatientAppointments: (patientId) => request(`/appointments/patient/${patientId}`),
  getPatientPrescriptions: (patientId) => request(`/prescriptions/patient/${patientId}`),
  getDoctorAppointments: (doctorId) => request(`/appointments/doctor/${doctorId}`),
  getAppointment: (id) => request(`/appointments/${id}`),
  cancelAppointment: (id, data) => request(`/appointments/${id}/cancel`, { method: "POST", body: JSON.stringify(data) }),
  rescheduleAppointment: (id, data) => request(`/appointments/${id}/reschedule`, { method: "POST", body: JSON.stringify(data) }),
  updateAppointmentStatus: (id, data) => request(`/appointments/${id}/status`, { method: "PUT", body: JSON.stringify(data) }),

  // Video / Agora
  generateAgoraToken: (channelName, uid) => request("/agora/token", { method: "POST", body: JSON.stringify({ channelName, uid }) }),

  // Chat
  getChatMessages: (appointmentId) => request(`/chat/${appointmentId}`),
  sendChatMessage: (data) => request("/chat", { method: "POST", body: JSON.stringify(data) }),

  // Prescriptions
  createPrescription: (data) => request("/prescriptions", { method: "POST", body: JSON.stringify(data) }),
  getPatientPrescriptions: (patientId) => request(`/prescriptions/patient/${patientId}`),
  getDoctorPrescriptions: (doctorId) => request(`/prescriptions/doctor/${doctorId}`),
  getPrescription: (id) => request(`/prescriptions/${id}`),

  // Health Records
  uploadHealthRecord: (formData) => request("/health-records", { method: "POST", body: formData }),
  getHealthRecords: (patientId) => request(`/health-records?patientId=${patientId}`),
  deleteHealthRecord: (id) => request(`/health-records/${id}`, { method: "DELETE" }),

  // Drug Interaction Checks
  getMedicines: () => request("/medicines"),
  checkDrugInteractions: (drugs, patientId) => request("/interaction-checks/check", { method: "POST", body: JSON.stringify({ drugs, patientId }) }),
  runInteractionCheck: (data) => request("/interaction-checks/check", { method: "POST", body: JSON.stringify(data) }),
  getInteractionHistory: (patientId) => request(`/interaction-checks?patientId=${patientId}`),

  // Symptom Checker
  checkSymptoms: (data) => request("/symptom-check", { method: "POST", body: JSON.stringify(data) }),
  checkSymptomsWithImage: (formData) => {
    return fetch(`${BASE_URL.replace(/\/api\/?$/, "/api")}/symptom-check/vision`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || localStorage.getItem("doctorToken")}`,
      },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      return data;
    });
  },
  getSymptomHistory: (patientId) => request(`/symptom-check?patientId=${patientId}`),

  // Notifications
  getNotifications: () => request("/notifications"),
  markNotificationAsRead: (id) => request(`/notifications/${id}/read`, { method: "PUT" }),
  markAllNotificationsAsRead: () => request("/notifications/read-all", { method: "PUT" }),
  clearAllNotifications: () => request("/notifications/clear-all", { method: "DELETE" }),

  // Generic Admin / Fallback methods
  get: (path) => request(path),
  post: (path, data) => request(path, { method: "POST", body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: "PUT", body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export default api;
