"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  CreditCard,
  Coins,
  Wallet,
  Landmark,
  Check,
  Loader2,
  Building2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Stepper } from "@/components/onboarding/Stepper";
import { useAuth } from "@/context/AuthContext";
import {
  getBanks,
  getPaymentModes,
  submitOnboarding,
  BankDto,
  PaymentModeDto,
  OnboardingRequestDto,
} from "@/api/onboarding";

const languages = [
  { code: "ENGLISH", name: "English", localName: "US / UK", icon: "🇬🇧" },
  { code: "HINDI", name: "Hindi", localName: "हिन्दी", icon: "🇮🇳" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();

  // Navigation step state
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic lists from backend API
  const [backendBanks, setBackendBanks] = useState<BankDto[]>([]);
  const [backendModes, setBackendModes] = useState<PaymentModeDto[]>([]);
  const [loadingApis, setLoadingApis] = useState(true);

  // Step 1 States: Language & Default Mode
  const [language, setLanguage] = useState<
    "ENGLISH" | "HINDI" | "SPANISH" | "FRENCH"
  >("ENGLISH");
  const [defaultPaymentModeId, setDefaultPaymentModeId] = useState<
    number | null
  >(null);

  // Step 2 States: Linked Accounts (Toggles & Details)
  const [linkBank, setLinkBank] = useState(false);
  const [bankId, setBankId] = useState<string | null>(null);
  const [bankLastFour, setBankLastFour] = useState("");
  const [bankBalance, setBankBalance] = useState("");

  const [linkCard, setLinkCard] = useState(false);
  const [cardType, setCardType] = useState<"CREDIT_CARD" | "DEBIT_CARD">(
    "CREDIT_CARD",
  );
  const [cardLastFour, setCardLastFour] = useState("");
  const [cardLimit, setCardLimit] = useState("");

  const [cashBalance, setCashBalance] = useState("");

  // Load Banks & Payment Modes on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [banksList, modesList] = await Promise.all([
          getBanks(),
          getPaymentModes(),
        ]);
        setBackendBanks(banksList);
        setBackendModes(modesList);
        const validBanks = Array.isArray(banksList) ? banksList : [];
        const validModes = Array.isArray(modesList) ? modesList : [];
        setBackendBanks(validBanks);
        setBackendModes(validModes);

        // Pre-select default payment mode if available
        if (modesList.length > 0) {
          setDefaultPaymentModeId(modesList[0].id);
          if (validModes.length > 0) {
            setDefaultPaymentModeId(validModes[0].id);
          }
          // Pre-select default bank if available
          if (banksList.length > 0) {
            setBankId(banksList[0].id);
            if (validBanks.length > 0) {
              setBankId(String(validBanks[0].id));
            }
          }
        }
      } catch (err) {
        console.error("Error loading onboarding master data", err);
      } finally {
        setLoadingApis(false);
      }
    }
    loadData();
  }, []);

  // Helper to map payment mode icons
  const getModeIcon = (name: string) => {
    const lowercase = name.toLowerCase();
    if (
      lowercase.includes("credit") ||
      lowercase.includes("debit") ||
      lowercase.includes("card")
    ) {
      return <CreditCard className="size-4.5" />;
    }
    if (lowercase.includes("upi")) return <Coins className="size-4.5" />;
    if (lowercase.includes("cash")) return <Wallet className="size-4.5" />;
    if (lowercase.includes("net") || lowercase.includes("bank"))
      return <Landmark className="size-4.5" />;
    return <Coins className="size-4.5" />;
  };

  const handleNextStep = () => {
    if (step === 1 && !defaultPaymentModeId) {
      setErrorMessage("Please select a default payment mode to continue.");
      return;
    }

    // Step 2 validations
    if (step === 2) {
      if (linkBank) {
        if (!bankId) {
          setErrorMessage("Please select your bank.");
          return;
        }
        if (bankLastFour.length !== 4 || isNaN(Number(bankLastFour))) {
          setErrorMessage(
            "Bank account last 4 digits must be exactly 4 numbers.",
          );
          return;
        }
        if (
          bankBalance === "" ||
          isNaN(Number(bankBalance)) ||
          Number(bankBalance) < 0
        ) {
          setErrorMessage("Please enter a valid non-negative bank balance.");
          return;
        }
      }

      if (linkCard) {
        if (cardLastFour.length !== 4 || isNaN(Number(cardLastFour))) {
          setErrorMessage("Card last 4 digits must be exactly 4 numbers.");
          return;
        }
        if (
          cardLimit === "" ||
          isNaN(Number(cardLimit)) ||
          Number(cardLimit) < 0
        ) {
          setErrorMessage("Please enter a valid non-negative card limit.");
          return;
        }
      }

      if (
        cashBalance !== "" &&
        (isNaN(Number(cashBalance)) || Number(cashBalance) < 0)
      ) {
        setErrorMessage("Please enter a valid non-negative cash balance.");
        return;
      }
    }

    setErrorMessage(null);
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMessage(null);

    const onboardingDto: OnboardingRequestDto = {
      bankId: linkBank && bankId ? String(bankId) : null,
      accountLastFourDigits: linkBank ? bankLastFour : null,
      balance: linkBank && bankBalance !== "" ? parseFloat(bankBalance) : null,
      cardType: linkCard ? cardType : null,
      cardLastFourDigits: linkCard ? cardLastFour : null,
      cardLimit: linkCard && cardLimit !== "" ? parseFloat(cardLimit) : null,
      cashBalance: cashBalance !== "" ? parseFloat(cashBalance) : 0,
      paymentModeId: defaultPaymentModeId,
      languagePreference: language,
    };

    console.log("ONBOARDING DTO:", onboardingDto);
    console.log("CARD TYPE:", onboardingDto.cardType);

    try {
      await submitOnboarding(onboardingDto);
      localStorage.setItem("onboarded", "true");
      window.dispatchEvent(new Event("onboarding:completed"));
      setStep(3);
    } catch (err: any) {
      console.error("Onboarding submission failed", err);
      setErrorMessage(
        err.message || "Failed to save onboarding details. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingApis) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-app-primary">
        <Loader2 className="size-8 animate-spin text-app-primary" />
        <span className="text-sm font-medium text-app-text-secondary">
          Loading configuration...
        </span>
      </div>
    );
  }

  const selectedPaymentModeName =
    backendModes.find((m) => m.id === defaultPaymentModeId)?.name || "None";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-12">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-app-primary">
          <Sparkles className="size-3.5 text-indigo-600" />
          Fast AI Setup
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-app-text-primary sm:text-3xl">
          AI Expense Tracker
        </h1>
        <p className="app-body mx-auto max-w-md text-xs sm:text-sm">
          Let&apos;s quickly configure your workspace so our AI model can
          seamlessly parse and organize your receipts.
        </p>
      </div>

      <Stepper step={step} totalSteps={3} />

      {/* Main Container Card */}
      <div className="app-card p-6 sm:p-8 transition-all duration-200">
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
            <span className="size-2 shrink-0 rounded-full bg-red-500 animate-pulse" />
            {errorMessage}
          </div>
        )}

        {/* STEP 1: PREFERENCES */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Language Preference Section */}
            <div className="space-y-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm sm:text-base font-bold text-app-text-primary">
                  <Globe className="size-4.5 text-app-primary" /> Choose
                  Language Preference
                </h3>
                <p className="text-xs text-app-text-secondary mt-0.5">
                  Select the default language for your dashboard and
                  notifications.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {languages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-xl border p-4 text-center transition-all duration-200 ${
                        isSelected
                          ? "border-app-primary bg-indigo-50/70 shadow-xs ring-2 ring-indigo-100"
                          : "border-app-border bg-app-surface text-app-text-secondary hover:border-indigo-200 hover:bg-indigo-50/20 hover:text-app-text-primary shadow-xs"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-app-primary text-white">
                          <Check className="size-2.5 stroke-[3]" />
                        </span>
                      )}
                      <span className="text-2xl">{lang.icon}</span>
                      <span className="text-sm font-bold text-app-text-primary">
                        {lang.name}
                      </span>
                      <span className="text-[11px] text-app-text-muted">
                        {lang.localName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-app-border my-6" />

            {/* Default Payment Mode Section */}
            <div className="space-y-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm sm:text-base font-bold text-app-text-primary">
                  <Coins className="size-4.5 text-app-primary" /> Select Default
                  Payment Mode
                </h3>
                <p className="text-xs text-app-text-secondary mt-0.5">
                  Choose the primary source when adding general transactions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {backendModes.map((mode) => {
                  const isSelected = defaultPaymentModeId === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setDefaultPaymentModeId(mode.id)}
                      className={`group relative flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-app-primary bg-indigo-50/70 shadow-xs ring-2 ring-indigo-100"
                          : "border-app-border bg-app-surface hover:border-indigo-200 hover:bg-indigo-50/20 shadow-xs"
                      }`}
                    >
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          isSelected
                            ? "bg-app-primary text-white"
                            : "bg-indigo-50 text-app-primary"
                        }`}
                      >
                        {getModeIcon(mode.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-app-text-primary">
                          {mode.name}
                        </div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-app-text-muted mt-0.5">
                          {mode.type}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-app-primary text-white">
                          <Check className="size-2.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LINKED ACCOUNTS */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Physical Cash Input */}
            <div className="rounded-xl border border-app-border bg-gray-50/60 p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Wallet className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-app-text-primary sm:text-base">
                    Physical Cash Balance
                  </h3>
                  <p className="text-xs text-app-text-secondary">
                    Initial cash in hand available for expenses.
                  </p>
                </div>
              </div>
              <div className="relative max-w-xs">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-app-text-muted">
                  ₹
                </span>
                <input
                  type="text"
                  placeholder="0.00"
                  value={cashBalance}
                  onChange={(e) => setCashBalance(e.target.value)}
                  className="h-10 w-full rounded-xl border border-app-border bg-app-surface py-2 pl-7 pr-3.5 text-sm font-semibold text-app-text-primary placeholder:text-app-text-muted outline-none transition focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Bank Account Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-app-primary">
                    <Building2 className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-app-text-primary sm:text-base">
                      Link a Bank Account
                    </h3>
                    <p className="text-xs text-app-text-secondary">
                      Add your primary savings or salary account for tracking.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkBank(!linkBank)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all border ${
                    linkBank
                      ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      : "border-app-border bg-app-surface text-app-text-primary hover:bg-gray-50 shadow-xs"
                  }`}
                >
                  {linkBank ? "Remove" : "+ Link Bank"}
                </button>
              </div>

              {linkBank && (
                <div className="space-y-3 rounded-xl border border-app-border bg-gray-50/60 p-4 sm:p-5 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-app-text-primary">
                        Select Bank
                      </label>
                      <div className="relative">
                        <select
                          value={bankId || ""}
                          onChange={(e) => setBankId(e.target.value)}
                          className="h-10 w-full appearance-none rounded-xl border border-app-border bg-app-surface px-3.5 pr-8 text-sm font-medium text-app-text-primary outline-none transition focus:border-app-primary focus:ring-3 focus:ring-indigo-100 cursor-pointer"
                        >
                          {backendBanks.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-app-text-muted" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-app-text-primary">
                        Last 4 Digits
                      </label>
                      <input
                        placeholder="e.g. 9876"
                        maxLength={4}
                        value={bankLastFour}
                        onChange={(e) => setBankLastFour(e.target.value)}
                        className="h-10 w-full rounded-xl border border-app-border bg-app-surface px-3.5 text-sm font-semibold text-app-text-primary placeholder:text-app-text-muted outline-none transition focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-app-text-primary">
                        Current Balance
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-app-text-muted">
                          ₹
                        </span>
                        <input
                          placeholder="0.00"
                          value={bankBalance}
                          onChange={(e) => setBankBalance(e.target.value)}
                          className="h-10 w-full rounded-xl border border-app-border bg-app-surface py-2 pl-7 pr-3.5 text-sm font-semibold text-app-text-primary placeholder:text-app-text-muted outline-none transition focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-app-border my-6" />

            {/* Card Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-app-primary">
                    <CreditCard className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-app-text-primary sm:text-base">
                      Link a Card
                    </h3>
                    <p className="text-xs text-app-text-secondary">
                      Link your primary Credit Card or Debit Card.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkCard(!linkCard)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all border ${
                    linkCard
                      ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      : "border-app-border bg-app-surface text-app-text-primary hover:bg-gray-50 shadow-xs"
                  }`}
                >
                  {linkCard ? "Remove" : "+ Link Card"}
                </button>
              </div>

              {linkCard && (
                <div className="space-y-4 rounded-xl border border-app-border bg-gray-50/60 p-4 sm:p-5 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex max-w-[210px] rounded-xl border border-gray-200 bg-gray-200/70 p-1 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setCardType("CREDIT_CARD")}
                      className={`flex-1 rounded-lg px-3 py-1.5 transition-all ${
                        cardType === "CREDIT_CARD"
                          ? "bg-app-surface text-app-text-primary shadow-xs font-bold"
                          : "text-app-text-secondary hover:text-app-text-primary"
                      }`}
                    >
                      Credit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardType("DEBIT_CARD")}
                      className={`flex-1 rounded-lg px-3 py-1.5 transition-all ${
                        cardType === "DEBIT_CARD"
                          ? "bg-app-surface text-app-text-primary shadow-xs font-bold"
                          : "text-app-text-secondary hover:text-app-text-primary"
                      }`}
                    >
                      Debit Card
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-app-text-primary">
                        Card Last 4 Digits
                      </label>
                      <input
                        placeholder="e.g. 4321"
                        maxLength={4}
                        value={cardLastFour}
                        onChange={(e) => setCardLastFour(e.target.value)}
                        className="h-10 w-full rounded-xl border border-app-border bg-app-surface px-3.5 text-sm font-semibold text-app-text-primary placeholder:text-app-text-muted outline-none transition focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-app-text-primary">
                        {cardType === "CREDIT_CARD"
                          ? "Credit Limit"
                          : "Current Card Balance"}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-app-text-muted">
                          ₹
                        </span>
                        <input
                          placeholder={
                            cardType === "CREDIT_CARD" ? "Limit Amount" : "0.00"
                          }
                          value={cardLimit}
                          onChange={(e) => setCardLimit(e.target.value)}
                          className="h-10 w-full rounded-xl border border-app-border bg-app-surface py-2 pl-7 pr-3.5 text-sm font-semibold text-app-text-primary placeholder:text-app-text-muted outline-none transition focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 3 && (
          <div className="text-center space-y-4 py-6 sm:py-8 animate-in scale-in duration-300">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto">
              <CheckCircle2 className="size-8 stroke-[2]" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-app-text-primary sm:text-3xl">
              Setup Completed!
            </h2>
            <p className="app-body mx-auto max-w-sm text-xs sm:text-sm">
              Your configurations have been successfully synchronised with your
              account. Let&apos;s start tracking your expenses with AI
              capabilities.
            </p>

            <div className="mx-auto max-w-md rounded-2xl border border-app-border bg-gray-50/70 p-5 text-left text-xs space-y-2.5 mt-6">
              <div className="flex justify-between border-b border-app-border pb-2">
                <span className="text-app-text-secondary font-medium">
                  Language Preference:
                </span>
                <span className="font-bold text-app-text-primary">
                  {languages.find((l) => l.code === language)?.name} ({language}
                  )
                </span>
              </div>
              <div className="flex justify-between border-b border-app-border pb-2">
                <span className="text-app-text-secondary font-medium">
                  Default Mode:
                </span>
                <span className="font-bold text-app-text-primary">
                  {selectedPaymentModeName}
                </span>
              </div>
              {linkBank && (
                <div className="flex justify-between border-b border-app-border pb-2">
                  <span className="text-app-text-secondary font-medium">
                    Linked Bank:
                  </span>
                  <span className="font-bold text-app-text-primary">
                    {backendBanks.find((b) => b.id === bankId)?.name} (..
                    {bankLastFour})
                  </span>
                </div>
              )}
              {linkCard && (
                <div className="flex justify-between border-b border-app-border pb-2">
                  <span className="text-app-text-secondary font-medium">
                    Linked Card:
                  </span>
                  <span className="font-bold text-app-text-primary">
                    {cardType} Card (..{cardLastFour})
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-0.5">
                <span className="text-app-text-secondary font-medium">
                  Physical Cash:
                </span>
                <span className="font-bold text-app-text-primary">
                  ₹{parseFloat(cashBalance) || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-app-border pt-6 mt-8">
          {step > 1 && step < 3 && (
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setStep(step - 1);
              }}
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-app-border bg-app-surface px-4 text-xs font-semibold text-app-text-secondary transition hover:bg-gray-50 hover:text-app-text-primary shadow-xs"
            >
              Back
            </button>
          )}

          {step === 3 ? (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="ml-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-500 active:scale-95"
            >
              Go to Dashboard <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={step === 2 ? handleSubmit : handleNextStep}
              disabled={submitting}
              className="ml-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-app-primary px-6 text-xs font-semibold text-white shadow-xs transition hover:bg-app-primary-hover active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving...
                </>
              ) : step === 2 ? (
                <>
                  Complete Setup <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  Next Step <ArrowRight className="size-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
