import { useState, useEffect, useCallback } from "react";
import flightService from "../services/flightService";

/**
 * Custom hook — uçuş listesini yükler ve yönetir.
 * @param {boolean} autoFetch - Bileşen mount olduğunda otomatik yükle (varsayılan: true)
 */
export default function useFlights(autoFetch = true) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await flightService.getFlights();
      if (res.data?.succeeded) {
        setFlights(res.data.data || []);
      } else {
        setError(res.data?.message || "Uçuşlar yüklenemedi.");
      }
    } catch {
      setError("Uçuşlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchFlights = useCallback(async (params) => {
    setLoading(true);
    setError("");
    try {
      const res = await flightService.searchFlights(params);
      if (res.data?.succeeded) {
        setFlights(res.data.data || []);
        return res.data.data || [];
      } else {
        setError(res.data?.message || "Arama başarısız.");
        return [];
      }
    } catch {
      setError("Arama sırasında bir hata oluştu.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchFlights();
  }, [autoFetch, fetchFlights]);

  return { flights, loading, error, fetchFlights, searchFlights, setFlights };
}
