import apiClient from "../../../shared/services/apiClient";

const ticketService = {
  getMyTickets: () => apiClient.get("/api/Ticket/my-flights"),

  buyTicket: (data) => apiClient.post("/api/Ticket", data),

  buyTicketWithCoupon: (data) =>
    apiClient.post("/api/Ticket/with-coupon", data),
};

export default ticketService;
