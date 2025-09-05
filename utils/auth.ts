// utils/auth.ts
import Cookies from "js-cookie";

interface User {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  role: string;
  department: string;
  supervisor_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface AuthPayload {
  access_token: string;
  token_type: string;
  user: User;
}

export function saveAuth({ access_token, user }: AuthPayload, rememberMe: boolean = false) {
  // Securely store token in HttpOnly cookie via API or client-side cookie
  Cookies.set("token", access_token, {
    expires: rememberMe ? 7 : undefined,
    secure: true,
    sameSite: "Strict",
  });

  Cookies.set("user", JSON.stringify(user), {
    expires: rememberMe ? 7 : undefined,
    secure: true,
    sameSite: "Strict",
  });

  if (rememberMe) {
    localStorage.setItem("rememberMe", "true");
  }

  // Trigger auth change event for real-time updates
  if (typeof window !== 'undefined') {
    localStorage.setItem('authChange', Date.now().toString());
    localStorage.removeItem('authChange');
  }
}

export function getToken(): string | undefined {
  return Cookies.get("token");
}

export function getUser(): User | null {
  const user = Cookies.get("user");
  return user ? JSON.parse(user) : null;
}

export function clearAuth() {
  Cookies.remove("token");
  Cookies.remove("user");
  localStorage.removeItem("rememberMe");
}
