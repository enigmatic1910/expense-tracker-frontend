import { apiFetch } from "./api-client";
import { Account } from "./model/Account";

export type AccountType = "SAVINGS" | "CREDIT" | "CASH";

export interface CreateAccountRequest {
  bankName: string;
  lastFourDigits: string;
  type: AccountType;
  amount: number;
}

export interface AccountListRequest {
  accounts: CreateAccountRequest[];
}

export async function getAccounts(): Promise<Account[]> {
  try {
    const data = await apiFetch("api/account/all", { method: "GET" });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    return [];
  }
}

export async function addAccount(
  account: CreateAccountRequest,
): Promise<Account[]> {
  const response = await apiFetch("api/account", {
    method: "POST",
    body: JSON.stringify({ accounts: [account] } as AccountListRequest),
  });

  return Array.isArray(response) ? response : [];
}

export async function deleteAccount(accountId: string): Promise<void> {
  await apiFetch(`api/account/${encodeURIComponent(accountId)}`, {
    method: "DELETE",
  });
}
