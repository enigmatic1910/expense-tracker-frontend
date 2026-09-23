import { CreditCard, Wallet, Landmark, Coins, Check } from "lucide-react";

interface ModeProps {
  selectedModes: string[];
  onToggle: (id: string) => void;
}

const modes = [
  {
    id: "card",
    name: "Card",
    type: "PAYMENT",
    icon: <CreditCard className="size-5" />,
  },
  {
    id: "upi",
    name: "UPI",
    type: "DIGITAL",
    icon: <Coins className="size-5" />,
  },
  {
    id: "cash",
    name: "Cash",
    type: "PHYSICAL",
    icon: <Wallet className="size-5" />,
  },
  {
    id: "net",
    name: "Net Banking",
    type: "BANKING",
    icon: <Landmark className="size-5" />,
  },
];

export const PaymentModeSelect = ({ selectedModes, onToggle }: ModeProps) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
    {modes.map((mode) => {
      const isSelected = selectedModes.includes(mode.id);
      return (
        <button
          key={mode.id}
          onClick={() => onToggle(mode.id)}
          type="button"
          className={`group relative flex flex-col items-start gap-2.5 rounded-xl border p-4 text-left transition-all duration-200 ${
            isSelected
              ? "border-app-primary bg-indigo-50/70 shadow-xs ring-2 ring-indigo-100"
              : "border-app-border bg-app-surface hover:border-indigo-200 hover:bg-indigo-50/20 shadow-xs"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div
              className={`flex size-9 items-center justify-center rounded-lg transition-colors ${
                isSelected
                  ? "bg-app-primary text-white"
                  : "bg-indigo-50 text-app-primary"
              }`}
            >
              {mode.icon}
            </div>
            {isSelected && (
              <span className="flex size-4 items-center justify-center rounded-full bg-app-primary text-white">
                <Check className="size-2.5 stroke-[3]" />
              </span>
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-app-text-primary">
              {mode.name}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-app-text-muted mt-0.5">
              {mode.type}
            </div>
          </div>
        </button>
      );
    })}
  </div>
);
