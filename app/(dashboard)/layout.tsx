"use client";

import type { ReactNode } from "react";
import { ProtectedRoutes } from "@/components/ProtectedRoutes";
import Sidebar from "@/components/dashboard/sidebar";

const DashboardLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <ProtectedRoutes>
      <div className="flex min-h-screen flex-col bg-app-background md:flex-row">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </ProtectedRoutes>
  );
};

export default DashboardLayout;
