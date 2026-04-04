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

  /**
   * Checks the payment status of a ticket.
   * GET /api/Payment/check-ticket/{ticketId}
   * @returns {{ ticketId, isPaid, pnrCode, price, bookingDate, passengerId, flightNumber }}
   */
  checkTicket: (ticketId) =>
    apiClient.get(`/api/Payment/check-ticket/${ticketId}`),
};

export default paymentService;
