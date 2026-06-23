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
  form: {
    id: string;
    cardNumber: { id: string; placeholder: string };
    expirationDate: { id: string; placeholder: string };
    securityCode: { id: string; placeholder: string };
    cardholderName: { id: string; placeholder: string };
    issuer: { id: string; placeholder: string };
    installments: { id: string; placeholder: string };
    identificationType: { id: string; placeholder: string };
    identificationNumber: { id: string; placeholder: string };
    cardholderEmail: { id: string; placeholder: string };
  };
  callbacks: {
    onFormMounted?: (error: Error | null) => void;
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
