/**
 * Fiyatı TRY veya belirtilen currency ile formatlar.
 * @param {number} amount
 * @param {string} currency - ISO 4217 (ör: 'TRY', 'USD', 'EUR')
 */
export function formatPrice(amount, currency = "TRY") {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Yüzde değerini formatlar.
 * @param {number} value - 0-100 arası
 */
export function formatPercent(value) {
  if (value === null || value === undefined) return "";
  return `%${value}`;
}
