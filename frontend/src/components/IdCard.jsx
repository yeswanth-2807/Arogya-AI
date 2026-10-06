import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Button } from './ui';
import { Download, Maximize2, X } from 'lucide-react';

const IdCard = ({ user, type }) => {
  const cardRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      // Temporarily remove transform for clean capture if any, but the hidden class is removed when open
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
      const link = document.createElement('a');
      link.download = `${type}_ID_Card_${user.patientId || user.doctorId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Failed to generate ID card", err);
      alert("Failed to download ID card");
    }
  };

  const idNumber = user.patientId || user.doctorId;
  const isDoctor = type === "Doctor";
  const headerColor = isDoctor ? "bg-sky-600" : "bg-teal-600";
  const roleText = isDoctor ? (user.specialty || "Specialist Doctor") : "Registered Patient";

  const renderCard = () => (
    <div className="flex flex-col items-center gap-5">
      <div 
        ref={cardRef} 
        className="w-[280px] h-auto pb-4 bg-white rounded-xl shadow-2xl relative overflow-hidden flex flex-col border border-slate-200"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header / Brand Area */}
        <div className={`w-full ${headerColor} pt-6 pb-12 px-4 text-center relative`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-center gap-2 text-white mb-2">
            <span className="text-2xl bg-white text-sky-600 p-1.5 rounded-lg shadow-sm">🏥</span>
            <span className="font-black text-xl tracking-wide">AROGYA AI</span>
          </div>
          <div className="relative z-10 text-white/90 text-[10px] font-bold tracking-widest uppercase">
            Multi-Specialty Hospital Network
          </div>
        </div>

        {/* Body Details (Aligned Cleanly) */}
        <div className="flex-1 px-8 py-6 flex flex-col justify-center text-center bg-white relative">
          <h2 className="text-2xl font-black text-black leading-tight mb-2 tracking-tight uppercase truncate">{user.name}</h2>
          <div className="flex justify-center mb-6">
            <div className={`text-[10px] font-black px-4 py-1 rounded-sm uppercase tracking-widest ${isDoctor ? "bg-sky-100 text-sky-800 border-sky-300" : "bg-teal-100 text-teal-800 border-teal-300"} border`}>
              {roleText}
            </div>
          </div>

          <div className="w-full space-y-4 text-left mt-2">
            <div className="flex flex-col border-b border-slate-200 pb-1.5">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Official ID Number</span>
              <span className="text-sm font-black text-black font-mono tracking-wide">{idNumber}</span>
            </div>
            
            <div className="flex flex-col border-b border-slate-200 pb-1.5">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Registered Email</span>
              <span className="text-sm font-black text-black truncate">{user.email || "N/A"}</span>
            </div>

            <div className="flex flex-col border-b border-slate-200 pb-1.5">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Contact Number</span>
              <span className="text-sm font-black text-black">{user.phone || "N/A"}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">{isDoctor ? "Medical Qualification" : "Age & Gender"}</span>
              <span className="text-sm font-black text-black">
                {isDoctor ? (user.qualification || "MBBS, MD") : (`${user.age || "N/A"} Yrs / ${user.gender?.toUpperCase() || "N/A"}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Spacer for bottom padding */}
        <div className="h-4"></div>
      </div>

      <Button onClick={handleDownload} variant={isDoctor ? "primary" : "teal"} className="flex items-center gap-2 rounded-full py-2.5 px-6 shadow-md transition-all hover:-translate-y-0.5 font-bold mt-2">
        <Download className="w-4 h-4" /> Download Official ID Card
      </Button>
    </div>
  );

  return (
    <>
      {/* Mini Preview / Thumbnail */}
      <div 
        onClick={() => setIsOpen(true)}
        className="cursor-pointer group flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
      >
        <div className={`w-12 h-12 rounded-full ${headerColor} flex items-center justify-center text-white shadow-inner`}>
          🏥
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {type} ID Card
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {idNumber}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition-colors">
          <Maximize2 className="w-4 h-4" />
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-transparent relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors shadow-lg backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
            {renderCard()}
          </div>
        </div>
      )}
    </>
  );
};

export default IdCard;
