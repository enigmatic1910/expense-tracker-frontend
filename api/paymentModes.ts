import { apiFetch } from "./api-client";

export interface PaymentMode {
  id: number;
  name: string;
}

export async function getPaymentModes(): Promise<PaymentMode[]> {
  const data = await apiFetch("api/payment-modes/all", { method: "GET" });
  return Array.isArray(data) ? data : [];
}
