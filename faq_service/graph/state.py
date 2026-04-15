from typing import TypedDict, List


class TravelPlanState(TypedDict):
    """
    LangGraph boyunca taşınan merkezi durum nesnesi.
    Her node bu dict'i alır, değiştirip geri döndürür.
    TypedDict kullanıldığı için anahtarlar tip-güvenlidir.
    """

    # ── Giriş alanları (HTTP isteğinden doldurulur) ──────────────────────────
    origin: str        # Kalkış şehri / havalimanı kodu (ör. "IST")
    destination: str   # Varış şehri / havalimanı kodu (ör. "JFK")
    start_date: str    # Gidiş tarihi, YYYY-MM-DD formatında
    end_date: str      # Dönüş tarihi, YYYY-MM-DD formatında
    passengers: int    # Yolcu sayısı
    budget: str        # Bütçe bilgisi (opsiyonel, boş string olabilir)

    # ── Graph içinde güncellenen ara durum alanları ──────────────────────────
    flight_results: List[dict]  # FlightSearchTool'dan dönen ham uçuş listesi
    retry_count: int            # Kaç kez uçuş araması yapıldığını sayar (0-2)
    used_fallback: bool         # Fallback branch'i tetiklenip tetiklenmediğini gösterir

    # ── Çıkış alanları (son node'lardan sonra dolu olur) ─────────────────────
    crew_output: str   # CrewAI agent'larının ürettiği seyahat planı metni
    pdf_id: str        # Üretilen PDF dosyasının UUID adı (indirme endpoint'inde kullanılır)
    error: str         # Bir hata oluştuysa mesajı; yoksa boş string
