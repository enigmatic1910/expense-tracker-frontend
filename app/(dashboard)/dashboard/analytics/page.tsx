"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Brain,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  generateInsight,
  getLatestInsight,
  type AiInsight,
} from "@/lib/api/ai";
import WeeklyGraphTrend from "@/components/dashboard/WeeklyGraphTrend";
import RecentActivity from "@/components/dashboard/RecentActivity";
import CategorySpend from "@/components/dashboard/CategorySpend";

export default function AnalyticsPage() {
  const router = useRouter();
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getLatestInsight()
      .then(setInsight)
      .catch((loadError) => {
        console.error("Failed to load latest insight:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load insight.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateInsight = async () => {
    setGenerating(true);
    setError("");
    try {
      setInsight(await generateInsight());
    } catch (generateError) {
      console.error("Failed to generate insight:", generateError);
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Failed to generate insight.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const generatedDate = insight?.generatedAt
    ? new Date(insight.generatedAt).toLocaleString("en-IN")
    : null;

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="app-card flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Brain className="size-6 text-app-primary" />
            <h1 className="app-title text-2xl sm:text-3xl">Analytics Overview</h1>
          </div>
          <p className="app-body mt-2">
            Explore your spending patterns, recent activity, and category
            breakdowns in one place.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <WeeklyGraphTrend className="h-full lg:col-span-2" />
        <RecentActivity
          maxItems={5}
          title="Recent Transactions"
          className="h-full"
          onViewAll={() => router.push("/dashboard/transactions")}
        />
        <CategorySpend className="h-full" />
      </div>

      <div className="app-card flex flex-col gap-4 border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/70 p-4 sm:p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="size-6 text-app-primary" />
            <h2 className="text-xl font-bold text-app-text-primary">
              AI Insights
            </h2>
          </div>
          <p className="app-body mt-2">
            Turn your spending activity into personalized observations and
            practical next steps.
          </p>
          {generatedDate && (
            <p className="mt-2 text-xs text-app-text-muted">
              Generated {generatedDate}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void handleGenerateInsight()}
          disabled={generating || loading}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-app-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-app-primary-hover disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
        >
          {generating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {generating
            ? "Generating..."
            : insight
              ? "Refresh Insight"
              : "Generate Insight"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="app-card flex items-center justify-center gap-2 p-12 text-sm text-app-text-muted">
          <Loader2 className="size-5 animate-spin text-app-primary" /> Loading
          latest insight...
        </div>
      ) : insight ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="app-card p-6 md:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Lightbulb className="size-5 text-amber-500" />
              <h2 className="text-lg font-bold text-app-text-primary">
                Summary
              </h2>
            </div>
            <p className="text-sm leading-7 text-app-text-secondary">
              {insight.summary || "No summary was returned for this period."}
            </p>

            {insight.topSpendingCategory && (
              <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-app-primary">
                  Top spending category
                </p>
                <p className="mt-1 text-base font-bold text-app-text-primary">
                  {insight.topSpendingCategory.category || "Uncategorized"}
                  {insight.topSpendingCategory.percentage != null && (
                    <span className="ml-2 text-sm font-semibold text-app-primary">
                      {insight.topSpendingCategory.percentage.toFixed(1)}%
                    </span>
                  )}
                </p>
                {insight.topSpendingCategory.insight && (
                  <p className="mt-1 text-xs text-app-text-secondary">
                    {insight.topSpendingCategory.insight}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <InsightList
              title="Things to watch"
              items={insight.anomalies}
              icon={<AlertTriangle className="size-5 text-rose-500" />}
              emptyText="No unusual spending was detected."
            />
            <InsightList
              title="Actionable tips"
              items={insight.actionableTips}
              icon={<Lightbulb className="size-5 text-emerald-500" />}
              emptyText="No tips were returned for this period."
            />
          </div>
        </div>
      ) : (
        <div className="app-card flex flex-col items-center justify-center p-12 text-center">
          <RefreshCw className="size-8 text-app-primary" />
          <h2 className="mt-4 text-base font-bold text-app-text-primary">
            No insight yet
          </h2>
          <p className="mt-1 max-w-md text-sm text-app-text-secondary">
            Generate an insight to analyze your recent financial activity.
          </p>
        </div>
      )}
    </section>
  );
}

function InsightList({
  title,
  items,
  icon,
  emptyText,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  emptyText: string;
}) {
  return (
    <div className="app-card p-6">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-base font-bold text-app-text-primary">{title}</h2>
      </div>
      {items?.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="text-sm leading-6 text-app-text-secondary"
            >
              <span className="mr-2 font-bold text-app-primary">•</span>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-app-text-muted">{emptyText}</p>
      )}
    </div>
  );
}
