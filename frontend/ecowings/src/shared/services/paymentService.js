import apiClient from "./apiClient";

const paymentService = {
  /**
   * Creates a Stripe Checkout session and returns the redirect URL.
   * POST /api/Payment/pay?ticketId=X&amount=Y
   * @returns {{ paymentUrl: string }}
   */
  initiatePayment: (ticketId, amount) =>
    apiClient.post("/api/Payment/pay", null, {
      params: { ticketId, amount },
    }),
};

export default paymentService;
