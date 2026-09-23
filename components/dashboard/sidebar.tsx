"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <path
        d="M4 10.5h6v9H4v-9Zm10-6h6v15h-6v-15ZM4 4.5h6v4H4v-4Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: (
      <>
        <path
          d="M5 19V5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <path
          d="M5 19h14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <path
          d="m8 14 3-3 3 2 4-5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </>
    ),
  },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    icon: (
      <>
        <path
          d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M8 8h8M8 12h8M8 16h5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Settings",
    icon: (
      <>
        <path
          d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.41 1.41m9.9 9.9 1.41 1.41m0-12.72-1.41 1.41m-9.9 9.9-1.41 1.41"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="m12 8.5 1.1.38.96-.58 1.02.59-.08 1.16.8.82 1.15-.08.59 1.02-.58.96.38 1.1-.38 1.1.58.96-.59 1.02-1.15-.08-.8.82.08 1.16-1.02.59-.96-.58-1.1.38-1.1-.38-.96.58-1.02-.59.08-1.16-.8-.82-1.15.08-.59-1.02.58-.96-.38-1.1.38-1.1-.58-.96.59-1.02 1.15.08.8-.82-.08-1.16 1.02-.59.96.58L12 8.5Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="13" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      </>
    ),
  },
];

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 7V5a1 1 0 0 0-1-1H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a1 1 0 0 0 1-1v-2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="m19 12-4-4m4 4-4 4m4-4H9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  function handleLogout() {
    logout();
    setIsOpen(false);
    router.push("/login");
  }

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-app-border bg-app-surface px-4 py-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-app-primary text-base font-bold text-white">
            A
          </div>
        </div>

        <button
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-app-text-primary transition hover:bg-[rgb(17_24_39/0.04)]"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:pointer-events-none md:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[calc(100vw-3rem)] flex-col border-r border-app-border bg-app-surface px-5 py-6 shadow-xl transition-transform duration-300 md:sticky md:top-0 md:z-auto md:h-screen md:w-20 md:translate-x-0 md:px-2 md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-8 hidden md:flex md:justify-center">
          <div className="flex items-center justify-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-app-primary text-lg font-bold text-white shadow-sm">
              A
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-app-primary text-base font-bold text-white">
              A
            </div>
          </div>
          <button
            aria-label="Close sidebar"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-app-text-primary transition hover:bg-[rgb(17_24_39/0.04)]"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="grid gap-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center rounded-xl border px-4 py-3 text-sm font-semibold transition md:mx-auto md:size-12 md:justify-center md:px-0 md:py-0 ${
                  isActive
                    ? "border-app-primary bg-[rgb(79_70_229/0.08)] text-app-primary"
                    : "border-transparent text-app-text-secondary hover:border-app-border hover:bg-[rgb(17_24_39/0.03)] hover:text-app-text-primary"
                }`}
                href={item.href}
                title={item.label}
              >
                <span
                  className={`flex size-10 items-center justify-center rounded-lg ${
                    isActive
                      ? "bg-app-primary text-white"
                      : "bg-[rgb(17_24_39/0.04)] text-app-text-muted"
                  }`}
                >
                  <NavIcon>{item.icon}</NavIcon>
                </span>
                <span className="ml-3 md:hidden">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 pt-6">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-app-border bg-app-surface px-4 py-3 text-sm font-semibold text-app-text-primary transition hover:bg-[rgb(220_38_38/0.06)] hover:text-app-error md:mx-auto md:size-12 md:px-0 md:py-0"
            onClick={handleLogout}
            type="button"
            title="Logout"
            aria-label="Logout"
          >
            <LogoutIcon />
            <span className="md:hidden">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
