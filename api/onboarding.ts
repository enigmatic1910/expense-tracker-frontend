import { apiFetch } from "@/api/api-client";

export interface BankDto {
  id: string;
  name: string;
}

export interface PaymentModeDto {
  id: number;
  name: string;
  type: string;
}

export interface OnboardingRequestDto {
  bankId: string | null;
  accountLastFourDigits: string | null;
  balance: number | null;
  cardType: string | null;
  cardLastFourDigits: string | null;
  cashBalance: number | null;
  paymentModeId: number | null;
  languagePreference: string | null;
  cardLimit: number | null;
}

const FALLBACK_BANKS: BankDto[] = [
  { id: "1", name: "State Bank of India" },
  { id: "2", name: "HDFC Bank" },
  { id: "3", name: "ICICI Bank" },
  { id: "4", name: "Axis Bank" },
  { id: "5", name: "Kotak Mahindra Bank" },
  { id: "6", name: "Punjab National Bank" },
];

const FALLBACK_PAYMENT_MODES: PaymentModeDto[] = [
  { id: 1, name: "Credit Card", type: "LIABILITY" },
  { id: 2, name: "Debit Card", type: "ASSET" },
  { id: 3, name: "Net Banking", type: "ASSET" },
  { id: 4, name: "UPI", type: "ASSET" },
  { id: 5, name: "Cash", type: "ASSET" },
  { id: 6, name: "Digital Wallet", type: "ASSET" },
];

export async function submitOnboarding(
  data: OnboardingRequestDto,
): Promise<{ success: boolean; message: string }> {
  return await apiFetch("api/users/onboarding", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getBanks(): Promise<BankDto[]> {
  try {
    const data = await apiFetch("api/banks/all", {
      method: "GET",
    });

    if (Array.isArray(data) && data.length > 0) {
      return data.map((b: any) => ({
        id: String(b.id),
        name: String(b.name),
      }));
    }
  } catch (error) {
    console.warn(
      "Error fetching banks from backend, using graceful fallback list",
      error,
    );
  }

  return FALLBACK_BANKS;
}

export async function getPaymentModes(): Promise<PaymentModeDto[]> {
  try {
    const data = await apiFetch("api/payment-modes/all", {
      method: "GET",
    });

    if (Array.isArray(data) && data.length > 0) {
      return data.map((m: any) => ({
        id: Number(m.id),
        name: String(m.name),
        type: String(m.type || "ASSET"),
      }));
    }
  } catch (error) {
    console.warn(
      "Error fetching payment modes from backend, using graceful fallback list",
      error,
    );
  }

  return FALLBACK_PAYMENT_MODES;
}