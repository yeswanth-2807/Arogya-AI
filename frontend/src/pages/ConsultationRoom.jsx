import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/client";
import { Button, Input } from "../components/ui";
import VideoCall from "../components/VideoCall";

function ConsultationRoom() {
  const { appointmentId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeExceeded, setTimeExceeded] = useState(false);

  const [videoToken, setVideoToken] = useState(null);
  const [showMeetInput, setShowMeetInput] = useState(false);
  const [meetLink, setMeetLink] = useState("");

  const [messages, setMessages] = useState([
    { sender: "System", text: "Encrypted HD Telemedicine Consultation Session Connected.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
  ]);

  const isDoctor = user?.role === "doctor";
  const MAX_SESSION_SECONDS = 15 * 60; // 15 minute limit

  // Poll appointment state every 3 seconds for real-time room sync between Patient and Doctor
  useEffect(() => {
    if (!user) {
      alert("Please login to access this feature.");
      navigate("/login");
      return;
    }

    fetchAppointmentData();

    const pollInterval = setInterval(() => {
      fetchAppointmentDataSilently();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [appointmentId, user]);

  // Fetch token automatically if room is active and we don't have a token


  const fetchAppointmentData = async () => {
    try {
      const data = await api.getAppointment(appointmentId);
      
      // If we're rendering this room, someone just joined!
      // Let's ping the server so the Cron Job knows they are here.
      if (!isDoctor && !data.patientJoinedAt) {
        await api.updateAppointmentStatus(appointmentId, { patientJoined: true });
      } else if (isDoctor && !data.doctorJoinedAt) {
        await api.updateAppointmentStatus(appointmentId, { doctorJoined: true });
      }

      setAppointment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentDataSilently = async () => {
    try {
      const data = await api.getAppointment(appointmentId);
      setAppointment((prev) => {
        if (!prev) return data;
        return { ...prev, roomStatus: data.roomStatus, status: data.status, roomUrl: data.roomUrl };
      });
      // Fetch chat messages
      const msgs = await api.getChatMessages(appointmentId);
      setMessages([
        { sender: "System", text: "Encrypted HD Telemedicine Consultation Session Connected.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
        ...msgs
      ]);
    } catch (err) {}
  };

  // Timer counter for active call
  useEffect(() => {
    if (loading || appointment?.roomStatus !== "active") return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= MAX_SESSION_SECONDS && !timeExceeded) {
          setTimeExceeded(true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, appointment?.roomStatus, timeExceeded]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleEndCall = async () => {
    try {
      await api.updateAppointmentStatus(appointmentId, { roomStatus: "ended", status: "COMPLETED" });
      alert("Consultation session completed.");
      navigate(isDoctor ? "/doctor/dashboard" : "/appointments");
    } catch (err) {
      navigate(isDoctor ? "/doctor/dashboard" : "/appointments");
    }
  };

  const [agoraAppId, setAgoraAppId] = useState(null);

  // Fetch token automatically if room is active and we don't have a token
  useEffect(() => {
    if (appointment?.roomUrl && appointment?.roomStatus === "active" && !videoToken) {
      api.generateAgoraToken(appointment.roomUrl, 0)
        .then(data => {
          setVideoToken(data.token);
          setAgoraAppId(data.appId);
        })
        .catch(err => console.error("Failed to fetch video token", err));
    }
  }, [appointment?.roomUrl, appointment?.roomStatus, videoToken]);

  const handleDoctorJoinCall = async () => {
    try {
      const channelName = `consultation_${appointmentId}`;
      const data = await api.generateAgoraToken(channelName, 0);
      setVideoToken(data.token);
      setAgoraAppId(data.appId);
      
      await api.updateAppointmentStatus(appointmentId, { 
        roomStatus: "active",
        roomUrl: channelName 
      });
      
      setAppointment((prev) => ({ 
        ...prev, 
        roomStatus: "active",
        roomUrl: channelName 
      }));
    } catch (err) {
      alert("Error starting video room: " + err.message);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      appointmentId,
      sender: user?.name || (isDoctor ? "Doctor" : "Patient"),
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    try {
      await api.sendChatMessage(newMsg);
      // Optimistically update
      setMessages((prev) => [...prev, newMsg]);
      setChatInput("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-5" />
        <h2 className="text-xl font-extrabold">Connecting to Telemedicine Consultation Server...</h2>
        <p className="text-xs text-slate-400 mt-2">Establishing encrypted peer-to-peer audio/video channel</p>
      </div>
    );
  }

  // Handle Completed state
  if (appointment?.status === "COMPLETED" || appointment?.roomStatus === "ended") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl mb-2">✅</div>
          <h1 className="text-2xl font-extrabold text-white">Consultation Ended</h1>
          <p className="text-sm text-slate-300">
            This telemedicine session has been successfully completed and the video room has been securely closed.
          </p>
          <Button
            variant="teal"
            onClick={() => navigate(isDoctor ? "/doctor/dashboard" : "/appointments")}
            className="w-full text-xs font-bold py-3 mt-4 text-white"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Handle Cancelled / Missed states
  if (appointment?.status === "MISSED_BY_DOCTOR" || appointment?.status === "MISSED_BY_PATIENT") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl mb-2">❌</div>
          <h1 className="text-2xl font-extrabold text-white">Consultation Missed</h1>
          <p className="text-sm text-slate-300">
            The grace period expired without both parties successfully joining. The appointment has been automatically cancelled.
          </p>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mt-4">
            A refund has been automatically initiated according to the hospital's policies (if eligible).
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(isDoctor ? "/doctor/dashboard" : "/appointments")}
            className="w-full text-xs font-bold py-3 mt-4 text-white border-slate-700"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // PATIENT WAITING ROOM (Patient joined, waiting for doctor)
  if (!isDoctor && appointment?.roomStatus === "waiting") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-4">
            <div className="w-20 h-20 rounded-full bg-sky-600/20 border-2 border-sky-400/40 flex items-center justify-center text-4xl mx-auto animate-pulse">
              ⌛
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Waiting for Doctor to Join...
            </div>

            <h1 className="text-2xl font-extrabold text-white">You have joined the consultation</h1>
            <p className="text-sm text-slate-300">
              Please wait for <strong className="text-sky-400">{appointment?.doctorName || appointment?.doctorId?.name || "the Doctor"}</strong> to enter the room.
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-left space-y-1.5 text-slate-400 font-mono">
              <p><strong>Appointment ID:</strong> {appointment?.appointmentId}</p>
              <p><strong>Scheduled Time:</strong> {appointment?.date} at {appointment?.time}</p>
              <p><strong>Patient Name:</strong> {user?.name}</p>
              <p><strong>Patient ID:</strong> {user?.patientId}</p>
            </div>

            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs">
              💡 <strong>Tip:</strong> Keep this page open. As soon as your doctor joins from their dashboard, your screen will automatically switch to the active video call.
            </div>

            <Button
              variant="outline"
              onClick={() => navigate("/appointments")}
              className="w-full text-xs font-bold py-3 text-slate-300 border-slate-700"
            >
              Return to My Appointments
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE CONSULTATION ROOM (Patient + Doctor active or Doctor initiating call)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-3 sm:p-5 space-y-3">
      {/* Header Bar */}
      <header className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
              🎥 Live Telemedicine Consultation
              {isDoctor && <span className="bg-sky-500/20 text-sky-400 text-xs px-2 py-0.5 rounded">Doctor View</span>}
            </h1>
            <p className="text-xs text-slate-400">
              Doctor: <strong className="text-sky-400">{appointment?.doctorName}</strong> · Patient: <strong className="text-sky-400">{appointment?.patientName}</strong> (ID: {appointment?.patientCustomId})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className={`px-3 py-1 rounded-full font-bold border ${
            timeExceeded
              ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          }`}>
            ⏱️ Session: {formatTime(elapsedSeconds)} / {formatTime(MAX_SESSION_SECONDS)}
          </span>

          {isDoctor && (!appointment?.roomUrl || appointment?.roomStatus === "waiting") && (
            <button
              onClick={handleDoctorJoinCall}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-xl animate-bounce"
            >
              ▶️ Start Video Session
            </button>
          )}

          <Button
            variant="emergency"
            onClick={handleEndCall}
            className="text-xs py-1.5 px-4 font-bold bg-red-600 hover:bg-red-700 text-white shadow-md"
          >
            📞 End Call
          </Button>
        </div>
      </header>

      {/* Main Grid: Video Stream + Consultation Tools */}
      <div className="grid lg:grid-cols-12 gap-4 flex-1">
        {/* Main Video View */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-1 flex flex-col relative overflow-hidden min-h-[500px] shadow-2xl">
          {appointment?.roomUrl ? (
            <VideoCall 
              channelName={appointment.roomUrl} 
              token={videoToken} 
              appId={agoraAppId}
              uid={0}
              onLeave={handleEndCall} 
              localParticipantName={user?.name}
              remoteParticipantName={isDoctor ? appointment?.patientName : appointment?.doctorName}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-4 border-slate-500 border-t-transparent rounded-full animate-spin" />
              <span>Waiting for Doctor to Start Video Session...</span>
            </div>
          )}
        </div>

        {/* Right Sidebar: Chat & Clinical Info */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          {/* Consultation Chat */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex-1 flex flex-col justify-between shadow-xl min-h-[300px]">
            <div className="border-b border-slate-800 pb-3 mb-3 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>💬</span> Consultation Live Chat
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">🔒 Encrypted</span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-60 pr-1 flex-1">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl text-xs space-y-0.5 ${
                    msg.sender === user?.name
                      ? "bg-sky-600 text-white ml-6"
                      : msg.sender === "System"
                      ? "bg-slate-800 text-slate-400 text-center"
                      : "bg-slate-800 text-slate-200 mr-6"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[10px] opacity-70">
                    <span>{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="mt-3 flex gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                placeholder="Type message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3 py-2 rounded-xl">
                Send
              </button>
            </form>
          </div>

          {/* Quick Doctor Actions */}
          {isDoctor && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
              <h3 className="font-bold text-xs text-teal-400 uppercase tracking-wider">
                ⚡ Doctor Consultation Tools
              </h3>
              <Button
                variant="teal"
                onClick={() => navigate("/doctor/dashboard")}
                className="w-full text-xs font-bold py-2.5"
              >
                💊 Open Digital Prescription Creator
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

class RoomErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: "", stack: "" };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error.message, stack: error.stack };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center text-white p-8">
          <h1 className="text-3xl font-bold mb-4">CRITICAL CRASH</h1>
          <p className="text-xl mb-4 font-mono">{this.state.errorMsg}</p>
          <pre className="bg-black/50 p-4 rounded-xl text-xs overflow-auto max-w-4xl text-left whitespace-pre-wrap">{this.state.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ConsultationRoomWithBoundary(props) {
  return (
    <RoomErrorBoundary>
      <ConsultationRoom {...props} />
    </RoomErrorBoundary>
  );
}
