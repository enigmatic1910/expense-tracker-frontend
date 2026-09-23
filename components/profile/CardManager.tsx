"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, Plus, Trash2 } from "lucide-react";
import {
  addCard,
  deleteCard,
  getCards,
  getCardSummaries,
  type Card,
  type CardSummary,
  type CardType,
} from "@/lib/api/cards";
import { getAccounts } from "@/lib/api/accounts";
import type { Account } from "@/lib/api/model/Account";

export function CardManager() {
  const [cards, setCards] = useState<Card[]>([]);
  const [summaries, setSummaries] = useState<CardSummary[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState("");
  const [type, setType] = useState<CardType>("CREDIT_CARD");
  const [lastFour, setLastFour] = useState("");
  const [limit, setLimit] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCards = async () => {
    try {
      const [cardList, accountList, summaryList] = await Promise.all([
        getCards(),
        getAccounts(),
        getCardSummaries(),
      ]);
      setCards(cardList);
      setSummaries(summaryList);
      setAccounts(
        accountList.filter(
          (account) => account.type?.toUpperCase() !== "CREDIT",
        ),
      );
      if (!accountId && accountList.length > 0) {
        const firstAsset = accountList.find(
          (account) => account.type?.toUpperCase() !== "CREDIT",
        );
        setAccountId(firstAsset?.id ?? "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cards.");
    }
  };

  useEffect(() => {
    void loadCards();
  }, []);

  const handleAdd = async () => {
    if (!/^\d{4}$/.test(lastFour)) {
      setError("Enter exactly 4 digits.");
      return;
    }

    if (type === "DEBIT_CARD" && !accountId) {
      setError("Select the account linked to this debit card.");
      return;
    }

    let cardLimit: number | undefined;
    if (type === "CREDIT_CARD") {
      cardLimit = Number(limit);
      if (!Number.isFinite(cardLimit) || cardLimit < 0) {
        setError("Enter a valid credit limit.");
        return;
      }
    }

    setAdding(true);
    setError(null);
    try {
      await addCard({
        cardType: type,
        lastFourDigits: lastFour,
        ...(type === "DEBIT_CARD" &&
          accountId && { accountId: Number(accountId) }),
        ...(cardLimit !== undefined && { limit: cardLimit }),
      });
      setLastFour("");
      setLimit("");
      await loadCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add card.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (card: Card) => {
    const label = `${card.cardType === "CREDIT_CARD" ? "Credit" : "Debit"} card ending in ${card.lastFourDigits}`;
    if (!window.confirm(`Remove ${label}? Its history will be preserved.`)) {
      return;
    }

    setDeletingId(card.id);
    setError(null);
    try {
      await deleteCard(card.id);
      setCards((current) => current.filter(({ id }) => id !== card.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove card.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="app-card space-y-4 p-6">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-app-primary">
          <CreditCard className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-app-text-primary">Cards</h3>
          <p className="text-xs text-app-text-secondary">
            Add cards manually to your profile.
          </p>
        </div>
      </div>

      {cards.map((card) => (
        <div
          key={card.id}
          className="flex flex-col items-start gap-3 rounded-xl border border-app-border p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="font-semibold">
            {card.cardType === "CREDIT_CARD" ? "Credit card" : "Debit card"}{" "}
            •••• {card.lastFourDigits}
          </span>

          <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
            {card.cardType === "CREDIT_CARD" && (
              <span>₹{Number(card.limit || 0).toLocaleString()} limit</span>
            )}
            {card.cardType === "DEBIT_CARD" && (
              <span className="text-app-text-secondary">
                ₹
                {Number(
                  summaries.find((item) => item.cardId === card.id)?.spent || 0,
                ).toLocaleString("en-IN")}{" "}
                tracked spend
              </span>
            )}
            {card.cardType === "CREDIT_CARD" && (
              <span className="text-app-text-secondary">
                ₹
                {Math.max(
                  Number(card.limit || 0) -
                    Number(
                      summaries.find((item) => item.cardId === card.id)
                        ?.spent || 0,
                    ),
                  0,
                ).toLocaleString("en-IN")}{" "}
                remaining
              </span>
            )}
            <button
              type="button"
              title="Remove card"
              aria-label={`Remove card ending in ${card.lastFourDigits}`}
              disabled={deletingId === card.id}
              onClick={() => void handleDelete(card)}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingId === card.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
            </button>
          </div>
        </div>
      ))}

      <div className="grid gap-3 sm:grid-cols-3">
        <select
          value={type}
          onChange={(event) => setType(event.target.value as CardType)}
          className="app-input"
        >
          <option value="CREDIT_CARD">Credit card</option>
          <option value="DEBIT_CARD">Debit card</option>
        </select>
        <input
          className="app-input"
          inputMode="numeric"
          maxLength={4}
          placeholder="Last 4 digits"
          value={lastFour}
          onChange={(event) =>
            setLastFour(event.target.value.replace(/\D/g, ""))
          }
        />
        {type === "CREDIT_CARD" && (
          <input
            className="app-input"
            min="0"
            type="number"
            placeholder="Credit limit"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
          />
        )}
        {type === "DEBIT_CARD" && (
          <select
            className="app-input"
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            required
          >
            <option value="">Link to account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bankName || "Account"}{" "}
                {account.lastFourDigits ? `•••• ${account.lastFourDigits}` : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="button"
        disabled={adding}
        onClick={() => void handleAdd()}
        className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-app-primary px-3.5 text-xs font-semibold text-white sm:w-auto"
      >
        {adding ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Plus className="size-3.5" />
        )}
        Add Card
      </button>
    </div>
  );
}
