export type Payment = {
  id: string;
  mp_payment_id: string;
  preference_id: string;
  external_reference: string;
  amount: string;
  currency_id: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "refunded";
  status_detail: string;
  payment_method_id?: string;
  payment_type_id?: string;
  payer_email?: string;
  payer_name?: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type PreferenceResponse = {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
  external_reference?: string;
};

export type PreferenceItem = {
  id: string;
  title: string;
  picture_url?: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
};
