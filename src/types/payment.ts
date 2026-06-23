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

export type MercadoPagoTestCard = {
  number: string;
  cvv: string;
  expiration: string;
  holder_name: string;
  identification_type: string;
  identification_number: string;
  payment_method_id: string;
};

export type MercadoPagoConfig = {
  integration: string;
  payment_flow: string;
  public_key: string;
  application_id?: string | null;
  credentials_ok?: boolean;
  credential_mode?: "test" | "production";
  sandbox: boolean;
  mode: "test" | "production";
  country: string;
  currency: string;
  sdk_url: string;
  endpoints: {
    config?: string;
    pay: string;
    status: string;
  };
  test_mode?: boolean;
  test_buyer_email?: string;
  test_card?: MercadoPagoTestCard;
  note?: string;
};

export type CardPaymentItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  category_id?: string;
};

export type CardPaymentBody = {
  amount: number;
  token: string;
  payment_method_id: string;
  installments: number;
  issuer_id?: number;
  description: string;
  external_reference: string;
  test_mode?: boolean;
  items?: CardPaymentItem[];
  payer: {
    email: string;
    name?: string;
    surname?: string;
    phone?: string;
    identification_type?: string;
    identification_number?: string;
  };
  shipping?: CheckoutShipping;
};

export type CardPaymentResponse = {
  payment_id: number;
  status: "approved" | "pending" | "rejected";
  status_detail: string;
  external_reference: string;
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
