export function formatCLP(amount: number | string): string {
  const n = typeof amount === "string" ? parseInt(amount, 10) : amount;
  return `$${n.toLocaleString("es-CL")}`;
}
