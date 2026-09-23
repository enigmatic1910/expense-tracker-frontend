import type { Metadata } from "next";
import "./globals.css";
import { AuthContextProvider } from "../context/AuthContext";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track spending, income, budgets, and financial insights.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  );
}
