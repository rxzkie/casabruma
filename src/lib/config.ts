export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export const MP_PUBLIC_KEY = (
  process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? ""
).trim();

export const MP_MODE = (
  process.env.NEXT_PUBLIC_MP_MODE ?? "production"
).trim() as "sandbox" | "production";

export function isMpSandbox() {
  return MP_MODE === "sandbox";
}
