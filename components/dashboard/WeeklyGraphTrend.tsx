"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getSpendingTrend } from "@/api/transactions";

export type DailySpending = {
  day: string;
  spent: number;
  date?: string;
};

export type WeeklyGraphTrendProps = {
  data?: DailySpending[];
  title?: string;
  description?: string;
  className?: string;
};

const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type TooltipPayloadItem = {
  value: number;
  payload: DailySpending;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    const fullDate = item.payload?.date || label;

    return (
      <div className="rounded-xl border border-app-border bg-white/95 p-3 shadow-lg backdrop-blur-sm">
        <p className="text-xs font-semibold text-app-text-secondary">{fullDate}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xs font-semibold text-app-primary">₹</span>
          <span className="text-base font-extrabold text-app-text-primary">
            {rupeeFormatter.format(item.value ?? 0)}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] font-medium text-app-text-muted">Daily Expenditure</p>
      </div>
    );
  }

  return null;
}

export function WeeklyGraphTrend({
  data,
  title = "Spending Trend",
  description = "Daily expense analysis & trends",
  className = "",
}: WeeklyGraphTrendProps) {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<"7D" | "14D" | "30D">("7D");
  const [backendData, setBackendData] = useState<DailySpending[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data) return;

    const days = Number.parseInt(timeRange, 10) as 7 | 14 | 30;
    getSpendingTrend(days)
      .then((trend) => setBackendData(trend))
      .catch((error) => {
        console.error("Failed to load spending trend:", error);
        setBackendData([]);
      });
  }, [data, timeRange]);

  const chartData = data ?? backendData;

  const totalSpent = chartData.reduce((acc, curr) => acc + curr.spent, 0);
  const dailyAverage = chartData.length > 0 ? totalSpent / chartData.length : 0;
  const peakDay = chartData.reduce(
    (max, curr) => (curr.spent > max.spent ? curr : max),
    chartData[0] || { day: "N/A", spent: 0 }
  );

  return (
    <div
      className={`app-card flex flex-col justify-between p-6 md:p-7 transition-all duration-200 hover:shadow-md ${className}`}
    >
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="app-section-title text-base font-bold text-app-text-primary">
                {title}
              </h2>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                {timeRange} actuals
              </span>
            </div>
            {description && (
              <p className="app-body mt-0.5 text-xs text-app-text-secondary">{description}</p>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-app-border bg-gray-50/80 p-1 self-start sm:self-auto">
            {(["7D", "14D", "30D"] as const).map((range) => (
              <button
                key={range}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  timeRange === range
                    ? "bg-white text-app-primary shadow-xs"
                    : "text-app-text-muted hover:text-app-text-primary"
                }`}
                onClick={() => setTimeRange(range)}
                type="button"
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-app-border/80 pb-4">
          <div>
            <span className="text-xs text-app-text-muted">Total Spent:</span>
            <span className="ml-1.5 font-mono text-xl font-bold text-app-text-primary">
              {rupeeFormatter.format(totalSpent)}
            </span>
          </div>
          <div>
            <span className="text-xs text-app-text-muted">Daily Avg:</span>
            <span className="ml-1.5 font-mono text-sm font-semibold text-app-text-secondary">
              {rupeeFormatter.format(dailyAverage)}
            </span>
          </div>
          <div>
            <span className="text-xs text-app-text-muted">Peak Day:</span>
            <span className="ml-1.5 text-xs font-semibold text-indigo-600">
              {peakDay.day} ({rupeeFormatter.format(peakDay.spent)})
            </span>
          </div>
        </div>

        <div className="mt-4 h-60 w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="spendingIndigoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#f1f5f9"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                  dy={8}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                  dx={-4}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="spent"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fill="url(#spendingIndigoGradient)"
                  activeDot={{
                    r: 6,
                    fill: "#4f46e5",
                    stroke: "#ffffff",
                    strokeWidth: 2.5,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-50/50">
              <span className="app-meta">Loading chart insights...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WeeklyGraphTrend;
