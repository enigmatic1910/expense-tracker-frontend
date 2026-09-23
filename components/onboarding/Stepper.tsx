import { Check } from "lucide-react";

interface StepperProps {
  step: number;
  totalSteps: number;
}

export const Stepper = ({ step, totalSteps }: StepperProps) => (
  <div className="mx-auto mb-8 w-full max-w-md">
    <div className="relative flex items-center justify-between">
      <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-app-border z-0" />
      <div
        className="absolute left-0 top-1/2 h-0.5 bg-app-primary -translate-y-1/2 transition-all duration-500 z-0"
        style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
      />
      {[1, 2, 3].map((i) => {
        const isDone = step > i;
        const isCurrent = step === i;
        return (
          <div
            key={i}
            className={`z-10 flex size-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
              isDone
                ? "bg-app-primary text-white shadow-xs"
                : isCurrent
                  ? "border-2 border-app-primary bg-app-surface text-app-primary shadow-xs ring-4 ring-indigo-50"
                  : "border border-app-border bg-app-surface text-app-text-muted"
            }`}
          >
            {isDone ? <Check className="size-4 stroke-[2.5]" /> : i}
          </div>
        );
      })}
    </div>
    <div className="mt-2 flex justify-between text-[11px] font-medium text-app-text-muted">
      <span className={step >= 1 ? "text-app-text-primary font-semibold" : ""}>
        Preferences
      </span>
      <span className={step >= 2 ? "text-app-text-primary font-semibold" : ""}>
        Accounts
      </span>
      <span className={step >= 3 ? "text-app-text-primary font-semibold" : ""}>
        Complete
      </span>
    </div>
  </div>
);
