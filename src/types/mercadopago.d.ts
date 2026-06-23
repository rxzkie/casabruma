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

type MercadoPagoBrickController = {
  unmount: () => void;
};

type MercadoPagoBricksBuilder = {
  create: (
    brick: string,
    containerId: string,
    settings: Record<string, unknown>,
  ) => Promise<MercadoPagoBrickController>;
};

type MercadoPagoInstance = {
  cardForm: (config: MercadoPagoCardFormConfig) => MercadoPagoCardForm;
  bricks: () => MercadoPagoBricksBuilder;
};

interface Window {
  MercadoPago: new (
    publicKey: string,
    options?: { locale?: string },
  ) => MercadoPagoInstance;
}
