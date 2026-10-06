import { useState } from "react";

export default function EmergencyButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 sm:px-5 sm:py-3.5 font-bold text-white text-xs sm:text-sm shadow-lg shadow-red-600/30 transition hover:bg-red-700 hover:scale-105 active:scale-95"
        aria-label="Emergency 108"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        <span className="hidden sm:inline">Emergency</span> 108
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white">
            <h2 className="text-xl font-extrabold">Call 108 — Emergency Ambulance</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              This dials India's national emergency ambulance number directly.
              Stay on the line and share your exact location with the operator.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="tel:108"
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-center font-bold text-white text-sm hover:bg-red-700 transition-colors"
              >
                Call 108 Now
              </a>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 font-bold text-slate-700 dark:text-slate-300 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
