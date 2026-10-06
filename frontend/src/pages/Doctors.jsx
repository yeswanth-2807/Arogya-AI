import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../context/AuthContext";
import { Button, Input, Badge } from "../components/ui";

const SPECIALTIES = [
  "All Specialties",
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

const TIME_SLOTS = ["09:00 AM", "10:30 AM", "11:45 AM", "02:00 PM", "04:30 PM", "06:00 PM"];

function Doctors() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const normalizeSpec = (spec) => {
    if (!spec) return "All Specialties";
    const map = {
      "Urologist": "Urology",
      "Cardiologist": "Cardiology",
      "Neurologist": "Neurology",
      "Endocrinologist": "Endocrinology",
      "Gastroenterologist": "Gastroenterology",
      "Pulmonologist": "Pulmonology",
      "Hematologist": "Hematology",
      "Dermatologist": "Dermatology",
      "Psychiatrist": "Psychiatry"
    };
    return map[spec] || spec;
  };
  
  const initialSpec = normalizeSpec(searchParams.get("spec"));

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpec);
  const [searchQuery, setSearchQuery] = useState("");

  // Booking Modal & Payment Gateway state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: details, 2: payment selection, 3: processing, 4: success
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState("10:30 AM");
  const [reason, setReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    fetchVerifiedDoctors();
  }, []);

  const fetchVerifiedDoctors = async () => {
    try {
      const data = await api.getDoctors();
      setDoctors(data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec = selectedSpecialty === "All Specialties" || doc.specialty === selectedSpecialty;
    const matchesQuery = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpec && matchesQuery;
  });

  const [fullUser, setFullUser] = useState(null);
  const [selectedDependentId, setSelectedDependentId] = useState("myself");
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    if (selectedDoctor && bookingDate) {
      api.getBookedSlots(selectedDoctor._id, bookingDate)
        .then(slots => setBookedSlots(slots))
        .catch(err => console.error(err));
    }
  }, [selectedDoctor, bookingDate]);

  const handleOpenBooking = async (doc) => {
    if (!user) {
      alert("Please login to access this feature.");
      navigate("/login");
      return;
    }
    
    try {
      const profile = await api.getUserProfile(user._id || user.id);
      setFullUser(profile);
    } catch (err) {
      console.error(err);
      setFullUser(user);
    }

    setSelectedDoctor(doc);
    if (doc.availableSlots && doc.availableSlots.length > 0) {
      setSelectedSlot(doc.availableSlots[0]);
    } else {
      setSelectedSlot("10:30 AM");
    }
    setSelectedDependentId("myself");
    setBookingStep(1);
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setBookingStep(2);
  };

  const [selectedFiles, setSelectedFiles] = useState(null);

  const handleConfirmPaymentAndBook = async () => {
    setBookingStep(3);
    setBookingLoading(true);

    try {
      let uploadedUrls = [];
      if (selectedFiles && selectedFiles.length > 0) {
        const uploadRes = await api.uploadDocuments(selectedFiles);
        uploadedUrls = uploadRes.urls;
      }

      const result = await api.bookAppointment({
        patientId: user._id || user.id,
        dependentId: selectedDependentId !== "myself" ? selectedDependentId : undefined,
        doctorId: selectedDoctor._id,
        date: bookingDate,
        time: selectedSlot,
        reason: reason || "General Telemedicine Consultation",
        medicalDocuments: uploadedUrls,
      });

      setBookingResult(result);
      setBookingStep(4);
    } catch (err) {
      alert("Booking failed: " + err.message);
      setBookingStep(1);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm text-center space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-3.5 py-1 rounded-full border border-sky-200 dark:border-sky-800">
            Clinical Specialist Directory
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Verified Hospital Senior Doctors</h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-base max-w-2xl mx-auto">
            Book instant HD video consultations with verified multi-specialty consultants.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto pt-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor by name or clinical specialty..."
            />
          </div>
        </div>

        {/* Specialty Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SPECIALTIES.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedSpecialty === spec
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Doctor Grid or Empty State */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Fetching verified doctors directory...
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 space-y-3">
            <div className="text-5xl">🩺</div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">No doctors are currently available</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Please check again later or switch your specialty filter. Doctors can register via the Doctor Portal.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-sky-400 dark:hover:border-sky-600 hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-sky-600/10 text-sky-600 dark:text-sky-400 border border-sky-400/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                        👨‍⚕️
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{doc.name}</h3>
                        <p className="text-xs font-bold text-sky-600 dark:text-sky-400">{doc.specialty}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{doc.qualification}</p>
                      </div>
                    </div>
                    <Badge variant="teal">✓ Verified</Badge>
                  </div>

                  <div className="bg-transparent p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                    <p>🏥 <strong>Hospital:</strong> {doc.hospital || "Arogya Hospital"}</p>
                    <p>⏱️ <strong>Experience:</strong> {doc.experience || "5+ Years"}</p>
                    <p>💵 <strong>Consultation Fee:</strong> ₹{doc.fee || 500}</p>
                    <p>🕒 <strong>Available Time:</strong> {doc.availableTime || "10:00 AM - 05:00 PM"}</p>
                  </div>
                </div>

                {(() => {
                  const isUnavailableText = doc.availableTime && (doc.availableTime.toLowerCase().includes("absent") || doc.availableTime.toLowerCase().includes("unavailable"));
                  const isUnavailable = doc.isAvailable === false || isUnavailableText;
                  
                  return (
                    <Button
                      variant={isUnavailable ? "outline" : "primary"}
                      onClick={() => handleOpenBooking(doc)}
                      disabled={isUnavailable}
                      className={`w-full font-bold py-3 shadow-md ${
                        isUnavailable 
                          ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-500" 
                          : "bg-sky-600 hover:bg-sky-500 text-white"
                      }`}
                    >
                      {isUnavailable ? "🚫 Currently Unavailable" : `🗓️ Book Consultation (₹${doc.fee || 500})`}
                    </Button>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking & Payment Gateway Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-lg">Book Telemedicine Consultation</h3>
                <p className="text-xs text-sky-600 dark:text-sky-400 font-bold">{selectedDoctor.name} ({selectedDoctor.specialty})</p>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-slate-400 hover:text-red-500 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* STEP 1: Date & Time Details */}
            {bookingStep === 1 && (
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Who is this appointment for?</label>
                  <select
                    value={selectedDependentId}
                    onChange={(e) => setSelectedDependentId(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="myself">Myself ({(fullUser && fullUser.name) || user?.name || "Admin"})</option>
                    {fullUser?.dependents?.map(dep => (
                      <option key={dep.id} value={dep.id}>
                        {dep.name} ({dep.relation})
                      </option>
                    ))}
                  </select>
                  {(!fullUser?.dependents || fullUser?.dependents?.length === 0) && (
                    <p className="text-[10px] text-slate-500 mt-1">You can add family members in your Profile to book for them.</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-bold mb-1">Select Consultation Date</label>
                  <Input
                    type="date"
                    value={bookingDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Select Available Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(() => {
                      let slotsToRender = TIME_SLOTS;
                      if (selectedDoctor.weeklySchedule) {
                        const dayOfWeek = new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long' });
                        const daySlots = selectedDoctor.weeklySchedule[dayOfWeek];
                        if (daySlots && daySlots.length > 0) {
                          slotsToRender = daySlots;
                        } else {
                          return <div className="col-span-3 text-xs text-red-500 font-bold p-2 text-center bg-red-50 rounded-xl">No slots available for this day.</div>;
                        }
                      } else if (selectedDoctor.availableSlots && selectedDoctor.availableSlots.length > 0) {
                        slotsToRender = selectedDoctor.availableSlots;
                      }

                      const today = new Date().toISOString().split("T")[0];
                      if (bookingDate === today) {
                        const now = new Date();
                        slotsToRender = slotsToRender.filter(slot => {
                          const [time, modifier] = slot.split(" ");
                          let [hours, minutes] = time.split(":");
                          hours = parseInt(hours, 10);
                          if (modifier === "PM" && hours < 12) hours += 12;
                          if (modifier === "AM" && hours === 12) hours = 0;
                          const slotTime = new Date();
                          slotTime.setHours(hours, parseInt(minutes, 10), 0, 0);
                          return slotTime > now;
                        });
                      }

                      if (slotsToRender.length === 0) {
                        return <div className="col-span-3 text-xs text-red-500 font-bold p-2 text-center bg-red-50 rounded-xl">All slots have expired or are unavailable today.</div>;
                      }

                      return slotsToRender.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <button
                            type="button"
                            key={slot}
                            disabled={isBooked}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                              isBooked
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-500"
                                : selectedSlot === slot
                                ? "bg-sky-600 text-white border-sky-600"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-500"
                            }`}
                          >
                            {slot} {isBooked && "(Booked)"}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Reason for Visit / Symptoms</label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Fever, chest tightness, headache for 2 days"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Upload Medical Documents (PDF/Images) - Optional</label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 dark:file:bg-slate-700 dark:file:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 cursor-pointer bg-slate-50 dark:bg-slate-900/50"
                  />
                </div>

                <div className="bg-transparent p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Consultation Fee:</span>
                    <span>₹{selectedDoctor.fee || 500}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Digital Health Service Tax:</span>
                    <span>₹0 (Waived)</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-sky-600 dark:text-sky-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span>Total Payable:</span>
                    <span>₹{selectedDoctor.fee || 500}</span>
                  </div>
                </div>

                <Button type="submit" variant="teal" className="w-full font-bold py-3.5">
                  Proceed to Payment Gateway →
                </Button>
              </form>
            )}

            {/* STEP 2: Dummy Payment Gateway Selection */}
            {bookingStep === 2 && (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Arogya Secure Pay</span>
                  <h4 className="font-extrabold text-xl text-slate-900 dark:text-white">Select Payment Method</h4>
                  <p className="text-xs text-emerald-600 font-bold">Total Amount to Pay: ₹{selectedDoctor.fee || 500}</p>
                </div>

                <div className="space-y-2">
                  {[
                    { id: "upi", label: "GPay / PhonePe / Paytm (UPI)", icon: "📱" },
                    { id: "card", label: "Credit / Debit Card (Visa, Mastercard)", icon: "💳" },
                    { id: "netbanking", label: "Net Banking (SBI, HDFC, ICICI)", icon: "🏛️" },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`w-full p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                        paymentMethod === pm.id
                          ? "bg-sky-50 dark:bg-sky-950 border-sky-600 text-sky-600 dark:text-sky-400"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{pm.icon}</span>
                        {pm.label}
                      </span>
                      <span>{paymentMethod === pm.id ? "●" : "○"}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setBookingStep(1)} className="font-bold">
                    ← Back
                  </Button>
                  <Button variant="teal" onClick={handleConfirmPaymentAndBook} className="flex-1 font-bold">
                    Pay ₹{selectedDoctor.fee || 500} & Confirm Booking
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment Processing */}
            {bookingStep === 3 && (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h4 className="font-extrabold text-lg">Processing Payment...</h4>
                <p className="text-xs text-slate-400">Connecting securely to bank gateway. Please do not close this window.</p>
              </div>
            )}

            {/* STEP 4: Success Receipt */}
            {bookingStep === 4 && bookingResult && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-3xl font-bold mx-auto">
                  ✓
                </div>
                <h4 className="font-extrabold text-xl text-emerald-600 dark:text-emerald-400">Appointment Confirmed!</h4>
                <p className="text-xs text-slate-500">Your consultation booking has been saved to the doctor's schedule.</p>

                <div className="bg-transparent p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-left space-y-2 font-mono">
                  <p><strong>Appointment ID:</strong> {bookingResult.appointmentId || "APT-001"}</p>
                  <p><strong>Doctor:</strong> {selectedDoctor.name}</p>
                  <p><strong>Date & Time:</strong> {bookingResult.date} at {bookingResult.time}</p>
                  <p><strong>Patient ID:</strong> {user?.patientId || "PAT-001"}</p>
                  <p className="text-emerald-500 font-bold">Payment Status: SUCCESSFUL (₹{selectedDoctor.fee})</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="teal"
                    onClick={() => navigate(`/consultation/${bookingResult._id}`)}
                    className="flex-1 font-bold text-xs py-3"
                  >
                    🎥 Go to Consultation Room
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/appointments")}
                    className="font-bold text-xs py-3"
                  >
                    My Appointments
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Doctors;
