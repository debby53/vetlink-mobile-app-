const rawApiBase = import.meta.env.VITE_API_URL?.trim();
const rawBackendOrigin = import.meta.env.VITE_BACKEND_ORIGIN?.trim();
const defaultApiBase = "/api";

function normalizeBase(value: string) {
  return value.replace(/\/+$/, "");
}

function resolveApiBase() {
  if (rawApiBase && rawApiBase.length > 0) {
    return normalizeBase(rawApiBase);
  }

  if (rawBackendOrigin && rawBackendOrigin.length > 0) {
    return `${normalizeBase(rawBackendOrigin)}/api`;
  }

  return defaultApiBase;
}

export const API_BASE = resolveApiBase();

export const API_ORIGIN = API_BASE.startsWith("http://") || API_BASE.startsWith("https://")
  ? new URL(API_BASE).origin
  : window.location.origin;
