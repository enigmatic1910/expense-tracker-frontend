import { apiFetch } from "./api-client";

export interface AiTaskResponse {
  id: string;
  message: string;
}

export interface AiJobStatus {
  jobId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  timeStamp: string;
}

export interface AiInsight {
  period: string;
  generatedAt: string | null;
  summary: string | null;
  topSpendingCategory: {
    category: string | null;
    percentage: number | null;
    insight: string | null;
  } | null;
  anomalies: string[];
  actionableTips: string[];
  status: string | null;
}

export function getLatestInsight(): Promise<AiInsight | null> {
  return apiFetch<AiInsight | null>("api/ai-input/latest-insight", {
    method: "GET",
  });
}

export function generateInsight(): Promise<AiInsight> {
  return apiFetch<AiInsight>("api/ai-input/generate-insight", {
    method: "POST",
  });
}

function apiUrl(endpoint: string) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  return `${baseUrl}/${endpoint.replace(/^\/+/, "")}`;
}

export function createAiParsingTask(rawText: string): Promise<AiTaskResponse> {
  return apiFetch<AiTaskResponse>("api/ai-input", {
    method: "POST",
    body: JSON.stringify({ rawText }),
  });
}

export async function waitForAiJob(
  jobId: string,
  onStatus: (status: AiJobStatus) => void,
): Promise<AiJobStatus> {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(apiUrl(`api/notifications/status/${encodeURIComponent(jobId)}`), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok || !response.body) {
    throw new Error("Could not connect to AI task notifications");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        const dataLine = event.split("\n").find((line) => line.startsWith("data:"));
        if (!dataLine) continue;

        const status = JSON.parse(dataLine.slice(5).trim()) as AiJobStatus;
        onStatus(status);

        if (status.status === "COMPLETED" || status.status === "FAILED") {
          await reader.cancel();
          return status;
        }
      }

      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }

  throw new Error("AI task notification stream ended unexpectedly");
}
