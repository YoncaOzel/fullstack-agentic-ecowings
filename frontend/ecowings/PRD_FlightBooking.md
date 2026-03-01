# PRD — Flight Booking Web Sitesi
**Versiyon:** 1.0  
**Hazırlayan:** Senior Full Stack Developer  
**Tarih:** 2025

---

## 1. Proje Özeti

Dark temalı, tek sayfalık (SPA) bir uçuş arama ve listeleme web sitesi. Kullanıcı kalkış/varış noktası, tarih seçimi yaparak arama yapar; backend'den dönen uçuşlar kart formatında listelenir.

---

## 2. Teknoloji Seçimi (Öneri)

| Katman | Teknoloji |
|--------|-----------|
| Framework | React (Vite) veya Next.js |
| Stil | Tailwind CSS |
| HTTP İstekleri | Axios veya Fetch API |
| İkonlar | Lucide React veya React Icons |
| Tarih Seçici | React DatePicker |

> **Not:** Eğer framework bilgin yoksa düz HTML + CSS + Vanilla JS ile de yapılabilir. Bu PRD her iki yaklaşım için de geçerlidir.

---

## 3. Renk Paleti (Dark Tema)

```
Arkaplan (ana)     : #1a1a2e  veya  #0d0d0d
Kart arkaplanı     : #1e1e2e  veya  #1c1c1c
Kenarlık/çizgi     : #2a2a3e
Sarı/turuncu vurgu : #f5a623  veya  #FFC107  (butonlar, logo)
Beyaz metin        : #ffffff
Gri metin          : #a0a0b0
Yeşil (badge)      : #2ecc71
```

---

## 4. Sayfa Yapısı (Layout)

```
┌─────────────────────────────────────┐
│  NAVBAR                             │
├─────────────────────────────────────┤
│  HERO / BANNER (uçak içi fotoğraf)  │
├─────────────────────────────────────┤
│  ARAMA FORMU                        │
├─────────────────────────────────────┤
│  SONUÇLAR LİSTESİ (uçuş kartları)   │
├─────────────────────────────────────┤
│  FOOTER                             │
└─────────────────────────────────────┘
```

---

## 5. Bileşen Detayları

### 5.1 Navbar

**Görsel:** Logo solda, nav linkleri ortada, sağda telefon numarası ve "Your Flights" butonu.

**İçerik:**
- Logo: Sarı/turuncu uçak ikonu + "iygol" yazısı (ya da kendi marka adın)
- Linkler: Home | About Us | Services | Our Fleet
- Sağ: `(+351) 917184407` telefon ikonu ile | `Your Flights` beyaz kenarlıklı buton

**CSS İpuçları:**
```css
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  background: #1a1a2e;
}
```

---

### 5.2 Hero Banner

**Görsel:** Tam genişlikte uçak içi fotoğraf (lüks koltuklar, şampanya, çiçekler).

```html
<div class="hero">
  <img src="hero-image.jpg" alt="Luxury Flight" />
</div>
```

```css
.hero img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  object-position: center;
}
```

---

### 5.3 Arama Formu

Bu bölüm, hero bannerin hemen altında, koyu bir kart içinde yer alır.

#### 5.3.1 Üst Satır — Trip Type & Filtreler

Sol tarafta 3 buton:
- `ONE-WAY` (pasif, beyaz çerçeveli)
- `ROUND-TRIP` (aktif, sarı arka plan)
- `MULTI-CITY` (pasif)

Sağ tarafta dropdown'lar:
- `Traveller ▼`
- `Economy ▼`
- `TPK ▼` (dil/para birimi)
- `EN ▼`

#### 5.3.2 Alt Satır — Input Alanları

```
[ 🛫 Flying From      ] [ ↔ ] [ 🛬 Flying To       ] [ 📅 Departure ] [ 📅 Return ] [ SEARCH ]
```

**Alan Listesi:**

| Alan | Tip | Placeholder | Notlar |
|------|-----|-------------|--------|
| Flying From | text input | "Gothenburg Landvetter (GOT)" | Arama/autocomplete eklenebilir |
| Flying To | text input | "Tokyo (TYO)" | Arama/autocomplete eklenebilir |
| Departure | date picker | "Dec 04, 2023" | Takvim açılır |
| Return | date picker | "Dec 20, 2023" | Sadece Round-trip'te aktif |
| Search | button | — | Sarı/turuncu arka plan |

