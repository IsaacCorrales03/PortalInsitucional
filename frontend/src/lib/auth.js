const API_BASE = "http://localhost:8000";

/**
 * @typedef {Object} LoginResponse
 * @property {string} access_token
 * @property {string} token_type
 */

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<LoginResponse>}
 */
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorMap = {
      401: "Credenciales inválidas. Verifique su correo y contraseña.",
      403: "Su cuenta está inactiva. Contacte a la administración.",
    };
    const message = errorMap[res.status] ?? "Error inesperado. Intente nuevamente.";
    throw new Error(message);
  }

  return res.json();
}

export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function getTokenPayload() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  return decodeToken(token);
}

export function getUserRoles() {
  return getTokenPayload()?.roles ?? [];
}

export function isSuperAdmin() {
  return getUserRoles().includes("superadmin");
}

export function isAdmin() {
  return getUserRoles().includes("admin");
}

export function isProfessor() {
  return getUserRoles().includes("profesor");
}

export function isStudent() {
  return getUserRoles().includes("estudiante");
}