import React from "react";

export function Card({ children, className = "" }) {
  return <div className={`hospital-card p-6 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h3 className={`text-xl font-bold text-slate-900 tracking-tight ${className}`}>{children}</h3>;
}

export function CardBody({ children, className = "" }) {
  return <div className={`mt-3 text-slate-600 text-sm leading-relaxed ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return <div className={`mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 ${className}`}>{children}</div>;
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center font-semibold text-sm rounded-xl px-5 py-2.5 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500 shadow-sky-600/20",
    teal: "bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 shadow-teal-600/20",
    emergency: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-red-600/25 animate-pulse",
    outline: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 focus:ring-sky-500",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-400",
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function GlassButton(props) {
  return <Button {...props} />;
}

export function Badge({ children, variant = "neutral", tone, className = "" }) {
  const selectedTone = tone || variant;
  const variants = {
    available: "badge-available px-3 py-1 text-xs font-semibold rounded-full",
    success: "badge-available px-3 py-1 text-xs font-semibold rounded-full",
    emergency: "badge-emergency px-3 py-1 text-xs font-semibold rounded-full",
    danger: "badge-emergency px-3 py-1 text-xs font-semibold rounded-full",
    specialty: "badge-specialty px-3 py-1 text-xs font-semibold rounded-full",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-semibold rounded-full",
  };
  return <span className={`${variants[selectedTone] || variants.neutral} ${className}`}>{children}</span>;
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all ${className}`}
      {...props}
    />
  );
}

export const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all";

export function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-8">
      {eyebrow && <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">{eyebrow}</span>}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{title}</h1>
      {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-bold text-slate-700">{label}</label>}
      {children}
    </div>
  );
}

export function EmptyState({ icon = "🏥", title, subtitle }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
      <div className="text-4xl">{icon}</div>
      <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="py-12 text-center text-slate-500 font-semibold">
      <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
      Loading...
    </div>
  );
}