Ortadaki `↔` ikonu, Flying From ve Flying To değerlerini birbiriyle değiştirir (swap).

**Ekstra:** Formun altında `☐ Show direct flight only.` checkbox'ı

#### 5.3.3 Search Butonu Davranışı

```javascript
async function searchFlights() {
  const payload = {
    from: flyingFrom,       // örn: "GOT"
    to: flyingTo,           // örn: "TYO"
    departure: departureDate, // örn: "2023-12-04"
    return: returnDate,     // örn: "2023-12-20"
    tripType: "round-trip"
  };

  const response = await fetch("https://your-backend.com/api/flights/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  // data.flights dizisini state'e kaydet
  setFlights(data.flights);
}
```

> Backend URL'ini kendi backend adresine göre değiştir.

---

### 5.4 Sonuçlar Bölümü

#### 5.4.1 Filtre Satırı

```
Filters  ✕ Clear all  |  ★ Recommended  |  $ Cheapest  |  ⚡ Fastest  |  🔄 Refresh  |  Sort by ▼
```

"Recommended" sekmesi default olarak altı çizili/aktif gelir.

#### 5.4.2 Uçuş Kartı Yapısı

Her uçuş için iki satır gösterilir: **Gidiş** ve **Dönüş** (round-trip ise).

```
┌──────────────────────────────────────────────────────────┬──────────────────┐
│  21:00     DAC  ●────────────────────●  CXB     02:05    │   Airline Logo   │
│  Apr 11         12h 45m, 1 stop / LHR           Apr 12   │                  │
│                                                          │   Check It       │
│  21:00     CXB  ●────────────────────●  DAC     02:05    │   TP 16,200      │
│  Apr 11         12h 45m, 1 stop / LHR           Apr 12   │  [CHOOSE IT]     │
│                                                          │                  │
│  🟡 Recommended          5 Seats Left  ℹ                │                  │
└──────────────────────────────────────────────────────────┴──────────────────┘
```

**Kart İçindeki Elementler:**

```
Sol Panel:
  - Kalkış saati (büyük, kalın) + Kalkış kodu (büyük, kalın)
  - Animasyonlu çizgi (● ─────────────── ●)
  - Uçuş süresi + durak sayısı (örn: "12h 45m, 1 stop")
  - Durak kodu (örn: LHR)
  - Varış saati + Varış kodu
  - Kalkış/Varış tarihleri (küçük, gri)

Alt Köşe (sol):
  - "Recommended" sarı badge (eğer recommended ise)
  - "5 Seats Left" kırmızı/turuncu uyarı + ℹ ikonu

Sağ Panel:
  - Havayolu logo görseli
  - "Check It" gri küçük yazı
  - "TP 16,200" büyük fiyat
  - "CHOOSE IT" beyaz kenarlıklı buton
```

#### 5.4.3 Örnek Veri Yapısı (Backend'den Beklenen)

```json
{
  "flights": [
    {
      "id": "FL001",
      "outbound": {
        "departureTime": "21:00",
        "departureDate": "Apr 11",
        "departureCode": "DAC",
        "arrivalTime": "02:05",
        "arrivalDate": "Apr 12",
        "arrivalCode": "CXB",
        "duration": "12h 45m",
        "stops": 1,
        "stopCodes": ["LHR"]
      },
      "inbound": {
        "departureTime": "21:00",
        "departureDate": "Apr 11",
        "departureCode": "CXB",
        "arrivalTime": "02:05",
        "arrivalDate": "Apr 12",
        "arrivalCode": "DAC",
        "duration": "12h 45m",
        "stops": 1,
        "stopCodes": ["LHR"]
      },
      "airline": {
        "name": "Lufthansa",
        "logo": "https://your-cdn.com/logos/lufthansa.png"
      },
      "price": 16200,
      "currency": "TP",
      "seatsLeft": 5,
      "isRecommended": true
    }
  ]
}
```

