"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getCategorySpend } from "@/lib/api/transactions";

export type CategoryExpense = {
  category: string;
  amount: number;
  color: string;
};

export type CategorySpendProps = {
  data?: CategoryExpense[];
  title?: string;
  description?: string;
  budgetLimit?: number;
  className?: string;
};

const CATEGORY_COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#10b981",
];

const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: CategoryExpense }>;
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="rounded-xl border border-app-border bg-white/95 p-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <p className="text-xs font-semibold text-app-text-secondary">
            {item.category}
          </p>
        </div>
        <p className="mt-1 font-mono text-base font-extrabold text-app-text-primary">
          {rupeeFormatter.format(item.amount)}
        </p>
      </div>
    );
  }
  return null;
}

export function CategorySpend({
  data,
  title = "Category Expenses",
  description = "Detailed breakdown by category",
  budgetLimit = 2000,
  className = "",
}: CategorySpendProps) {
  const [mounted, setMounted] = useState(false);
  const [backendData, setBackendData] = useState<CategoryExpense[]>([]);

  useEffect(() => {
    if (data) return;

    getCategorySpend()
      .then((items) =>
        setBackendData(
          items.map((item, index) => ({
            ...item,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
          })),
        ),
      )
      .catch((error) => {
        console.error("Failed to load category spend:", error);
        setBackendData([]);
      });
  }, [data]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data ?? backendData;
  const totalSpent = chartData.reduce((acc, curr) => acc + curr.amount, 0);
  const topCategory = chartData.reduce(
    (max, curr) => (curr.amount > max.amount ? curr : max),
    chartData[0] || { category: "N/A", amount: 0, color: "#4f46e5" },
  );
  const budgetUsagePercent =
    budgetLimit > 0
      ? Math.min(Math.round((totalSpent / budgetLimit) * 100), 100)
      : 0;
  const remainingBudget = Math.max(budgetLimit - totalSpent, 0);

  return (
    <div
      className={`app-card flex flex-col justify-between p-6 md:p-7 transition-all duration-200 hover:shadow-md ${className}`}
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
          <span className="rounded-full bg-indigo-50 border border-indigo-100/80 px-2.5 py-1 text-xs font-semibold text-app-primary self-start sm:self-auto">
            Top: {topCategory.category}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl bg-gray-50/60 p-4 border border-app-border/60">
          <div className="relative flex size-36 shrink-0 items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={chartData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={64}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="size-28 rounded-full border-4 border-dashed border-gray-200" />
            )}

            <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-app-text-muted">
                Spent
              </span>
              <span className="font-mono text-base font-extrabold text-app-text-primary">
                {rupeeFormatter.format(totalSpent)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full text-xs">
            {chartData.slice(0, 4).map((item) => (
              <div
                key={item.category}
                className="flex items-center gap-1.5 min-w-0"
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-app-text-secondary font-medium text-[11px]">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {chartData.map((item) => {
            const percentage =
              totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;

            return (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate font-medium text-app-text-primary">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-app-text-muted text-[11px]">
                      {percentage}%
                    </span>
                    <span className="font-mono font-semibold text-app-text-primary">
                      {rupeeFormatter.format(item.amount)}
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CategorySpend;
