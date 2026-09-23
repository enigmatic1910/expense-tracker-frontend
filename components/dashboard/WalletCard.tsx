"use client";

import { useEffect, useState } from "react";
import { getAccounts } from "@/lib/api/accounts";
import { getTransactionSummary } from "@/lib/api/transactions";
import { getCurrentUser } from "@/lib/api/users";

export type WalletCardProps = {
  balance?: number;
  income?: number;
  expenses?: number;
  currency?: string;
  accountName?: string;
  userName?: string;
  className?: string;
};

export function WalletCard({
  balance,
  income,
  expenses,
  currency = "\u20B9",
  accountName,
  userName,
  className = "",
}: WalletCardProps) {
  const [wallet, setWallet] = useState({
    balance: balance ?? 0,
    income: income ?? 0,
    expenses: expenses ?? 0,
    accountName: accountName ?? "Available Funds",
    userName: userName ?? "User",
    cash: 0,
  });

  useEffect(() => {
    if (balance !== undefined || income !== undefined || expenses !== undefined)
      return;

    Promise.all([getAccounts(), getTransactionSummary(), getCurrentUser()])
      .then(([accounts, summary, user]) => {
        setWallet({
          balance: accounts.reduce(
            (sum, account) => sum + (account.amount ?? 0),
            0,
          ),
          income: summary.income ?? 0,
          expenses: summary.expenses ?? 0,
          accountName: "Available Funds",
          userName: user.name || "User",
          cash: accounts
            .filter(
              (account) =>
                account.type?.toUpperCase() === "CASH" ||
                account.lastFourDigits?.toUpperCase() === "CASH" ||
                !account.bankName,
            )
            .reduce((sum, account) => sum + (account.amount ?? 0), 0),
        });
      })
      .catch((error) => console.error("Failed to load wallet summary:", error));
  }, [accountName, balance, expenses, userName, income]);

  const formatAmount = (amount: number) =>
    amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  return (
    <div
      className={`app-card flex flex-col justify-between overflow-hidden p-4 sm:p-6 md:p-7 transition-all duration-200 hover:shadow-md ${className}`}
    >
      <div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-5 text-white shadow-md">
          <div className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-indigo-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 size-28 rounded-full bg-indigo-500/20 blur-2xl" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-9 items-center justify-center rounded-md border border-amber-300/40 bg-gradient-to-tr from-amber-200 via-amber-300 to-yellow-100 shadow-inner">
                <div className="grid grid-cols-2 gap-0.5 opacity-60">
                  <div className="h-2 w-3 rounded-xs border border-amber-800/40" />
                  <div className="h-2 w-3 rounded-xs border border-amber-800/40" />
                </div>
              </div>

              <svg
                aria-hidden="true"
                className="size-4 text-white/70"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.5 16.5a6 6 0 0 1 0-9M12 19a10 10 0 0 0 0-14M15.5 21.5a14 14 0 0 0 0-19"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
              </svg>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium tracking-wide text-white/90">
                {wallet.accountName}
              </span>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/60">
              Total Balance
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-white/80">
                {currency}
              </span>
              <span className="font-mono text-3xl font-extrabold tracking-tight text-white sm:text-[32px]">
                {formatAmount(wallet.balance)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/70">
            <span className="font-mono font-medium tracking-widest">
              <span className="max-w-[55%] truncate">{wallet.userName}</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-300">
              Live balance
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 transition hover:bg-emerald-50">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100">
              <svg
                aria-hidden="true"
                className="size-3"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 19V5M5 12l7-7 7 7"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                />
              </svg>
            </span>
            <span className="text-xs font-semibold">Income</span>
          </div>
          <p className="app-financial-value mt-2 text-base font-bold text-emerald-700">
            +{currency}
            {formatAmount(wallet.income)}
          </p>
        </div>

        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 transition hover:bg-rose-50">
          <div className="flex items-center gap-1.5 text-rose-700">
            <span className="flex size-5 items-center justify-center rounded-full bg-rose-100">
              <svg
                aria-hidden="true"
                className="size-3"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5v14M5 12l7 7 7-7"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                />
              </svg>
            </span>
            <span className="text-xs font-semibold">Expenses</span>
          </div>
          <p className="app-financial-value mt-2 text-base font-bold text-rose-700">
            -{currency}
            {formatAmount(wallet.expenses)}
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-amber-100 bg-amber-50/60 p-3.5 transition hover:bg-amber-50">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-semibold">Cash Available</span>
            <span className="text-xs font-bold">
              {currency}
              {formatAmount(wallet.cash)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletCard;
