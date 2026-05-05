import apiClient from "../../../shared/services/apiClient";

// Ticket (Flight Orders) --------------------------------------------------------

export const getAllTickets = () =>
  apiClient.get("/api/Ticket/all").then((r) => r.data);

export const getTicketById = (id) =>
  apiClient.get(`/api/Ticket/${id}`).then((r) => r.data);

export const updateTicket = (id, payload) =>
  apiClient.put(`/api/Ticket/${id}`, payload).then((r) => r.data);

export const deleteTicket = (id) =>
  apiClient.delete(`/api/Ticket/${id}`).then((r) => r.data);

// User Management --------------------------------------------------------------

export const getAllUsers = () =>
  apiClient.get("/api/User").then((r) => r.data);

export const getUserById = (id) =>
  apiClient.get(`/api/User/${id}`).then((r) => r.data);

export const createUser = (payload) =>
  apiClient.post("/api/User", payload).then((r) => r.data);

export const updateUser = (id, payload) =>
  apiClient.put(`/api/User/${id}`, payload).then((r) => r.data);

export const deleteUser = (id) =>
  apiClient.delete(`/api/User/${id}`).then((r) => r.data);

// Flights ----------------------------------------------------------------------

export const getAllFlights = () =>
  apiClient.get("/api/Flights").then((r) => r.data);

// Helpers: map backend AdminTicketDto → UI order row format ----------------------------
// Backend AdminTicketDto fields: ticketId, pnrCode, isPaid, bookingDate, price,
// passengerId, passengerName, passengerEmail,
// flightId, flightNumber, from, to, departureTime, estimatedArrivalTime
// UI expects: id, pax, email, from, to, fromC, date, time, cabin, status, amount

export function mapTicketToOrder(ticket) {
  const depTime = ticket.departureTime ? new Date(ticket.departureTime) : null;

  return {
    id: ticket.pnrCode ?? String(ticket.ticketId),
    pax: ticket.passengerName || `User #${ticket.passengerId}`,
    email: ticket.passengerEmail ?? "",
    from: ticket.from ?? "???",
    to: ticket.to ?? "???",
    fromC: `${ticket.from ?? "???"} → ${ticket.to ?? "???"}`,
    date: depTime
      ? depTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "",
    time: depTime
      ? depTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
      : "",
    cabin: "Economy",
    status: ticket.isPaid ? "Confirmed" : "Pending",
    amount: Number(ticket.price ?? 0),
  };
}

// Analytics derivation helpers — compute chart/KPI data from ticket list --------
// Source: AdminTicketDto array from GET api/Ticket/all
// Available fields: ticketId, isPaid, bookingDate, price, from, to, flightNumber,
//                   passengerName, passengerEmail, departureTime, estimatedArrivalTime

function getMonthBuckets(months) {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return buckets;
}

function getWeekBuckets(weeks) {
  const now = new Date();
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - i * 7 - (now.getDay() || 7) + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    buckets.push({ start, end });
  }
  return buckets;
}

// Returns number[] of length `months` — monthly total revenue (isPaid tickets)
export function deriveRevenueSparkline(tickets, months = 12) {
  const buckets = getMonthBuckets(months);
  return buckets.map(({ year, month }) =>
    tickets
      .filter((t) => {
        if (!t.isPaid) return false;
        const d = new Date(t.bookingDate);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, t) => sum + Number(t.price ?? 0), 0),
  );
}

// Returns number[] of length `months` — monthly booking count (all tickets)
export function deriveFlightsSparkline(tickets, months = 12) {
  const buckets = getMonthBuckets(months);
  return buckets.map(({ year, month }) =>
    tickets.filter((t) => {
      const d = new Date(t.bookingDate);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length,
  );
}

// Returns Array<{ m, total, eco, standard }> — matches REVENUE_MONTHLY shape
// eco/standard split not available from Ticket; eco=0, standard=total as placeholder
// TODO: add cabin/fare-class field to Ticket entity to split eco vs standard properly
export function deriveRevenueMonthly(tickets, months = 12) {
  const buckets = getMonthBuckets(months);
  return buckets.map(({ year, month, label }) => {
    const total = tickets
      .filter((t) => {
        if (!t.isPaid) return false;
        const d = new Date(t.bookingDate);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, t) => sum + Number(t.price ?? 0), 0);
    return { m: label, total: Math.round(total), eco: 0, standard: Math.round(total) };
  });
}

// Returns number[] of length `weeks` — weekly booking count
export function deriveBookingsByWeek(tickets, weeks = 12) {
  const buckets = getWeekBuckets(weeks);
  return buckets.map(({ start, end }) =>
    tickets.filter((t) => {
      const d = new Date(t.bookingDate);
      return d >= start && d <= end;
    }).length,
  );
}

// Airlines & Airports ---------------------------------------------------------

export const getAllAirlines = () =>
  apiClient.get("/api/Airline").then((r) => r.data);

export const getAllAirports = () =>
  apiClient.get("/api/Airport").then((r) => r.data);

// Review & ML ----------------------------------------------------------------

export const getReviews = () =>
  apiClient.get("/api/AirlineReview").then((r) => r.data);

export const predictSentiment = (comment) =>
  apiClient.get("/api/AdminML/test-prediction", { params: { comment } }).then((r) => r.data);

// Returns Array<{ pair, pct, n }> — top N routes by booking volume (matches ROUTES_TOP)
export function deriveTopRoutes(tickets, n = 6) {
  const counts = {};
  tickets.forEach((t) => {
    if (!t.from || !t.to) return;
    const key = `${t.from} → ${t.to}`;
    counts[key] = (counts[key] ?? 0) + 1;
  });
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
  const max = sorted[0]?.[1] ?? 1;
  return sorted.map(([pair, count]) => ({
    pair,
    n: count,
    pct: Math.round((count / max) * 100),
  }));
}

// Helpers: map backend UserDto → UI user row format ----------------------------
// Backend UserDto: id, name, email, role, dateOfBirth, gender, phoneNumber
// UI expects: id, name, email, city, tier, trips, miles, spend, status, joined, last

export function mapUserToRow(user) {
  return {
    id: `U-${String(user.id).padStart(5, "0")}`,
    name: user.name ?? "",
    email: user.email ?? "",
    // TODO: verify field mapping — UserDto has no city/tier/trips/miles/spend/last fields
    city: user.city ?? "—",
    tier: user.tier ?? "Basic",
    trips: user.trips ?? 0,
    miles: user.miles ?? 0,
    spend: user.spend ?? 0,
    status: user.isActive === false ? "Suspended" : "Active",
    joined: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    last: user.lastLogin
      ? new Date(user.lastLogin).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
  };
}
