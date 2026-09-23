import { ReactNode } from "react";

type AuthFormContainerProps = {
  children: ReactNode;
  description: string;
  footerActionHref: string;
  footerActionLabel: string;
  footerText: string;
  title: string;
};

export function AuthFormContainer({
  children,
  description,
  footerActionHref,
  footerActionLabel,
  footerText,
  title,
}: AuthFormContainerProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-app-primary text-sm font-bold text-white">
            A
          </div>
          <span className="text-base font-semibold text-app-text-primary">
            AI Expense Tracker
          </span>
        </div>

        <section className="app-card w-full p-8">
          <div className="mb-6">
            <h1 className="app-title">{title}</h1>
            <p className="app-body mt-2">{description}</p>
          </div>

          {children}
        </section>

        <div className="mt-6 text-center">
          <p className="app-meta">{footerText}</p>
          <a
            className="mt-2 inline-flex text-sm font-semibold text-app-primary transition hover:text-app-primary-hover"
            href={footerActionHref}
          >
            {footerActionLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

export default AuthFormContainer;
