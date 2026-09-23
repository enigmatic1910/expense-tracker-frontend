import { apiFetch } from "./api-client";

export type CardType = "CREDIT_CARD" | "DEBIT_CARD";

export interface Card {
  id: string;
  cardType: CardType;
  lastFourDigits: string;
  accountId: number | null;
  limit: number;
  bank?: { name?: string } | null;
}

export interface CardSummary {
  cardId: string;
  cardType: CardType;
  lastFourDigits: string;
  creditLimit: number | null;
  spent: number;
}

export async function getCards(): Promise<Card[]> {
  const response = await apiFetch("api/cards", { method: "GET" });
  return Array.isArray(response) ? response : [];
}

export async function getCardSummaries(): Promise<CardSummary[]> {
  const response = await apiFetch("api/cards/summary", { method: "GET" });
  return Array.isArray(response) ? response : [];
}

export async function addCard(card: {
  cardType: CardType;
  lastFourDigits: string;
  limit?: number;
  accountId?: number;
}): Promise<Card[]> {
  const response = await apiFetch("api/cards/add", {
    method: "POST",
    body: JSON.stringify({ cards: [card] }),
  });
  return Array.isArray(response) ? response : [];
}

export async function deleteCard(cardId: string): Promise<void> {
  await apiFetch(`api/cards/${encodeURIComponent(cardId)}`, {
    method: "DELETE",
  });
}
