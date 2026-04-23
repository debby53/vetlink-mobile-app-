const rawApiBase = import.meta.env.VITE_API_URL?.trim();
const defaultApiBase = "/api";

export const API_BASE = rawApiBase && rawApiBase.length > 0
  ? rawApiBase.replace(/\/+$/, "")
  : defaultApiBase;

export const API_ORIGIN = API_BASE.startsWith("http://") || API_BASE.startsWith("https://")
  ? new URL(API_BASE).origin
  : window.location.origin;
