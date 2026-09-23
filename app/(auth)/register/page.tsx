"use client";

import AuthFormContainer from "@/components/auth/AuthFormContainer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  registerInput,
  registerOutput,
  registerSchema,
} from "@/validation/auth";
import { useRouter } from "next/navigation";
import { registerWithEmailAndPassword } from "@/lib/api/loginWithUserNameAndPassword";
import { useAuth } from "@/context/AuthContext";
export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<registerInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const handleRegister = async (data: registerOutput) => {
    const authResponse = await registerWithEmailAndPassword(
      data.username,
      data.email,
      data.password,
    );

    login(authResponse.accessToken, authResponse.refreshToken);
    window.localStorage.removeItem("onboarded");
    router.push("/onboarding");
  };

  return (
    <main className="app-page">
      <AuthFormContainer
        description="Create your account with your name, email address, and password."
        footerActionHref="/login"
        footerActionLabel="Sign in"
        footerText="Already have an account?"
        title="Create account"
      >
        <form className="space-y-5" onSubmit={handleSubmit(handleRegister)}>
          <div className="app-form-field">
            <label className="app-label" htmlFor="register-name">
              Name
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
                  d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <path
                  d="M20 20a8 8 0 1 0-16 0"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              <input
                autoComplete="name"
                className="app-input app-input-with-icon"
                id="register-name"
                {...register("username")}
                placeholder="Your full name"
                required
                type="text"
              />
            </div>{" "}
            {errors.username && (
              <span className="app-error text-red-500">
                {errors.username.message}
              </span>
            )}
          </div>

          <div className="app-form-field">
            <label className="app-label" htmlFor="register-email">
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
                id="register-email"
                {...register("email")}
                placeholder="you@example.com"
                required
              />
            </div>{" "}
            {errors.email && (
              <span className="app-error text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="app-form-field">
            <label className="app-label" htmlFor="register-password">
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
                autoComplete="new-password"
                className="app-input app-input-with-icon"
                id="register-password"
                {...register("password")}
                placeholder="Create a password"
                required
              />
            </div>{" "}
            {errors.password && (
              <span className="app-error, text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            className="app-button app-button-primary w-full"
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            Create account
          </button>
        </form>
      </AuthFormContainer>
    </main>
  );
}
