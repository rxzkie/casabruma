export type Payment = {
  id: string;
  mp_payment_id?: string;
  preference_id?: string;
  external_reference: string;
  amount: string;
  currency_id?: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "refunded";
  status_detail?: string;
  payment_method_id?: string;
  payment_type_id?: string;
  payer_email?: string;
  payer_name?: string;
  payer_surname?: string;
  payer_phone?: string;
  shipping_street?: string;
  shipping_number?: string;
  shipping_apartment?: string;
  shipping_city?: string;
  shipping_region?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export type PreferenceResponse = {
  preference_id: string;
  checkout_url: string;
  init_point?: string;
  sandbox_init_point?: string;
  external_reference?: string;
};

export type MercadoPagoConfig = {
  public_key: string;
  sandbox: boolean;
  country: string;
  currency: string;
};

export type CheckoutPayer = {
  name: string;
  surname: string;
  email: string;
  phone: string;
};

export type CheckoutShipping = {
  street: string;
  number: string;
  apartment?: string;
  city: string;
  region: string;
  postal_code?: string;
  country: string;
};

export type CheckoutData = {
  payer: CheckoutPayer;
  shipping: CheckoutShipping;
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
