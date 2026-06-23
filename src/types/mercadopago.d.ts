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
  bricks: () => MercadoPagoBricksBuilder;
};

interface Window {
  MercadoPago: new (
    publicKey: string,
    options?: { locale?: string },
  ) => MercadoPagoInstance;
}
