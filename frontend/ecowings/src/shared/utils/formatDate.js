/**
 * Tarihi Türkçe formatına çevirir.
 * @param {string|Date} date
 * @param {Object} options - Intl.DateTimeFormat options
 */
export function formatDate(date, options = {}) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };
  return new Intl.DateTimeFormat("tr-TR", defaultOptions).format(d);
}

/**
 * Kısa tarih formatı: 15 Mar 2026
 */
export function formatDateShort(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Saat formatı: 14:30
 */
export function formatTime(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Dakikayı "2s 35dk" formatına çevirir.
 */
export function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}dk`;
  if (m === 0) return `${h}s`;
  return `${h}s ${m}dk`;
}
