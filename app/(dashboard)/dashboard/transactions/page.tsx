"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Loader2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getTransactions } from "@/lib/api/transactions";
import type { Transaction } from "@/lib/api/model/Transaction";

const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [type, setType] = useState("all");
  const [month, setMonth] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    getTransactions()
      .then((data) => setTransactions(Array.isArray(data) ? data : []))
      .catch((loadError) => {
        console.error("Failed to load transactions:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load transactions.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredTransactions = useMemo(() => {
    let start = fromDate;
    let end = toDate;

    if (month) {
      const monthStart = `${month}-01`;
      const monthEnd = new Date(
        Number(month.slice(0, 4)),
        Number(month.slice(5, 7)),
        0,
      )
        .toISOString()
        .slice(0, 10);
      start = monthStart;
      end = monthEnd;
    }

    return transactions.filter((transaction) => {
      const transactionType = transaction.transactionType.toLowerCase();
      const matchesType = type === "all" || transactionType === type;
      const matchesFrom = !start || transaction.transactionDate >= start;
      const matchesTo = !end || transaction.transactionDate <= end;
      return matchesType && matchesFrom && matchesTo;
    });
  }, [fromDate, month, toDate, transactions, type]);

  const clearFilters = () => {
    setType("all");
    setMonth("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-app-primary hover:underline"
          >
            <ArrowLeft className="size-3.5" /> Back to analytics
          </button>
          <h1 className="app-title">Transaction History</h1>
          <p className="app-body mt-2">
            Review and filter your recent financial activity.
          </p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-semibold text-app-primary">
          {filteredTransactions.length} transaction
          {filteredTransactions.length === 1 ? "" : "s"} shown
        </div>
      </header>

      <section className="app-card grid gap-3 p-4 md:grid-cols-5 md:items-end">
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-app-text-primary">
          Type
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-sm font-medium outline-none focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
          >
            <option value="all">All transactions</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
            <option value="transfer">Transfers</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-app-text-primary">
          Month
          <input
            type="month"
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setFromDate("");
              setToDate("");
            }}
            className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-sm font-medium outline-none focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-app-text-primary">
          From date
          <input
            type="date"
            value={fromDate}
            disabled={Boolean(month)}
            onChange={(event) => {
              setFromDate(event.target.value);
              setMonth("");
            }}
            className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-sm font-medium outline-none disabled:cursor-not-allowed disabled:bg-gray-100 focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-app-text-primary">
          To date
          <input
            type="date"
            value={toDate}
            disabled={Boolean(month)}
            onChange={(event) => {
              setToDate(event.target.value);
              setMonth("");
            }}
            className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-sm font-medium outline-none disabled:cursor-not-allowed disabled:bg-gray-100 focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
          />
        </label>
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-app-border px-3 text-xs font-semibold text-app-text-secondary transition hover:bg-gray-50"
        >
          <X className="size-3.5" /> Clear filters
        </button>
      </section>

      <section className="app-card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-app-text-muted">
            <Loader2 className="size-5 animate-spin text-app-primary" /> Loading
            transactions...
          </div>
        ) : error ? (
          <div className="p-8 text-sm text-red-600">{error}</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Search className="size-8 text-app-text-muted" />
            <p className="mt-3 text-sm font-semibold text-app-text-primary">
              No transactions found
            </p>
            <p className="mt-1 text-xs text-app-text-muted">
              Try changing or clearing your filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-app-border/70">
            {filteredTransactions.map((transaction) => {
              const isIncome =
                transaction.transactionType.toLowerCase() === "income";
              return (
                <article
                  key={transaction.transactionId}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-indigo-50/20"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-sm font-bold text-app-text-primary">
                        {transaction.description || "Transaction"}
                      </h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${isIncome ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                      >
                        {transaction.transactionType}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-app-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3.5" />
                        {transaction.transactionDate}
                      </span>
                      <span>Category #{transaction.categoryId ?? "N/A"}</span>
                      {transaction.cardLastFourDigits && (
                        <span>
                          {transaction.cardType === "CREDIT_CARD"
                            ? "Credit"
                            : "Debit"}{" "}
                          card •••• {transaction.cardLastFourDigits}
                        </span>
                      )}
                    </div>
                  </div>
                  <p
                    className={`shrink-0 text-base font-bold ${isIncome ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {isIncome ? "+" : "-"}
                    {rupeeFormatter.format(Math.abs(transaction.amount))}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
