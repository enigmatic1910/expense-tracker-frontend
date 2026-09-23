"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Check,
  Coins,
  CreditCard,
  Landmark,
  Loader2,
  Plus,
  Wallet,
  X,
} from "lucide-react";

import { apiFetch } from "@/api/api-client";
import { getBanks, type Bank } from "@/api/banks";
import {
  addAccount,
  deleteAccount,
  getAccounts,
  type AccountType,
} from "@/api/accounts";
import type { Account } from "@/api/model/Account";
import { AccountCard } from "@/components/profile/AccountCard";
import { CategoryManager } from "@/components/profile/CategoryManager";
import { LanguageSettings } from "@/components/profile/LanguageSettings";
import { CardManager } from "@/components/profile/CardManager";

interface UserConfig {
  language: string;
  paymentModeId: number;
  defaultAccountId: number | null;
}

interface NewAccountForm {
  bankName: string;
  lastFourDigits: string;
  type: AccountType;
  amount: string;
}

const initialAccountForm: NewAccountForm = {
  bankName: "",
  lastFourDigits: "",
  type: "SAVINGS",
  amount: "",
};

const paymentModes = [
  { id: 1, name: "Card", icon: <CreditCard className="size-4" /> },
  {
    id: 4,
    name: "UPI",
    icon: <span className="text-[10px] font-bold">UPI</span>,
  },
  { id: 5, name: "Cash", icon: <Wallet className="size-4" /> },
  { id: 3, name: "Net Banking", icon: <Landmark className="size-4" /> },
];

