import { Check, Loader2, Trash2 } from "lucide-react";

export type AccountType = "Savings" | "Credit" | "Cash" | string;

interface AccountProps {
  bankName: string;
  lastFour: string;
  type: AccountType;
  amount: number; // Balance for Savings, Limit for Credit
  onDelete: () => void;
  onSetDefault: () => void;
  isDefault?: boolean;
  deleting?: boolean;
}

export const AccountCard = ({
  bankName,
  lastFour,
  type,
  amount,
  onDelete,
  onSetDefault,
  isDefault = false,
  deleting = false,
}: AccountProps) => {
  const isCredit = type?.toLowerCase() === "credit";
  const isCash = type?.toLowerCase() === "cash";
  const displayName = isCash ? "Cash" : bankName || "Account";
  const initial = displayName.trim()[0]?.toUpperCase() ?? "A";
  const formattedAmount = (amount ?? 0).toLocaleString();

  return (
    <div className="app-card flex flex-col items-stretch gap-4 p-4 transition-all duration-200 hover:border-indigo-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="flex size-10 sm:size-11 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-sm sm:text-base font-bold text-app-primary">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-bold text-app-text-primary">{displayName}</p>
            {isDefault && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <Check className="size-3" />
                Default
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-app-text-muted">
            •••• {lastFour}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
        <div className="text-right">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-app-text-muted">
          {isCredit ? "Credit Limit" : "Balance"}
        </p>
        <p className="text-base sm:text-lg font-bold text-app-text-primary">
          ₹{formattedAmount}
        </p>
        </div>
        {!isDefault && (
          <button
            type="button"
            onClick={onSetDefault}
            className="inline-flex rounded-xl border border-indigo-100 px-3 py-2 text-xs font-semibold text-app-primary transition hover:bg-indigo-50"
          >
            Set default
          </button>
        )}
        <button
          type="button"
          aria-label={`Remove ${displayName} account`}
          title="Remove account"
          disabled={deleting}
          onClick={onDelete}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
};
