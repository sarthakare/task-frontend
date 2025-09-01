import { clearAuth } from "@/utils/auth";

// Define the base URL once
// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const BASE_URL = "http://localhost:8000";

/**
 * Builds a full URL by prepending BASE_URL to relative paths.
 */
function buildUrl(endpoint: string): string {
  if (endpoint.startsWith("http")) return endpoint; // already a full URL
  return `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
}

/**
 * Login endpoint (used for manual login).
 */
export async function loginUser(email: string, password: string) {
  const res = await fetch(buildUrl("/auth/login"), {
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

  return await res.json(); // { access_token, token_type }
}

/**
 * Signup user (used for manual signup).
 */
export async function signupUser(
  name: string,
  email: string,
  password: string,
  department: string,
  role: string
) {
  const res = await fetch(buildUrl("/auth/signup"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password, department, role }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Signup failed");
  }

  return await res.json(); // { access_token, token_type }
}


/**
 * Generic API fetch that handles 401, error handling, and base URL prefixing.
 */
export async function apiFetch(input: string | Request, init?: RequestInit) {
  const url = typeof input === "string" ? buildUrl(input) : input;
  const res = await fetch(url, init);

  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    throw new Error("Unauthorized");
  }

  return res;
}
