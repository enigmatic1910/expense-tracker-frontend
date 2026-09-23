"use client";

import type { ReactNode } from "react";
import { ProtectedRoutes } from "@/components/ProtectedRoutes";
import Sidebar from "@/components/dashboard/sidebar";

const DashboardLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <ProtectedRoutes>
      <div className="flex min-h-screen flex-col bg-app-background md:flex-row">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </ProtectedRoutes>
  );
};

export default DashboardLayout;
