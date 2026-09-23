import { Transaction } from "./model/Transaction";
import { apiFetch } from "./api-client";

export interface CreateTransactionRequest {
  transactionId?: number;
  transactionType: string;
  amount: number;
  description: string;
  paymentModeId: number;
  categoryId: number;
  accountId: number;
  transactionDate: string;
  toAccount?: number;
  transferId?: string;
  cardId?: string;
}

export interface CategorySpend {
  category: string;
  amount: number;
}

export interface TransactionSummary {
  income: number;
  expenses: number;
}

export interface SpendingTrendPoint {
  day: string;
  spent: number;
  date: string;
}

export async function getSpendingTrend(days: 7 | 14 | 30): Promise<SpendingTrendPoint[]> {
  const data = await apiFetch<unknown>(`api/transactions/spending-trend?days=${days}`, {
    method: "GET",
  });

  return Array.isArray(data)
    ? data.map((item) => {
        const value = item as { day?: unknown; spent?: unknown; date?: unknown };
        return {
          day: String(value.day ?? ""),
          spent: Number(value.spent ?? 0),
          date: String(value.date ?? ""),
        };
      })
    : [];
}

export async function getTransactionSummary(): Promise<TransactionSummary> {
  return apiFetch<TransactionSummary>("api/transactions/summary", {
    method: "GET",
  });
}

export async function getCategorySpend(): Promise<CategorySpend[]> {
  const data = await apiFetch<unknown>("api/transactions/category-spend", {
    method: "GET",
  });

  return Array.isArray(data)
    ? data.map((item) => {
        const value = item as { category?: unknown; amount?: unknown };
        return {
          category: String(value.category ?? "Uncategorized"),
          amount: Number(value.amount ?? 0),
        };
      })
    : [];
}

export async function getTransactions(
  type?: "all" | "income" | "expense",
): Promise<Transaction[]> {
  const params = type && type !== "all" ? `?type=${type}` : "";
  const transactions: Transaction[] = await apiFetch(`api/transactions${params}`, {
    method: "GET",
  });
  return transactions;
}

export async function createTransaction(
  request: CreateTransactionRequest,
): Promise<Transaction> {
  return apiFetch<Transaction>("api/transactions", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export interface UpdateTransactionRequest {
  transactionId: number;
  transactionType: string;
  amount: number;
  description: string;
  paymentModeId: number;
  categoryId: number;
  accountId: number;
  transactionDate: string;
  toAccount?: number;
  transferId?: string;
  cardId?: string;
}

export async function updateTransaction(
  request: UpdateTransactionRequest,
): Promise<Transaction> {
  return apiFetch<Transaction>("api/transactions", {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  await apiFetch(`api/transactions/delete/${encodeURIComponent(transactionId)}`, {
    method: "DELETE",
  });
}
