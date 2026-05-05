# Book and Pay Endpoint Kullanımı

## Endpoint
```
POST /api/flights/book-and-pay
Authorization: Bearer {your-jwt-token}
Content-Type: application/json
```

## Request Body (Güncel)

Artık **Email** ve **Airline Code** kullanıyoruz:

```json
{
  "flightNumber": "BA123",
  "departureAirportCode": "LHR",
  "destinationAirportCode": "JFK",
  "departureTime": "2024-06-15T10:00:00Z",
  "estimatedArrivalTime": "2024-06-15T18:00:00Z",
  "price": 599.99,
  "airlineCode": "BA",
  "userEmail": "customer@example.com"
}
```

### Parametreler

| Alan | Tip | Açıklama | Örnek |
|------|-----|----------|-------|
| `flightNumber` | string | Uçuş numarası | "BA123" |
| `departureAirportCode` | string | Kalkış havalimanı kodu (IATA) | "LHR" |
| `destinationAirportCode` | string | Varış havalimanı kodu (IATA) | "JFK" |
| `departureTime` | string | Kalkış zamanı (ISO 8601, Z opsiyonel) | "2024-06-15T10:00:00" |
| `estimatedArrivalTime` | string | Tahmini varış zamanı (ISO 8601, Z opsiyonel) | "2024-06-15T18:00:00" |
| `price` | decimal | Bilet fiyatı | 599.99 |
| `airlineCode` | string | **Havayolu kodu** (ör: BA, TK, LH) | "BA" |
| `userEmail` | string | **Kullanıcı email adresi** | "customer@example.com" |

## Response

```json
{
  "ticketId": 123,
  "paymentUrl": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### Response Alanları

| Alan | Tip | Açıklama |
|------|-----|----------|
| `ticketId` | int | Oluşturulan biletin ID'si |
| `paymentUrl` | string | Stripe ödeme sayfası URL'i |

## Kullanım Akışı

### 1. Rezervasyon ve Ödeme Linki Oluşturma

```bash
curl -X POST https://localhost:5000/api/flights/book-and-pay \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flightNumber": "TK1990",
    "departureAirportCode": "IST",
    "destinationAirportCode": "LHR",
    "departureTime": "2024-06-15T08:30:00Z",
    "estimatedArrivalTime": "2024-06-15T11:45:00Z",
    "price": 450.00,
    "airlineCode": "TK",
    "userEmail": "john.doe@example.com"
  }'
```

### 2. Kullanıcıyı Ödeme Sayfasına Yönlendirme

Dönen `paymentUrl`'i kullanarak kullanıcıyı Stripe ödeme sayfasına yönlendirin:

```javascript
// Frontend (React örneği)
const response = await fetch('/api/flights/book-and-pay', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    flightNumber: 'TK1990',
    departureAirportCode: 'IST',
    destinationAirportCode: 'LHR',
    departureTime: '2024-06-15T08:30:00Z',
    estimatedArrivalTime: '2024-06-15T11:45:00Z',
    price: 450.00,
    airlineCode: 'TK',
    userEmail: 'john.doe@example.com'
  })
});

const data = await response.json();
window.location.href = data.paymentUrl;
```

### 3. Ödeme Tamamlandıktan Sonra

- Stripe webhook otomatik olarak `IsPaid` durumunu `true` yapar
- PNR kodu otomatik oluşturulur
- Kullanıcı `successUrl`'e yönlendirilir

## Hata Durumları

### 401 Unauthorized
```json
{
  "message": "Token geçersiz veya eksik"
}
```
**Çözüm:** Geçerli JWT token ile Authorization header'ı ekleyin.

### 400 Bad Request - Airline Bulunamadı
```json
{
  "message": "Airline with code BA not found"
}
```
**Çözüm:** Geçerli bir airline code kullanın (veritabanında kayıtlı olmalı).

### 400 Bad Request - User Bulunamadı
```json
{
  "message": "User with email customer@example.com not found"
}
```
**Çözüm:** Sistemde kayıtlı bir email adresi kullanın.

### 422 Validation Error
```json
{
  "errors": {
    "DepartureTime": ["The DepartureTime field is required."],
    "Price": ["The Price field must be greater than 0."]
  }
}
```
**Çözüm:** Tüm gerekli alanları doğru formatta gönderin.

## Örnek Havayolu Kodları

Yaygın havayolu kodları:

| Kod | Havayolu |
|-----|----------|
| TK | Turkish Airlines |
| BA | British Airways |
| LH | Lufthansa |
| AF | Air France |
| KL | KLM |
| EK | Emirates |
| QR | Qatar Airways |

## Test Verileri

### Test Kullanıcı Email
```
test@example.com
```

### Test Airline Code
```
TK
```

### Tam Test Request
```json
{
  "flightNumber": "TEST123",
  "departureAirportCode": "IST",
  "destinationAirportCode": "JFK",
  "departureTime": "2024-12-25T10:00:00",
  "estimatedArrivalTime": "2024-12-25T18:00:00",
  "price": 100.00,
  "airlineCode": "TK",
  "userEmail": "test@example.com"
}
```

**NOT:** Tarihlerin sonunda 'Z' yok - flight search endpoint'inden gelen formatla aynı! ✅

### Stripe Test Kartı
```
Kart Numarası: 4242 4242 4242 4242
Son Kullanma: Gelecekteki herhangi bir tarih (ör: 12/25)
CVC: Herhangi bir 3 haneli sayı (ör: 123)
```

## İlgili Endpoint'ler

### Ticket Durumunu Kontrol Et
```
GET /api/payment/check-ticket/{ticketId}
Authorization: Bearer {token}
```

### Sadece Rezervasyon Yap (Ödeme Linki Olmadan)
```
POST /api/flights/book
Authorization: Bearer {token}
```

### Manuel Ödeme Linki Oluştur
```
POST /api/payment/pay?ticketId={id}&amount={price}
Authorization: Bearer {token}
```

## Notlar

- ✅ Endpoint artık **email** ve **airline code** kullanıyor (daha kullanıcı dostu)
- ✅ User ve Airline otomatik olarak veritabanından bulunuyor
- ✅ Flight ve Ticket tek istekle oluşturuluyor
- ✅ Stripe ödeme linki anında hazır
- ⚠️ Webhook için Stripe CLI veya ngrok gerekiyor (development'ta)
- ⚠️ Authorization token gerekli
- ⚠️ Email ve Airline Code veritabanında mevcut olmalı
