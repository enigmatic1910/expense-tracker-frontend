import { Trash2 } from "lucide-react";
import { Account } from "@/lib/api/model/Account";

interface AccountFormProps {
  acc: Account;
  index: number;
  onUpdate: (index: number, field: keyof Account, value: string) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
}

export const AccountForm = ({
  acc,
  index,
  onUpdate,
  onRemove,
  showRemove,
}: AccountFormProps) => (
  <div className="relative space-y-4 rounded-xl border border-app-border bg-gray-50/60 p-5 transition-all animate-in slide-in-from-top-2 duration-200">
    <div className="flex items-center justify-between">
      <div className="flex max-w-[210px] rounded-xl border border-gray-200 bg-gray-200/70 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => onUpdate(index, "type", "Savings")}
          className={`flex-1 rounded-lg px-3 py-1.5 transition-all ${
            acc.type === "Savings"
              ? "bg-app-surface text-app-text-primary shadow-xs font-bold"
              : "text-app-text-secondary hover:text-app-text-primary"
          }`}
        >
          Savings
        </button>
        <button
          type="button"
          onClick={() => onUpdate(index, "type", "Credit")}
          className={`flex-1 rounded-lg px-3 py-1.5 transition-all ${
            acc.type === "Credit"
              ? "bg-app-surface text-app-text-primary shadow-xs font-bold"
              : "text-app-text-secondary hover:text-app-text-primary"
          }`}
        >
          Credit
        </button>
      </div>

      {showRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="rounded-lg p-1.5 text-app-text-muted transition-colors hover:bg-red-50 hover:text-app-error"
          aria-label="Remove account"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-app-text-primary">
          Bank / Card Name
        </label>
        <input
          placeholder="e.g. HDFC Bank"
          className="h-10 w-full rounded-xl border border-app-border bg-app-surface px-3.5 text-sm font-medium text-app-text-primary placeholder:text-app-text-muted outline-none transition focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
          value={acc.bankName}
          onChange={(e) => onUpdate(index, "bankName", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-app-text-primary">
          Last 4 Digits
        </label>
        <input
          placeholder="e.g. 4321"
          maxLength={4}
          className="h-10 w-full rounded-xl border border-app-border bg-app-surface px-3.5 text-sm font-medium text-app-text-primary placeholder:text-app-text-muted outline-none transition focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
          value={acc.lastFourDigits}
          onChange={(e) => onUpdate(index, "lastFourDigits", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-app-text-primary">
          {acc.type === "Credit" ? "Credit Limit" : "Current Balance"}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-app-text-muted">
            ₹
          </span>
          <input
            placeholder={acc.type === "Credit" ? "Limit Amount" : "0.00"}
            className="h-10 w-full rounded-xl border border-app-border bg-app-surface py-2 pl-7 pr-3.5 text-sm font-medium text-app-text-primary placeholder:text-app-text-muted outline-none transition focus:border-app-primary focus:ring-3 focus:ring-indigo-100"
            value={acc.amount}
            onChange={(e) => onUpdate(index, "amount", e.target.value)}
          />
        </div>
      </div>
    </div>
  </div>
);
