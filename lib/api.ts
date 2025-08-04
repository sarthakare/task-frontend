// lib/api.ts or services/auth.ts
import { clearAuth } from "@/utils/auth";

export async function loginUser(email: string, password: string) {
  const res = await fetch("http://127.0.0.1:8000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Login failed");
  }

  return await res.json(); // { access_token: string, token_type: "bearer" }
}

export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);

  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    throw new Error("Unauthorized");
  }

  return res;
}
