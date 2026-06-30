export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://casabrumabackend1.onrender.com/api";

export const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? "";

export const IS_MP_SANDBOX =
  process.env.NEXT_PUBLIC_MP_MODE !== "production";
