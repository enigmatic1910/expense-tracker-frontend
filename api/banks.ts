import { apiFetch } from "./api-client";

export interface Bank {
  id: string;
  name: string;
}

export async function getBanks(): Promise<Bank[]> {
  const data = await apiFetch<unknown>("api/banks/all", { method: "GET" });

  if (!Array.isArray(data)) return [];

  return data
    .filter(
      (bank): bank is { id: unknown; name: unknown } =>
        typeof bank === "object" && bank !== null && "id" in bank && "name" in bank,
    )
    .map((bank) => ({
      id: String(bank.id),
      name: String(bank.name),
    }));
}
