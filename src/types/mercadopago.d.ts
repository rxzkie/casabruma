type MercadoPagoCardFormData = {
  token: string;
  paymentMethodId: string;
  issuerId: string;
  installments: string;
  identificationType: string;
  identificationNumber: string;
};

type MercadoPagoCardForm = {
  getCardFormData: () => MercadoPagoCardFormData;
};

type MercadoPagoCardFormConfig = {
  amount: string;
  iframe: boolean;
  form: Record<string, unknown>;
  callbacks: {
    onFormMounted?: (error: Error | null) => void;
    onFetching?: (resource: string) => void;
    onSubmit: (event: Event) => void;
  };
};

type MercadoPagoInstance = {
  cardForm: (config: MercadoPagoCardFormConfig) => MercadoPagoCardForm;
};

interface Window {
  MercadoPago: new (
    publicKey: string,
    options?: { locale?: string },
  ) => MercadoPagoInstance;
}