---

### 5.5 Footer

İki katmanlı footer:

**Üst Katman (beyaz/açık arka plan):**
Akreditasyon ve sertifika logoları yan yana:
```
Accredited Member  |  Approved Agent  |  Verified by  |  Our Partners  |  Authorised by  |  Registered at  |  Certified By
[BASIS logo]          [Biman logo]        [IUCN logo]    [Google logo]    [IATA logo]       [S logo]          [ISO logo]
```

**Alt Katman (koyu arka plan):**
```
[🛫 iygol logo]    Home | About Us | Services | Our Fleet    📞 (+351) 917184407
```

---

## 6. State Yönetimi

```
state = {
  tripType: "round-trip",       // "one-way" | "round-trip" | "multi-city"
  flyingFrom: "",
  flyingTo: "",
  departureDate: null,
  returnDate: null,
  travelerCount: 1,
  cabinClass: "Economy",
  directOnly: false,
  
  // Sonuçlar
  isLoading: false,
  flights: [],
  error: null,
  
  // Filtreler
  sortBy: "recommended"         // "recommended" | "cheapest" | "fastest"
}
```

---

## 7. Kullanıcı Akışı (User Flow)

```
1. Kullanıcı sayfaya girer
   → Navbar + Hero Banner + Boş arama formu görünür

2. Kullanıcı form alanlarını doldurur
   → Flying From, Flying To yazılır
   → Departure ve Return tarihleri seçilir

3. "SEARCH" butonuna tıklanır
   → isLoading = true → Spinner/skeleton göster
   → Backend'e POST isteği atılır
   → Yanıt gelince flights[] state'e yazılır
   → isLoading = false → Kartlar listelenir

4. Kullanıcı "CHOOSE IT" butonuna tıklar
   → Backend'e rezervasyon isteği atılır (veya detay sayfasına yönlendirilir)
```

---

## 8. Hata Yönetimi

| Durum | Gösterilecek |
|-------|--------------|
| Arama alanları boş | "Lütfen tüm alanları doldurun" uyarısı |
| Backend'e ulaşılamıyor | "Bir hata oluştu, lütfen tekrar deneyin." |
| Sonuç bulunamadı | "Bu kriterlere uygun uçuş bulunamadı." boş durum mesajı |
| Yükleniyor | Kart iskeleti (skeleton) veya spinner |

---

## 9. Responsive Davranış

| Ekran | Davranış |
|-------|----------|
| Desktop (1200px+) | Tüm form tek satırda, kartlar tam genişlikte |
| Tablet (768–1199px) | Form 2 satıra bölünür |
| Mobil (< 768px) | Form dikey stack, kartlar scroll ile listelenir |

---

## 10. Dosya Yapısı (Öneri)

```
project/
├── public/
│   ├── images/
│   │   ├── hero.jpg
│   │   └── logos/          ← Havayolu ve sertifika logoları
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── SearchForm.jsx
│   │   ├── FlightCard.jsx
│   │   ├── ResultsSection.jsx
│   │   └── Footer.jsx
│   ├── services/
│   │   └── flightApi.js    ← Backend istekleri burada
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css           ← Genel stiller ve dark tema değişkenleri
├── package.json
└── index.html
```

---

## 11. Geliştirme Sırası (Önerilen)

1. `index.html` + temel CSS değişkenleri (dark tema renkleri)
2. Navbar bileşeni
3. Hero Banner
4. Arama Formu (sadece UI, butona tıklanınca console.log)
5. Mock data ile Uçuş Kartı tasarımı
6. Backend entegrasyonu (fetch/axios)
7. Yükleniyor / Hata durumları
8. Footer
9. Responsive düzenlemeler
10. Son kontrol ve deploy

---

## 12. Önemli Notlar

- Backend URL'leri `.env` dosyasında sakla: `VITE_API_URL=https://your-backend.com`
- CORS ayarlarının backend'de açık olduğundan emin ol
- Havayolu logoları için backend'den URL mi gelecek yoksa local mi tutulacak, karar ver
- "CHOOSE IT" butonunun yönlendireceği yer (detay sayfası mı? ödeme akışı mı?) belirlenmeli
