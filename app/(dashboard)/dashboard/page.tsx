"use client";

import { FormEvent, useState } from "react";
import WalletCard from "@/components/dashboard/WalletCard";
import { createAiParsingTask, waitForAiJob } from "@/api/ai";

export default function DashboardPage() {
  const [inputValue, setInputValue] = useState("");
  const [processedValue, setProcessedValue] = useState("");
  const [aiStatus, setAiStatus] = useState("idle");
  const [aiError, setAiError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rawText = inputValue.trim();
    if (!rawText || aiStatus === "submitting" || aiStatus === "PROCESSING") return;

    setAiStatus("submitting");
    setAiError("");
    setProcessedValue("");

    try {
      const task = await createAiParsingTask(rawText);
      setAiStatus("PENDING");
      const result = await waitForAiJob(task.id, (status) => setAiStatus(status.status));

      if (result.status === "COMPLETED") {
        setProcessedValue("Transaction parsed and saved successfully.");
        setInputValue("");
      } else {
        setAiError("AI could not process this transaction.");
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI processing failed.");
    } finally {
      setAiStatus("idle");
    }
  }

  const isProcessing = aiStatus === "submitting" || aiStatus === "PROCESSING";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4f46e5] p-6 text-white shadow-lg md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200">
              <span className="size-2 animate-pulse rounded-full bg-emerald-300" />
              Your money, made simpler
              <span className="text-indigo-300">•</span>
              <span>{new Date().toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome to your financial hub
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
              Track your money effortlessly. Tell your AI assistant what happened and let it organize the rest.
            </p>
          </div>

          <form
            className="relative flex w-full items-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-md transition focus-within:border-white/50 focus-within:ring-4 focus-within:ring-white/10 lg:max-w-xl"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="pointer-events-none absolute left-4 flex items-center text-indigo-200">
              <span className="text-xl">✦</span>
            </div>
            <input
              autoComplete="off"
              className="h-14 w-full bg-transparent pl-12 pr-28 text-sm text-white placeholder:text-indigo-200 focus:outline-none"
              id="dashboard-input"
              name="dashboard-input"
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Try “Spent ₹450 on groceries”"
              value={inputValue}
            />
            <button
              className="absolute right-2 inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-xs font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50 active:scale-95 disabled:opacity-50"
              disabled={!inputValue.trim() || isProcessing}
              type="submit"
            >
              {isProcessing ? "Working..." : "Process"}
            </button>
          </form>
        </div>

        {(aiStatus !== "idle" || aiError || processedValue) && (
          <div className="relative mt-4 rounded-xl border border-white/15 bg-black/15 px-3 py-2 text-xs text-indigo-50 backdrop-blur-sm">
            {aiError || processedValue || `AI status: ${aiStatus.toLowerCase()}`}
          </div>
        )}
      </section>

      <WalletCard />
    </div>
  );
}
