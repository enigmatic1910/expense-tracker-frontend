// import * as z from "zod";
//
// export const CardTypeEnum = z.enum(["DEBIT_CARD", "CREDIT_CARD"]);
// export type CardType = z.infer<typeof CardTypeEnum>;
//
// export const LanguagePreferenceEnum = z.enum(["ENGLISH", "HINDI"]);
// export type LanguagePreference = z.infer<typeof LanguagePreferenceEnum>;
//
// export interface BankOption {
//   id: string;
//   name: string;
//   code: string;
//   popular?: boolean;
// }
//
// export interface PaymentModeOption {
//   id: number;
//   name: string;
//   type: "ASSET" | "LIABILITY";
//   description: string;
// }
//
// export const POPULAR_BANKS: BankOption[] = [
//   {
//     id: "d3b07384-d113-4960-96f7-873b88b42211",
//     name: "State Bank of India",
//     code: "SBI",
//     popular: true,
//   },
//   {
//     id: "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
//     name: "HDFC Bank",
//     code: "HDFC",
//     popular: true,
//   },
//   {
//     id: "e4a6a120-7f28-4e89-9a25-c603b5f9201a",
//     name: "ICICI Bank",
//     code: "ICICI",
//     popular: true,
//   },
//   {
//     id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
//     name: "Axis Bank",
//     code: "AXIS",
//     popular: true,
//   },
//   {
//     id: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
//     name: "Chase Bank",
//     code: "CHASE",
//   },
//   {
//     id: "b5a4e3c2-d1f0-49e8-b765-123456789abc",
//     name: "Bank of America",
//     code: "BOA",
//   },
//   {
//     id: "7d2b8e3a-9c41-4328-98e2-b1480f2ec4e5",
//     name: "Kotak Mahindra Bank",
//     code: "KOTAK",
//   },
//   {
//     id: "00000000-0000-0000-0000-000000000001",
//     name: "Other / Custom Bank",
//     code: "OTHER",
//   },
// ];
//
// export const PAYMENT_MODES: PaymentModeOption[] = [
//   {
//     id: 1,
//     name: "UPI / Instant Pay",
//     type: "ASSET",
//     description: "Instant mobile bank transfer (GPay, PhonePe, Paytm)",
//   },
//   {
//     id: 2,
//     name: "Debit Card",
//     type: "ASSET",
//     description: "Direct deduction from your bank balance",
//   },
//   {
//     id: 3,
//     name: "Credit Card",
//     type: "LIABILITY",
//     description: "Revolving credit line with monthly statement",
//   },
//   {
//     id: 4,
//     name: "Cash",
//     type: "ASSET",
//     description: "Physical cash in your wallet or drawer",
//   },
//   {
//     id: 5,
//     name: "Net Banking",
//     type: "ASSET",
//     description: "Direct internet banking portal transfer",
//   },
// ];
//
// export const onboardingFormSchema = z
//   .object({
//     // Bank Account Info
//     bankId: z.string().min(1, "Please select a bank"),
//     accountLastFourDigits: z
//       .string()
//       .trim()
//       .regex(/^\d{4}$/, "Must be exactly 4 digits"),
//     balance: z
//       .string()
//       .trim()
//       .min(1, "Opening balance is required")
//       .refine(
//         (val) => !isNaN(Number(val)) && Number(val) >= 0,
//         "Balance must be a valid non-negative number"
//       ),
//
//     // Card Details (Optional)
//     hasCard: z.boolean(),
//     cardType: CardTypeEnum.optional(),
//     cardLastFourDigits: z.string().trim().optional(),
//     cardLimit: z.string().trim().optional(),
//
//     // Cash Wallet Balance
//     cashBalance: z
//       .string()
//       .trim()
//       .refine(
//         (val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0),
//         "Cash balance must be a non-negative number"
//       ),
//
//     // Preferences
//     paymentModeId: z.number().int().positive("Please select a payment mode"),
//     languagePreference: LanguagePreferenceEnum,
//   })
//   .superRefine((data, ctx) => {
//     if (data.hasCard) {
//       if (!data.cardType) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Please select a card type",
//           path: ["cardType"],
//         });
//       }
//
//       if (!data.cardLastFourDigits || !/^\d{4}$/.test(data.cardLastFourDigits)) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Card number must be exactly 4 digits",
//           path: ["cardLastFourDigits"],
//         });
//       }
//
//       if (data.cardType === "CREDIT_CARD" && data.cardLimit) {
//         const limitNum = Number(data.cardLimit);
//         if (isNaN(limitNum) || limitNum < 0) {
//           ctx.addIssue({
//             code: z.ZodIssueCode.custom,
//             message: "Credit limit must be a positive number",
//             path: ["cardLimit"],
//           });
//         }
//       }
//     }
//   });
//
// export type OnboardingFormInput = z.input<typeof onboardingFormSchema>;
// export type OnboardingFormValues = z.output<typeof onboardingFormSchema>;
//
// /**
//  * Backend DTO representation matching:
//  * com.project.expensetracker.dto.OnboardingRequestDto
//  */
// export interface OnboardingRequestDto {
//   bankId: string;
//   accountLastFourDigits: string;
//   balance: number;
//   cardType: CardType | null;
//   cardLastFourDigits: string | null;
//   cashBalance: number;
//   paymentModeId: number;
//   languagePreference: LanguagePreference;
//   cardLimit: number | null;
// }
//
// /**
//  * Transforms form output values to exact backend OnboardingRequestDto structure
//  */
// export function formatToOnboardingRequestDto(
//   form: OnboardingFormValues
// ): OnboardingRequestDto {
//   return {
//     bankId: form.bankId,
//     accountLastFourDigits: form.accountLastFourDigits,
//     balance: parseFloat(form.balance) || 0,
//     cardType: form.hasCard && form.cardType ? form.cardType : null,
//     cardLastFourDigits:
//       form.hasCard && form.cardLastFourDigits ? form.cardLastFourDigits : null,
//     cardLimit:
//       form.hasCard && form.cardLimit ? parseInt(form.cardLimit, 10) : 0,
//     cashBalance: form.cashBalance ? parseFloat(form.cashBalance) || 0 : 0,
//     paymentModeId: form.paymentModeId,
//     languagePreference: form.languagePreference || "ENGLISH",
//   };
// }
