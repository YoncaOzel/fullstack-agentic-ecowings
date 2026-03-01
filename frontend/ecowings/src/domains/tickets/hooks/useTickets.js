import { useState, useEffect, useCallback } from "react";
import ticketService from "../services/ticketService";

/**
 * Custom hook — kullanıcının biletlerini yükler ve bilet satın alma işlemini yönetir.
 * @param {boolean} autoFetch - Bileşen mount olduğunda biletleri otomatik yükle (varsayılan: false)
 */
export default function useTickets(autoFetch = false) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchMyTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ticketService.getMyTickets();
      // Backend doğrudan dizi döndürür: [...]
      if (Array.isArray(res.data)) {
        setTickets(res.data);
      } else {
        setError(res.data?.message || "Biletler yüklenemedi.");
      }
    } catch {
      setError("Biletler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const buyTicket = useCallback(async (data) => {
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const res = await ticketService.buyTicket(data);
      // POST /api/Ticket 201 Created döndürür
      if (res.status >= 200 && res.status < 300) {
        setSuccessMessage("Biletiniz başarıyla satın alındı!");
        return { success: true, data: res.data };
      } else {
        const msg = res.data?.message || "Bilet satın alınamadı.";
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Bilet satın alınamadı.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const buyTicketWithCoupon = useCallback(async (data) => {
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const res = await ticketService.buyTicketWithCoupon(data);
      // POST /api/Ticket/with-coupon Ok(result) döndürür
      if (res.status >= 200 && res.status < 300) {
        setSuccessMessage("Kuponlu biletiniz başarıyla satın alındı!");
        return { success: true, data: res.data };
      } else {
        const msg = res.data?.message || "Bilet satın alınamadı.";
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Bilet satın alınamadı.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchMyTickets();
  }, [autoFetch, fetchMyTickets]);

  return {
    tickets,
    loading,
    error,
    successMessage,
    fetchMyTickets,
    buyTicket,
    buyTicketWithCoupon,
    setError,
    setSuccessMessage,
  };
}
