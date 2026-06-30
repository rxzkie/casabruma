export type OrderStatus = "COMPLETED" | "PENDING" | "FAILED";

export type CheckoutItem = {
  productId: string;
  quantity: number;
  variant?: string;
};

export type CheckoutPayer = {
  name: string;
  surname: string;
  email: string;
  phone?: string;
};

export type CheckoutShipping = {
  street: string;
  number: string;
  apartment?: string;
  city: string;
  region: string;
  postal_code?: string;
};

export type CheckoutBody = {
  items: CheckoutItem[];
  payer: CheckoutPayer;
  shipping: CheckoutShipping;
  discountCode?: string;
};

export type CheckoutResponse = {
  preferenceId: string;
  initPoint?: string;
  sandboxInitPoint?: string;
  externalReference: string;
  mode?: "sandbox" | "production";
  subtotal?: number;
  discountCode?: string | null;
  discountAmount?: number;
  total?: number;
};

export type PaymentCheck = {
  externalReference: string;
  status: OrderStatus;
  mpStatus?: string;
  amount: number | null;
  subtotal?: number | null;
  discountCode?: string | null;
  discountAmount?: number | null;
  currency: string;
  preferenceId?: string;
  mpPaymentId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CheckoutData = {
  payer: CheckoutPayer;
  shipping: CheckoutShipping & { country: string };
};

export const CHILE_REGIONS = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
] as const;

export const EMPTY_CHECKOUT: CheckoutData = {
  payer: { name: "", surname: "", email: "", phone: "" },
  shipping: {
    street: "",
    number: "",
    apartment: "",
    city: "",
    region: "Valparaíso",
    postal_code: "",
    country: "CL",
  },
};
