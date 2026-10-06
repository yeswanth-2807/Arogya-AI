import React, { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { languageMeta } from "../i18n/translations";

function LanguageSwitcher() {
  const { language, setLanguage } = useContext(LanguageContext);

  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-slate-400 mr-1 hidden sm:inline">🌐</span>
      {languageMeta.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
            language === lang.code
              ? "bg-sky-600 text-white shadow-xs"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