export default function ProfilePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [config, setConfig] = useState<UserConfig>({
    language: "English",
    paymentModeId: 1,
    defaultAccountId: null,
  });
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(
    null,
  );
  const [accountActionError, setAccountActionError] = useState<string | null>(
    null,
  );
  const [accountError, setAccountError] = useState<string | null>(null);
  const [newAccount, setNewAccount] =
    useState<NewAccountForm>(initialAccountForm);
  const hasCashAccount = accounts.some(
    (account) => account.type?.toUpperCase() === "CASH",
  );

  const loadProfileData = useCallback(async () => {
    setLoading(true);

    try {
      const [accountsResult, configResult] = await Promise.allSettled([
        getAccounts(),
        apiFetch<UserConfig>("api/user-config", {
          method: "GET",
        }),
      ]);

      try {
        setBanks(await getBanks());
      } catch (error) {
        console.error("Failed to load banks:", error);
        setBanks([]);
      }

      if (accountsResult.status === "fulfilled") {
        setAccounts(
          Array.isArray(accountsResult.value) ? accountsResult.value : [],
        );
      } else {
        console.error("Failed to load accounts:", accountsResult.reason);
        setAccounts([]);
      }

      if (configResult.status === "fulfilled" && configResult.value) {
        const configData = configResult.value;

        setConfig({
          language: configData.language || "English",
          paymentModeId: configData.paymentModeId ?? 1,
          defaultAccountId: configData.defaultAccountId ?? null,
        });
      } else if (configResult.status === "rejected") {
        console.error("Failed to load user config:", configResult.reason);
      }
    } catch (error) {
      console.error("Failed to load profile data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfileData();
  }, [loadProfileData]);

  useEffect(() => {
    const syncOnboardingStatus = () => {
      setOnboardingComplete(localStorage.getItem("onboarded") === "true");
    };

    syncOnboardingStatus();
    window.addEventListener("onboarding:completed", syncOnboardingStatus);

    return () => {
      window.removeEventListener("onboarding:completed", syncOnboardingStatus);
    };
  }, []);

  const handleUpdateLanguage = async (lang: string) => {
    const newConfig = {
      language: lang,
      paymentModeId: config.paymentModeId,
      defaultAccountId: config.defaultAccountId,
    };

    setConfig(newConfig);

    try {
      const updated = await apiFetch<UserConfig>("api/user-config/update", {
        method: "POST",
        body: JSON.stringify(newConfig),
      });

      if (updated) {
        setConfig({
          language: updated.language || lang,
          paymentModeId: updated.paymentModeId ?? newConfig.paymentModeId,
          defaultAccountId: updated.defaultAccountId ?? newConfig.defaultAccountId,
        });
      }
    } catch (error) {
      console.error("Failed to update language:", error);
    }
  };

  const handleUpdatePaymentMode = async (modeId: number) => {
    const newConfig = {
      language: config.language,
      paymentModeId: modeId,
      defaultAccountId: config.defaultAccountId,
    };

    setConfig(newConfig);

    try {
      const updated = await apiFetch<UserConfig>("api/user-config/update", {
        method: "POST",
        body: JSON.stringify(newConfig),
      });

      if (updated) {
        setConfig({
          language: updated.language || newConfig.language,
          paymentModeId: updated.paymentModeId ?? modeId,
          defaultAccountId: updated.defaultAccountId ?? newConfig.defaultAccountId,
        });
      }
    } catch (error) {
      console.error("Failed to update default payment mode:", error);
    }
  };

  const handleUpdateDefaultAccount = async (accountId: string) => {
    const parsedAccountId = Number(accountId);
    if (!Number.isInteger(parsedAccountId) || parsedAccountId <= 0) return;

    const newConfig = {
      language: config.language,
      paymentModeId: config.paymentModeId,
      defaultAccountId: parsedAccountId,
    };

    setConfig((current) => ({ ...current, defaultAccountId: parsedAccountId }));

    try {
      const updated = await apiFetch<UserConfig>("api/user-config/update", {
        method: "POST",
        body: JSON.stringify(newConfig),
      });

      if (updated) {
        setConfig({
          language: updated.language || newConfig.language,
          paymentModeId: updated.paymentModeId ?? newConfig.paymentModeId,
          defaultAccountId: updated.defaultAccountId ?? parsedAccountId,
        });
      }
    } catch (error) {
      console.error("Failed to update default account:", error);
      await loadProfileData();
    }
  };

  const resetAccountForm = () => {
    setNewAccount(initialAccountForm);
    setAccountError(null);
  };

  const handleOpenAccountModal = () => {
    resetAccountForm();
    setAddAccountOpen(true);
  };

  const handleCloseAccountModal = () => {
    if (addingAccount) return;

    setAddAccountOpen(false);
    resetAccountForm();
  };

  const handleCreateAccount = async () => {
    const isCashAccount = newAccount.type === "CASH";
    const bankName = newAccount.bankName.trim();
    const lastFourDigits = newAccount.lastFourDigits.trim();
    const amountText = newAccount.amount.trim();
    const amount = Number(amountText);

    if (!isCashAccount && !bankName) {
      setAccountError("Bank name is required.");
      return;
    }

    if (!isCashAccount && !/^\d{4}$/.test(lastFourDigits)) {
      setAccountError("Last 4 digits must be exactly 4 numbers.");
      return;
    }

    if (!amountText || !Number.isFinite(amount) || amount < 0) {
      setAccountError("Enter a valid non-negative amount.");
      return;
    }

    setAddingAccount(true);
    setAccountError(null);

    try {
      await addAccount({
        bankName,
        lastFourDigits,
        type: newAccount.type,
        amount,
      });

      await loadProfileData();
      setAddAccountOpen(false);
      resetAccountForm();
    } catch (error) {
      console.error("Failed to add account:", error);
      setAccountError(
        error instanceof Error ? error.message : "Failed to add account.",
      );
    } finally {
      setAddingAccount(false);
    }
  };

  const handleDeleteAccount = async (account: Account) => {
    const accountLabel = `${account.bankName} ending in ${account.lastFourDigits}`;
    const confirmed = window.confirm(
      `Remove ${accountLabel}? This will hide it from your active accounts while keeping its history safe.`,
    );

    if (!confirmed) return;

    setDeletingAccountId(account.id);
    setAccountActionError(null);

    try {
      await deleteAccount(account.id);
      setAccounts((current) => current.filter(({ id }) => id !== account.id));
    } catch (error) {
      console.error("Failed to remove account:", error);
      setAccountActionError(
        error instanceof Error ? error.message : "Failed to remove account.",
      );
    } finally {
      setDeletingAccountId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-5 pb-20 sm:p-6 lg:p-10">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-app-primary to-violet-600 p-6 text-white shadow-lg shadow-indigo-200/50 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-24 size-44 rounded-full border-[18px] border-white/10" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-50">
              <span className="size-1.5 rounded-full bg-emerald-300" />
              Preferences & controls
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Account Settings
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
              Personalize your experience and keep your payment accounts ready
              for every transaction.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm">
            <span
              className={`size-2 rounded-full ${
                onboardingComplete ? "bg-emerald-300" : "bg-white/50"
              }`}
            />
            {onboardingComplete ? "Onboarding complete" : "Finish onboarding"}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl space-y-8 pb-12">
        <div className="flex items-end justify-between gap-4 px-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-app-primary">
              Personal workspace
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-app-text-primary sm:text-2xl">
              Make it work your way
            </h2>
            <p className="app-body mt-1 text-xs sm:text-sm">
              Choose your defaults and manage the accounts connected to your wallet.
            </p>
          </div>
        </div>

        <LanguageSettings
          currentLanguage={config.language}
          onLanguageChange={handleUpdateLanguage}
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <CategoryManager />
          <CardManager />

          <div className="app-card p-5 transition-all duration-200 sm:p-6 xl:col-span-2">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-app-primary">
                <Coins className="size-4.5" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-app-text-primary sm:text-base">
                  Default Payment Mode
                </h3>
                <p className="text-xs text-app-text-secondary">
                  Primary mode selected by default for new transactions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {paymentModes.map((mode) => {
                const isSelected = config.paymentModeId === mode.id;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => void handleUpdatePaymentMode(mode.id)}
                    className={`group relative flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-app-primary bg-indigo-50/70 shadow-xs ring-2 ring-indigo-100"
                        : "border-app-border bg-app-surface shadow-xs hover:border-indigo-200 hover:bg-indigo-50/20"
                    }`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isSelected
                          ? "bg-app-primary text-white"
                          : "bg-indigo-50 text-app-primary"
                      }`}
                    >
                      {mode.icon}
                    </div>

                    <span className="truncate text-xs font-bold text-app-text-primary sm:text-sm">
                      {mode.name}
                    </span>

                    {isSelected && (
                      <span className="ml-auto flex size-4 shrink-0 items-center justify-center rounded-full bg-app-primary text-white">
                        <Check className="size-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="app-card space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-app-border pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-app-primary">
                <Building2 className="size-4.5" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-app-text-primary sm:text-base">
                  Linked Accounts
                </h3>
                <p className="mt-0.5 text-xs text-app-text-secondary">
                  Bank accounts, cards, and cash balance
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAccountModal}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-app-primary px-3.5 text-xs font-semibold text-white shadow-xs transition hover:bg-app-primary-hover active:scale-95"
            >
              <Plus className="size-3.5 stroke-[2.5]" />
              Add Account
            </button>
          </div>

          <div className="grid gap-3">
            {accountActionError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
              >
                {accountActionError}
              </div>
            )}
            {loading ? (
              <div className="h-18 w-full animate-pulse rounded-2xl border border-app-border bg-gray-100/70" />
            ) : accounts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-app-border bg-app-surface p-8 text-center text-xs text-app-text-muted">
                No linked accounts found. Click &ldquo;Add Account&rdquo; to
                connect one.
              </div>
            ) : (
              accounts.map((acc) => (
                <AccountCard
                  key={acc.id}
                  bankName={acc.bankName}
                  lastFour={acc.lastFourDigits}
                  type={acc.type}
                  amount={acc.amount}
                  isDefault={config.defaultAccountId === Number(acc.id)}
                  onSetDefault={() => void handleUpdateDefaultAccount(acc.id)}
                  onDelete={() => void handleDeleteAccount(acc)}
                  deleting={deletingAccountId === acc.id}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {addAccountOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseAccountModal();
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-app-border bg-app-surface p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-account-title"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3
                  id="add-account-title"
                  className="text-lg font-bold text-app-text-primary"
                >
                  Add Account
                </h3>
                <p className="mt-0.5 text-xs text-app-text-secondary">
                  Save a new savings account or credit card to your profile.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close add account dialog"
                onClick={handleCloseAccountModal}
                className="rounded-lg p-1.5 text-app-text-muted transition hover:bg-gray-100 hover:text-app-text-primary"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              {accountError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
                >
                  {accountError}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {newAccount.type !== "CASH" && (
                  <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="bank-name"
                    className="text-xs font-semibold text-app-text-primary"
                  >
                    Bank Name
                  </label>

                  <select
                    id="bank-name"
                    className="h-10 w-full cursor-pointer rounded-xl border border-app-border bg-app-surface px-3.5 text-sm font-medium text-app-text-primary outline-none transition focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
                    value={newAccount.bankName}
                    onChange={(event) =>
                      setNewAccount((current) => ({
                        ...current,
                        bankName: event.target.value,
                      }))
                    }
                    disabled={banks.length === 0}
                  >
                    <option value="">
                      {banks.length === 0 ? "No banks available" : "Select a bank"}
                    </option>
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.name}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  </div>
                )}

                {newAccount.type !== "CASH" && (
                  <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="last-four-digits"
                    className="text-xs font-semibold text-app-text-primary"
                  >
                    Last 4 Digits
                  </label>

                  <input
                    id="last-four-digits"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={4}
                    className="h-10 w-full rounded-xl border border-app-border bg-app-surface px-3.5 text-sm font-medium text-app-text-primary outline-none transition placeholder:text-app-text-muted focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
                    placeholder="e.g. 4321"
                    value={newAccount.lastFourDigits}
                    onChange={(event) =>
                      setNewAccount((current) => ({
                        ...current,
                        lastFourDigits: event.target.value.replace(/\D/g, ""),
                      }))
                    }
                  />
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-app-text-primary">
                    Account Type
                  </span>

                  <div className="flex h-10 items-center rounded-xl border border-gray-200 bg-gray-200/70 p-1 text-xs font-semibold">
                    {(["SAVINGS", "CREDIT", "CASH"] as const).map((type) => {
                      const selected = newAccount.type === type;

                      return (
                        <button
                          key={type}
                          type="button"
                          disabled={type === "CASH" && hasCashAccount}
                          title={
                            type === "CASH" && hasCashAccount
                              ? "You already have a cash account"
                              : undefined
                          }
                          onClick={() =>
                            setNewAccount((current) => ({
                              ...current,
                              type,
                              bankName: type === "CASH" ? "" : current.bankName,
                              lastFourDigits:
                                type === "CASH" ? "" : current.lastFourDigits,
                            }))
                          }
                          className={`flex-1 rounded-lg py-1.5 transition-all ${
                            selected
                              ? "bg-app-surface font-bold text-app-text-primary shadow-xs"
                              : "text-app-text-secondary hover:text-app-text-primary"
                          } ${
                            type === "CASH" && hasCashAccount
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                        >
                          {type === "SAVINGS"
                            ? "Savings"
                            : type === "CREDIT"
                              ? "Credit"
                              : "Cash"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="account-amount"
                    className="text-xs font-semibold text-app-text-primary"
                  >
                    {newAccount.type === "CREDIT"
                      ? "Credit Limit"
                      : newAccount.type === "CASH"
                        ? "Cash Balance"
                        : "Balance"}
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-app-text-muted">
                      ₹
                    </span>

                    <input
                      id="account-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      className="h-10 w-full rounded-xl border border-app-border bg-app-surface py-2 pl-7 pr-3.5 text-sm font-medium text-app-text-primary outline-none transition placeholder:text-app-text-muted focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
                      placeholder="0.00"
                      value={newAccount.amount}
                      onChange={(event) =>
                        setNewAccount((current) => ({
                          ...current,
                          amount: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-app-border pt-4">
              <button
                type="button"
                onClick={handleCloseAccountModal}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-app-border bg-app-surface px-4 text-xs font-semibold text-app-text-secondary shadow-xs transition hover:bg-gray-50 hover:text-app-text-primary"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={addingAccount}
                onClick={() => void handleCreateAccount()}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-app-primary px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-app-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingAccount && <Loader2 className="size-3.5 animate-spin" />}
                Save Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
