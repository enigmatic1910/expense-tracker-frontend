"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { Transaction } from "@/lib/api/model/Transaction";
import type { Account } from "@/lib/api/model/Account";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "@/lib/api/transactions";
import { getAccounts } from "@/lib/api/accounts";
import { getCategories, addCategory, Category } from "@/lib/api/categories";
import { getPaymentModes, PaymentMode } from "@/lib/api/paymentModes";
import { getCards, Card } from "@/lib/api/cards";

const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export type RecentActivityProps = {
  transactions?: Transaction[];
  title?: string;
  description?: string;
  className?: string;
  onViewAll?: () => void;
  maxItems?: number;
};

function CategoryIcon({ category, type }: { category: string; type: string }) {
  const normalized = category.toLowerCase();

  if (type === "income") {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m17 7-10 10M17 7H7M17 7v10"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (normalized.includes("grocer") || normalized.includes("market")) {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6ZM3 6h18M16 10a4 4 0 0 1-8 0"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (
    normalized.includes("food") ||
    normalized.includes("dining") ||
    normalized.includes("coffee")
  ) {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8ZM6 1v3M10 1v3M14 1v3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (
    normalized.includes("entertainment") ||
    normalized.includes("subscript") ||
    normalized.includes("netflix")
  ) {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m5 3 14 9-14 9V3Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (
    normalized.includes("utilit") ||
    normalized.includes("bill") ||
    normalized.includes("electric")
  ) {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (
    normalized.includes("fitness") ||
    normalized.includes("gym") ||
    normalized.includes("health")
  ) {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.5 6.5h11M6.5 17.5h11M12 3v18M3 9.5h3v5H3zM18 9.5h3v5h-3z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 17 17 7M17 7H7M17 7v10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function RecentActivity({
  transactions: initialTransactions,
  title = "Recent Transactions",
  description = "Real-time account cashflow and transactions log",
  className = "",
  onViewAll,
  maxItems,
}: RecentActivityProps) {
  const [filter, setFilter] = useState<"all" | "expense" | "income">("all");
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialTransactions || [],
  );
  const [loading, setLoading] = useState(!initialTransactions);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    transactionType: "expense",
    transactionDate: "",
    accountId: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    description: "",
    amount: "",
    transactionType: "expense",
    transactionDate: new Date().toISOString().split("T")[0],
    accountId: "",
    categoryId: "",
    paymentModeId: "",
    cardId: "",
    toAccount: "",
  });
  const [savingAdd, setSavingAdd] = useState(false);
  const [addError, setAddError] = useState("");
  const addDialogRef = useRef<HTMLDialogElement>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [customCategoryName, setCustomCategoryName] = useState("");

  // Derived state for available payment modes based on selected account
  const selectedAccount = accounts.find(
    (a) => String(a.id) === String(addForm.accountId),
  );
  const isCashAccount =
    selectedAccount?.type?.toUpperCase() === "CASH" ||
    selectedAccount?.bankName?.toLowerCase().includes("cash");

  const availablePaymentModes = paymentModes.filter((pm) => {
    const isCashPm = pm.name?.toLowerCase().trim() === "cash";
    return isCashAccount ? isCashPm : !isCashPm;
  });

  const selectedPaymentMode = paymentModes.find(
    (pm) => pm.id.toString() === addForm.paymentModeId,
  );
  const isCardPayment =
    selectedPaymentMode?.name?.toLowerCase().includes("card") ?? false;
  const availableCards = cards.filter(
    (card) => !selectedAccount || card.accountId === Number(selectedAccount.id),
  );

  // Auto-correct payment mode if it becomes invalid due to account change
  useEffect(() => {
    if (availablePaymentModes.length > 0) {
      const currentPmValid = availablePaymentModes.some(
        (pm) => pm.id.toString() === addForm.paymentModeId,
      );
      if (!currentPmValid) {
        setAddForm((prev) => ({
          ...prev,
          paymentModeId: availablePaymentModes[0].id.toString(),
        }));
      }
    }
  }, [addForm.accountId, availablePaymentModes, addForm.paymentModeId]);

  const openAddModal = async () => {
    setAddError("");
    setAddForm({
      description: "",
      amount: "",
      transactionType: "expense",
      transactionDate: new Date().toISOString().split("T")[0],
      accountId: "",
      categoryId: "",
      paymentModeId: "",
      cardId: "",
      toAccount: "",
    });
    setCustomCategoryName("");
    addDialogRef.current?.showModal();
    setIsAdding(true);

    // Fetch options for the dropdowns
    try {
      const [accs, cats, pms, cardList] = await Promise.all([
        getAccounts(),
        getCategories(),
        getPaymentModes(),
        getCards(),
      ]);
      setAccounts(accs);
      setCategories(cats);
      setPaymentModes(pms);
      setCards(cardList);

      const defaultAccId = accs.length > 0 ? accs[0].id.toString() : "";

      setAddForm((prev) => ({
        ...prev,
        accountId: defaultAccId,
        categoryId: cats.length > 0 ? cats[0].id.toString() : "",
      }));
    } catch (err) {
      console.error("Failed to load options for modal", err);
    }
  };

  const closeAddModal = () => {
    addDialogRef.current?.close();
    setIsAdding(false);
    setAddError("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const accountId = parseInt(addForm.accountId, 10);
    const paymentModeId = parseInt(addForm.paymentModeId, 10);
    const isTransfer = addForm.transactionType === "transfer";
    const toAccount = parseInt(addForm.toAccount, 10);

    if (!addForm.accountId || isNaN(accountId)) {
      setAddError("Account ID is required.");
      return;
    }
    if (!addForm.paymentModeId || isNaN(paymentModeId)) {
      setAddError("Payment Mode is required.");
      return;
    }
    if (isCardPayment && !addForm.cardId) {
      setAddError("Select the card used for this transaction.");
      return;
    }
    if (isTransfer && (!addForm.toAccount || isNaN(toAccount))) {
      setAddError("To Account is required for transfers.");
      return;
    }
    if (addForm.categoryId === "custom" && !customCategoryName.trim()) {
      setAddError("Please provide a name for the new category.");
      return;
    }

    setSavingAdd(true);
    setAddError("");
    try {
      let finalCategoryId = parseInt(addForm.categoryId, 10);

      // Create new category if custom was selected
      if (addForm.categoryId === "custom") {
        const newCat = await addCategory(customCategoryName.trim());
        finalCategoryId = newCat.id;
        setCategories((prev) => [...prev, newCat]);
      }

      if (isNaN(finalCategoryId)) {
        throw new Error("Invalid Category ID");
      }

      const added = await createTransaction({
        transactionType: addForm.transactionType.toUpperCase(),
        amount: parseFloat(addForm.amount),
        description: addForm.description,
        paymentModeId,
        categoryId: finalCategoryId,
        accountId,
        transactionDate: addForm.transactionDate,
        ...(isCardPayment && addForm.cardId && { cardId: addForm.cardId }),
        ...(isTransfer && { toAccount }),
      });
      setTransactions((current) => [added, ...current].slice(0, 15));
      closeAddModal();
    } catch (err: any) {
      setAddError(
        err.message || "Failed to add transaction. Please try again.",
      );
    } finally {
      setSavingAdd(false);
    }
  };

  // Load (or reload) transactions whenever the filter or the prop changes.
  // When initialTransactions is provided (prop-driven), filter client-side only.
  useEffect(() => {
    if (initialTransactions !== undefined) {
      setTransactions(initialTransactions);
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const data = await getTransactions(filter);
        setTransactions(Array.isArray(data) ? data : []);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [initialTransactions, filter]);

  // Client-side filter used when transactions come from props (dashboard page).
  const filteredTransactions = initialTransactions
    ? transactions.filter((tx) => {
        if (filter === "all") return true;
        return tx.transactionType.toLowerCase() === filter;
      })
    : transactions;
  const visibleTransactions = maxItems
    ? filteredTransactions.slice(0, maxItems)
    : filteredTransactions;

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setEditError("");
    setEditForm({
      description: tx.description,
      amount: Math.abs(tx.amount).toString(),
      transactionType: tx.transactionType.toLowerCase(),
      transactionDate: tx.transactionDate,
      accountId: "",
    });
    dialogRef.current?.showModal();
  };

  const closeEditModal = () => {
    dialogRef.current?.close();
    setEditingTx(null);
    setEditError("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const accountId = parseInt(editForm.accountId, 10);
    if (!editForm.accountId || isNaN(accountId)) {
      setEditError("Account ID is required.");
      return;
    }

    setSavingEdit(true);
    setEditError("");
    try {
      const updated = await updateTransaction({
        transactionId: parseInt(editingTx.transactionId, 10),
        transactionType: editForm.transactionType.toUpperCase(),
        amount: parseFloat(editForm.amount),
        description: editForm.description,
        paymentModeId: editingTx.paymentModeId ?? 1,
        categoryId: editingTx.categoryId ?? 1,
        accountId,
        transactionDate: editForm.transactionDate,
        transferId: editingTx.transferId ?? undefined,
      });
      setTransactions((current) =>
        current.map((tx) =>
          tx.transactionId === editingTx.transactionId
            ? { ...tx, ...updated }
            : tx,
        ),
      );
      closeEditModal();
    } catch {
      setEditError("Failed to update transaction. Please try again.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (transactionId: string) => {
    if (!window.confirm("Delete this transaction? This cannot be undone.")) {
      return;
    }

    setDeletingId(transactionId);
    try {
      await deleteTransaction(transactionId);
      setTransactions((current) =>
        current.filter(
          (transaction) => transaction.transactionId !== transactionId,
        ),
      );
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className={`app-card p-4 sm:p-6 md:p-7 transition-all duration-200 hover:shadow-md ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="app-section-title text-base font-bold text-app-text-primary">
            {title}
          </h2>
          {description && (
            <p className="app-body mt-0.5 text-xs text-app-text-secondary">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-app-border bg-gray-50/80 p-1">
            {(["all", "expense", "income"] as const).map((type) => (
              <button
                key={type}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                  filter === type
                    ? "bg-white text-app-primary shadow-xs"
                    : "text-app-text-muted hover:text-app-text-primary"
                }`}
                onClick={() => setFilter(type)}
                type="button"
              >
                {type}
              </button>
            ))}
          </div>

          {onViewAll && (
            <button
              className="rounded-lg border border-app-border bg-white px-3 py-1.5 text-xs font-semibold text-app-text-primary transition hover:bg-gray-50"
              onClick={onViewAll}
              type="button"
            >
              View all
            </button>
          )}
          <button
            className="flex items-center gap-1 rounded-lg bg-app-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-app-primary-hover"
            onClick={openAddModal}
            type="button"
          >
            <Plus className="size-3.5" />
            Add
          </button>
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-6 animate-spin rounded-full border-2 border-app-primary border-t-transparent" />
            <p className="app-meta mt-3 text-xs">
              Loading transactions from backend...
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gray-50 text-app-text-muted">
              <svg
                aria-hidden="true"
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </div>
            <p className="mt-3 text-sm font-semibold text-app-text-primary">
              No transactions found
            </p>
            <p className="app-meta mt-1 text-xs">
              There are no {filter} transactions recorded.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-app-border/70">
            {visibleTransactions.map((tx) => {
              const isIncome = tx.transactionType === "income";
              const category = tx.transferId ? "Transfer" : tx.transactionType;

              return (
                <li
                  key={tx.transactionId}
                  className="group flex flex-wrap items-center justify-between gap-y-2 rounded-xl px-3 py-3.5 transition duration-150 hover:bg-indigo-50/30 sm:flex-nowrap"
                >
                  <div className="flex min-w-0 flex-1 basis-[calc(100%-3rem)] items-center gap-3.5 sm:basis-auto">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-rose-50 text-rose-600 border border-rose-100"
                      }`}
                    >
                      <CategoryIcon
                        category={category}
                        type={tx.transactionType}
                      />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-app-text-primary group-hover:text-indigo-600 transition">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="app-meta text-xs">
                          {tx.transactionDate}
                        </span>
                        <span className="text-[10px] text-app-text-muted">
                          •
                        </span>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            isIncome
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {category}
                        </span>
                        {tx.cardLastFourDigits && (
                          <span className="text-[11px] text-app-text-muted">
                            {tx.cardType === "CREDIT_CARD" ? "Credit" : "Debit"}{" "}
                            •••• {tx.cardLastFourDigits}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="order-2 ml-auto flex items-center gap-1.5 sm:order-none sm:ml-3">
                    {/* EDIT FEATURE COMMENTED OUT
                    <button
                      type="button"
                      title="Edit transaction"
                      aria-label="Edit transaction"
                      onClick={() => openEditModal(tx)}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-indigo-100 text-indigo-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    */}

                    <button
                      type="button"
                      title="Delete transaction"
                      aria-label="Delete transaction"
                      disabled={deletingId === tx.transactionId}
                      onClick={() => void handleDelete(tx.transactionId)}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === tx.transactionId ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="order-3 w-full pl-[3.5rem] text-left sm:order-none sm:ml-4 sm:w-auto sm:shrink-0 sm:pl-0 sm:text-right">
                    <p
                      className={`font-mono text-sm sm:text-base font-bold ${
                        isIncome ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {rupeeFormatter.format(Math.abs(tx.amount))}
                    </p>
                    <span className="app-meta text-[11px] uppercase tracking-wider">
                      {tx.transactionType}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Edit Modal ── */}
      <dialog
        ref={dialogRef}
        className="m-auto max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-app-border bg-white p-0 shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm sm:w-full"
        onClose={closeEditModal}
      >
        <form
          onSubmit={(e) => void handleUpdate(e)}
          className="flex flex-col gap-5 p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-app-text-primary">
              Edit Transaction
            </h3>
            <button
              type="button"
              onClick={closeEditModal}
              className="flex size-7 items-center justify-center rounded-lg text-app-text-muted transition hover:bg-gray-100 hover:text-app-text-primary"
            >
              ✕
            </button>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-app-text-primary"
              htmlFor="edit-description"
            >
              Description
            </label>
            <input
              id="edit-description"
              type="text"
              required
              value={editForm.description}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, description: e.target.value }))
              }
              className="rounded-xl border border-app-border bg-gray-50 px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Amount + Type */}
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <label
                className="text-xs font-semibold text-app-text-primary"
                htmlFor="edit-amount"
              >
                Amount
              </label>
              <input
                id="edit-amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, amount: e.target.value }))
                }
                className="rounded-xl border border-app-border bg-gray-50 px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold text-app-text-primary"
                htmlFor="edit-type"
              >
                Type
              </label>
              <select
                id="edit-type"
                value={editForm.transactionType}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    transactionType: e.target.value,
                  }))
                }
                className="rounded-xl border border-app-border bg-gray-50 px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-app-text-primary"
              htmlFor="edit-date"
            >
              Date
            </label>
            <input
              id="edit-date"
              type="date"
              required
              value={editForm.transactionDate}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, transactionDate: e.target.value }))
              }
              className="rounded-xl border border-app-border bg-gray-50 px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Account ID */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-app-text-primary"
              htmlFor="edit-account"
            >
              Account ID
            </label>
            <input
              id="edit-account"
              type="number"
              min="1"
              step="1"
              required
              placeholder="Enter your account ID"
              value={editForm.accountId}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, accountId: e.target.value }))
              }
              className="rounded-xl border border-app-border bg-gray-50 px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Error */}
          {editError && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
              {editError}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeEditModal}
              className="rounded-xl border border-app-border px-4 py-2 text-sm font-semibold text-app-text-primary transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className="inline-flex items-center gap-2 rounded-xl bg-app-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-app-primary-hover disabled:opacity-50"
            >
              {savingEdit && <Loader2 className="size-3.5 animate-spin" />}
              {savingEdit ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </dialog>
      {/* ── Add Modal ── */}
      <dialog
        ref={addDialogRef}
        className="w-full max-w-md rounded-2xl border border-app-border bg-white p-0 shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm m-auto fixed inset-0 max-h-[90vh] overflow-y-auto"
        onClose={closeAddModal}
      >
        <form
          onSubmit={(e) => void handleAdd(e)}
          className="flex flex-col gap-4 p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-app-text-primary">
              Add Transaction
            </h3>
            <button
              type="button"
              onClick={closeAddModal}
              className="flex size-7 items-center justify-center rounded-lg text-app-text-muted transition hover:bg-gray-100 hover:text-app-text-primary"
            >
              ✕
            </button>
          </div>

          {/* Type Selector (Buttons) */}
          <div className="flex rounded-xl bg-gray-100 p-1">
            {["expense", "income", "transfer"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setAddForm((f) => ({ ...f, transactionType: type }))
                }
                className={`flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition ${
                  addForm.transactionType === type
                    ? "bg-white text-app-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5 w-full">
            <label
              className="text-xs font-semibold text-app-text-primary"
              htmlFor="add-description"
            >
              Description
            </label>
            <input
              id="add-description"
              type="text"
              required
              value={addForm.description}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full rounded-xl border border-app-border bg-gray-50 px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Amount & Date */}
          <div className="flex gap-3 w-full">
            <div className="flex flex-1 flex-col gap-1.5">
              <label
                className="text-xs font-semibold text-app-text-primary"
                htmlFor="add-amount"
              >
                Amount
              </label>
              <input
                id="add-amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={addForm.amount}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, amount: e.target.value }))
                }
                className="w-full rounded-xl border border-app-border bg-gray-50 px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                className="text-xs font-semibold text-app-text-primary"
                htmlFor="add-date"
              >
                Date
              </label>
              <input
                id="add-date"
                type="date"
                required
                value={addForm.transactionDate}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, transactionDate: e.target.value }))
                }
                className="w-full rounded-xl border border-app-border bg-gray-50 px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Accounts */}
          <div className="flex gap-3 w-full">
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                className="text-xs font-semibold text-app-text-primary"
                htmlFor="add-account"
              >
                {addForm.transactionType === "transfer"
                  ? "From Account"
                  : "Account"}
              </label>
              <select
                id="add-account"
                required
                value={addForm.accountId}
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    accountId: e.target.value,
                    cardId: "",
                  }))
                }
                className="w-full rounded-xl border border-app-border bg-gray-50 px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
              >
                <option value="" disabled>
                  Select Account
                </option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bankName} (..{acc.lastFourDigits})
                  </option>
                ))}
              </select>
            </div>

            {addForm.transactionType === "transfer" && (
              <div className="flex flex-col gap-1.5 flex-1">
                <label
                  className="text-xs font-semibold text-app-text-primary"
                  htmlFor="add-to-account"
                >
                  To Account
                </label>
                <select
                  id="add-to-account"
                  required
                  value={addForm.toAccount}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, toAccount: e.target.value }))
                  }
                  className="w-full rounded-xl border border-app-border bg-gray-50 px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="" disabled>
                    Select Account
                  </option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName} (..{acc.lastFourDigits})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Category & Payment Mode */}
          <div className="flex gap-3 w-full">
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                className="text-xs font-semibold text-app-text-primary"
                htmlFor="add-category"
              >
                Category
              </label>
              <select
                id="add-category"
                required
                value={addForm.categoryId}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, categoryId: e.target.value }))
                }
                className="w-full rounded-xl border border-app-border bg-gray-50 px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
                <option value="custom" className="font-bold text-app-primary">
                  + Add New Category
                </option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label
                className="text-xs font-semibold text-app-text-primary"
                htmlFor="add-payment-mode"
              >
                Pay Mode
              </label>
              <select
                id="add-payment-mode"
                required
                value={addForm.paymentModeId}
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    paymentModeId: e.target.value,
                    cardId: "",
                  }))
                }
                className="w-full rounded-xl border border-app-border bg-gray-50 px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
              >
                <option value="" disabled>
                  Select Pay Mode
                </option>
                {availablePaymentModes.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isCardPayment && (
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold text-app-text-primary"
                htmlFor="add-card"
              >
                Card used
              </label>
              <select
                id="add-card"
                required
                value={addForm.cardId}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, cardId: e.target.value }))
                }
                className="w-full rounded-xl border border-app-border bg-gray-50 px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
              >
                <option value="" disabled>
                  {availableCards.length > 0
                    ? "Select card"
                    : "No cards linked to this account"}
                </option>
                {availableCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.cardType === "CREDIT_CARD" ? "Credit" : "Debit"} card
                    •••• {card.lastFourDigits}
                  </option>
                ))}
              </select>
              {availableCards.length === 0 && (
                <p className="text-[11px] text-app-text-muted">
                  Link a card to this account from Account Settings first.
                </p>
              )}
            </div>
          )}

          {/* Custom Category Name Input */}
          {addForm.categoryId === "custom" && (
            <div className="flex flex-col gap-1.5 w-full">
              <label
                className="text-xs font-semibold text-app-text-primary"
                htmlFor="custom-category"
              >
                New Category Name
              </label>
              <input
                id="custom-category"
                type="text"
                required
                autoFocus
                placeholder="Ex: Groceries, Travel..."
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                className="w-full rounded-xl border border-app-primary/50 bg-indigo-50/30 px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          )}

          {/* Error */}
          {addError && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
              {addError}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeAddModal}
              className="rounded-xl border border-app-border px-4 py-2 text-sm font-semibold text-app-text-primary transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-app-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-app-primary-hover disabled:opacity-50"
            >
              {savingAdd && <Loader2 className="size-3.5 animate-spin" />}
              {savingAdd ? "Saving…" : "Add Transaction"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

export default RecentActivity;
