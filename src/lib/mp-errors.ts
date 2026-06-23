const REJECTION_MESSAGES: Record<string, string> = {
  cc_rejected_bad_filled_card_number: "Número de tarjeta inválido.",
  cc_rejected_bad_filled_date: "Fecha de vencimiento inválida. Usa 11/30.",
  cc_rejected_bad_filled_security_code: "CVV inválido.",
  cc_rejected_bad_filled_other: "Revisa los datos de la tarjeta.",
  cc_rejected_call_for_authorize: "Tarjeta requiere autorización.",
  cc_rejected_insufficient_amount: "Fondos insuficientes.",
  cc_rejected_other_reason:
    "Tarjeta rechazada. En prueba usa titular APRO, doc. Otro y email distinto al de tu cuenta MP.",
  cc_rejected_high_risk:
    "Rechazado por antifraude. En prueba usa titular APRO, email test@testuser.com, doc. Otro y vencimiento 11/30.",
};

export function getRejectionMessage(statusDetail?: string) {
  if (!statusDetail) {
    return "Pago rechazado. En prueba: titular APRO, vence 11/30, doc. Otro, email distinto al de tu cuenta MP.";
  }
  return (
    REJECTION_MESSAGES[statusDetail] ??
    `Pago rechazado (${statusDetail}). En prueba usa titular APRO y doc. Otro.`
  );
}
