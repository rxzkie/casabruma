export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001/api"
    : "https://casabrumabackend1.onrender.com/api");
