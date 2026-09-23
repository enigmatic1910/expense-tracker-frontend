"use client";

import { Globe, Check } from "lucide-react";

interface LanguageSettingsProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
}

const languages = [
  { code: "English", name: "English", localName: "US / UK", icon: "🇬🇧" },
  { code: "Hindi", name: "Hindi", localName: "हिन्दी", icon: "🇮🇳" },
];

export const LanguageSettings = ({
  currentLanguage,
  onLanguageChange,
}: LanguageSettingsProps) => (
  <div className="app-card p-6 transition-all duration-200">
    <div className="flex items-center gap-2.5 mb-4">
      <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-app-primary">
        <Globe className="size-4.5" />
      </div>
      <div>
        <h3 className="text-sm sm:text-base font-bold text-app-text-primary">
          Language Preference
        </h3>
        <p className="text-xs text-app-text-secondary">
          Select your default dashboard language
        </p>
      </div>
    </div>
    <div className="flex flex-wrap gap-3">
      {languages.map((lang) => {
        const isSelected =
          currentLanguage?.toLowerCase() === lang.code.toLowerCase();
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onLanguageChange(lang.code)}
            className={`group relative flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
              isSelected
                ? "border-app-primary bg-indigo-50/70 text-app-primary shadow-xs ring-2 ring-indigo-100"
                : "border-app-border bg-app-surface text-app-text-secondary hover:border-indigo-200 hover:bg-indigo-50/20 hover:text-app-text-primary shadow-xs"
            }`}
          >
            <span className="text-base">{lang.icon}</span>
            <span>{lang.name}</span>
            <span className="text-[10px] text-app-text-muted font-medium">
              ({lang.localName})
            </span>
            {isSelected && (
              <span className="ml-1 flex size-3.5 items-center justify-center rounded-full bg-app-primary text-white">
                <Check className="size-2 stroke-[3]" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);