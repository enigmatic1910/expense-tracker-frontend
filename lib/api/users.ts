import { apiFetch } from "./api-client";

export interface UserProfile {
  name: string;
}

export async function getCurrentUser(): Promise<UserProfile> {
  return apiFetch<UserProfile>("api/users/me", { method: "GET" });
}
