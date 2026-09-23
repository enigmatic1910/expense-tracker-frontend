const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const REFRESH_ENDPOINT = "api/auth/refresh-token";

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
}

let refreshPromise: Promise<string> | null = null;

function getApiBaseUrl() {
  return (BASE_URL || "").replace(/\/+$/, "");
}

function apiUrl(endpoint: string) {
  const normalizedEndpoint = endpoint.replace(/^\/+/, "");
  const normalizedBase = getApiBaseUrl();

  return `${normalizedBase}/${normalizedEndpoint}`;
}

export async function refreshAccessToken(): Promise<string> {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken || !refreshToken) {
    throw new Error("No refresh token is available");
  }

  const response = await fetch(apiUrl(REFRESH_ENDPOINT), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken, refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Refresh token request failed");
  }

  const authResponse = (await response.json()) as AuthResponse;

  if (!authResponse.accessToken) {
    throw new Error("Refresh response did not contain an access token");
  }

  localStorage.setItem("accessToken", authResponse.accessToken);

  if (authResponse.refreshToken) {
    localStorage.setItem("refreshToken", authResponse.refreshToken);
  }

  window.dispatchEvent(new Event("auth:token-refreshed"));
  return authResponse.accessToken;
}

function getRefreshedAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function clearStoredAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.dispatchEvent(new Event("auth:logout"));
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const headers = new Headers(options.headers);

  if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  const signal = options.signal ?? controller.signal;

  const config: RequestInit = {
    ...options,
    headers,
    signal,
  };

  try {
    let response = await fetch(apiUrl(endpoint), config);

    // Refresh once when an authenticated request fails because its JWT expired.
    // The refresh request itself is excluded to prevent an infinite loop.
    if (
      response.status === 401 &&
      endpoint.replace(/^\/+/, "") !== REFRESH_ENDPOINT &&
      typeof window !== "undefined" &&
      localStorage.getItem("refreshToken")
    ) {
      try {
        const newAccessToken = await getRefreshedAccessToken();
        const retryHeaders = new Headers(headers);
        retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);

        response = await fetch(apiUrl(endpoint), {
          ...config,
          headers: retryHeaders,
        });
      } catch (refreshError) {
        clearStoredAuth();
        throw refreshError;
      }
    }

    if (!response.ok) {
      const responseText = await response.text();

      let message = responseText || "Something went wrong";

      try {
        const errorData = JSON.parse(responseText);

        if (errorData?.message) {
          message = errorData.message;
        }
      } catch {
        // Response was not JSON, so use the raw response text.
      }

      throw new Error(
        `${response.status} ${response.statusText}: ${message}`,
      );
    }

    // Some APIs return 204 No Content.
    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    return (await response.text()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out while contacting server");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
