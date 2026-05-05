# Stripe Webhook Sorunu ve Çözümü

## Sorun: IsPaid False Kalıyor

Ödeme yapıldıktan sonra `IsPaid` alanının `false` kalmasının nedeni, **Stripe webhook'un localhost'a ulaşamaması**dır.

## Neden Oluyor?

Stripe, ödeme tamamlandığında webhook'u çağırarak backend'inize bildirim gönderir. Ancak:
- Stripe bulut üzerinde çalışır
- Sizin backend'iniz localhost'ta çalışır
- Stripe, localhost'a direkt erişemez

## Çözüm 1: Stripe CLI Kullanımı (Önerilen - Development için)

### Adım 1: Stripe CLI Kurulumu
```bash
# Windows için Scoop ile:
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Ya da direkt indirin:
https://github.com/stripe/stripe-cli/releases/latest
```

### Adım 2: Stripe CLI'ya Login
```bash
stripe login
```

### Adım 3: Webhook Forwarding Başlatın
```bash
stripe listen --forward-to https://localhost:5000/api/payment/webhook
```

Bu komut size yeni bir webhook secret verecek:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### Adım 4: appsettings.json'ı Güncelleyin
```json
"StripeSettings": {
  "WebhookSecret": "whsec_xxxxxxxxxxxxx"  // Yeni secret'i buraya yapıştırın
}
```

### Adım 5: Uygulamanızı Yeniden Başlatın
Backend'inizi yeniden çalıştırın.

### Adım 6: Test Ödemesi Yapın
1. `POST /api/flights/book-and-pay` endpoint'ine istek atın
2. Dönen `paymentUrl`'e gidin
3. Test kartı kullanın: `4242 4242 4242 4242`
4. Stripe CLI terminalinde webhook'un geldiğini göreceksiniz
5. Backend console'da `[WEBHOOK SUCCESS]` mesajını göreceksiniz

## Çözüm 2: ngrok Kullanımı

### Adım 1: ngrok Kurulumu
```bash
# https://ngrok.com/download adresinden indirin
```

### Adım 2: ngrok Başlatın
```bash
ngrok http https://localhost:5000
```

### Adım 3: Stripe Dashboard'da Webhook Ekleyin
1. https://dashboard.stripe.com/webhooks adresine gidin
2. "Add endpoint" butonuna tıklayın
3. URL: `https://your-ngrok-url.ngrok.io/api/payment/webhook`
4. Events: `checkout.session.completed` seçin
5. Webhook signing secret'i kopyalayın

### Adım 4: appsettings.json'ı Güncelleyin
```json
"StripeSettings": {
  "WebhookSecret": "whsec_your_real_webhook_secret"
}
```

## Debug Endpoint'leri

### 1. Ticket Durumunu Kontrol Et
```bash
GET /api/payment/check-ticket/{ticketId}
```

Response:
```json
{
  "ticketId": 123,
  "isPaid": false,
  "pnrCode": null,
  "price": 599.99,
  "bookingDate": "2024-01-15T10:00:00Z",
  "passengerId": 5,
  "flightNumber": "BA123"
}
```

### 2. Manuel Ödeme İşaretleme (Sadece Test için)
```bash
POST /api/payment/test-mark-paid/{ticketId}
```

Response:
```json
{
  "message": "Ticket marked as paid successfully",
  "ticketId": 123,
  "isPaid": true,
  "pnrCode": "A1B2C3D4"
}
```

## Webhook Log'ları

Webhook çağrıldığında console'da şu mesajları göreceksiniz:

✅ **Başarılı:**
```
[WEBHOOK] Received webhook. Signature present: True
[WEBHOOK] Event type: checkout.session.completed
[WEBHOOK] Processing checkout.session.completed. TicketId from metadata: 123
[WEBHOOK] Found ticket 123. Current IsPaid: False
[WEBHOOK SUCCESS] Ticket 123 updated. IsPaid: true, PnrCode: A1B2C3D4
```

❌ **Başarısız:**
```
[WEBHOOK ERROR] Missing Stripe-Signature header
[WEBHOOK ERROR] Invalid signature: ...
[WEBHOOK ERROR] Ticket 123 not found in database
[WEBHOOK ERROR] Could not parse ticketId from metadata: null
```

## Production için

Production'da ngrok yerine gerçek domain kullanmalısınız:
1. Backend'i cloud'a deploy edin (Azure, AWS, etc.)
2. Stripe Dashboard'da webhook URL'i güncelleyin: `https://api.yourdomain.com/api/payment/webhook`
3. WebhookSecret'i production appsettings'e ekleyin

## Hızlı Test

1. Stripe CLI çalıştırın:
   ```bash
   stripe listen --forward-to https://localhost:7001/api/payment/webhook
   ```

2. Yeni terminalde test webhook gönderin:
   ```bash
   stripe trigger checkout.session.completed
   ```

3. Backend log'larını kontrol edin

## Sorun Devam Ederse

1. Backend console'u kontrol edin - webhook log'larını görüyor musunuz?
2. Stripe CLI terminali kontrol edin - webhook geldi mi?
3. `GET /api/payment/check-ticket/{ticketId}` ile ticket durumunu kontrol edin
4. `POST /api/payment/test-mark-paid/{ticketId}` ile manuel test yapın
