"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useForm } from "react-hook-form";
import { loginInput, loginOutput, loginSchema } from "@/validation/auth";
import AuthFormContainer from "@/components/auth/AuthFormContainer";
import { loginWithUserNameAndPassword } from "@/api/loginWithUserNameAndPassword";
import { zodResolver } from "@hookform/resolvers/zod";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<loginInput>({ resolver: zodResolver(loginSchema) });

  const handleLogin = async (data: loginOutput) => {
    const authResponse = await loginWithUserNameAndPassword(
      data.email,
      data.password,
    );
    login(authResponse.accessToken, authResponse.refreshToken);
    const hasCompletedOnboarding =
      window.localStorage.getItem("onboarded") === "true";

    router.push(hasCompletedOnboarding ? "/dashboard" : "/onboarding");
  };

  return (
    <main className="app-page">
      <AuthFormContainer
        description="Enter your email address and password to access your account."
        footerActionHref="/register"
        footerActionLabel="Create an account"
        footerText="New to AI Expense Tracker?"
        title="Sign in"
      >
        <form className="space-y-5" onSubmit={handleSubmit(handleLogin)}>
          <div className="app-form-field">
            <label className="app-label" htmlFor="email">
              Email address
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-app-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6.5h16v11H4v-11Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <path
                  d="m5 7.5 7 5 7-5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              <input
                autoComplete="email"
                className="app-input app-input-with-icon"
                {...register("email")}
                id="email"
                name="email"
                required
              />
              {errors.email?.message && (
                <span className="text-red-500">{errors.email?.message}</span>
              )}
            </div>
          </div>

          <div className="app-form-field">
            <label className="app-label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-app-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 10V8a5 5 0 0 1 10 0v2"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <path
                  d="M6 10h12v9H6v-9Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              <input
                {...register("password")}
                autoComplete="current-password"
                className="app-input app-input-with-icon"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
              />
              {errors.password?.message && (
                <span className="text-red-500">{errors.password?.message}</span>
              )}
            </div>
          </div>

          <button
            className="app-button app-button-primary w-full"
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            Sign in
          </button>
        </form>
      </AuthFormContainer>
    </main>
  );
}
