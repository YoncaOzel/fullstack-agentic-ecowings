import asyncio

from langgraph.graph import StateGraph, END

from graph.state import TravelPlanState
from graph.nodes import (
    validate_input,
    search_flights,
    check_flight_results,
    run_crew_agents,
    fallback_estimate,
    generate_pdf,
)


# ---------------------------------------------------------------------------
# Graph builder
# ---------------------------------------------------------------------------

def build_graph():
    """
    LangGraph StateGraph'ını sıfırdan inşa eder ve derlenmiş (compiled) hâlini döndürür.

    Adımlar:
      1. StateGraph(TravelPlanState) ile tip-güvenli bir graph oluşturulur.
         TravelPlanState, tüm node'lar arasında dolaşan ortak sözlüktür.

      2. add_node() — Her Python fonksiyonu bir node olarak kaydedilir.
         Node adı string, ikinci argüman çağrılabilir bir fonksiyondur.

      3. set_entry_point() — Graph'ın ilk çalıştıracağı node belirlenir.
         Burada her zaman önce giriş doğrulama yapılır.

      4. add_edge() — Koşulsuz geçiş: A bitti → B başlar.

      5. add_conditional_edges() — Koşullu geçiş:
         check_flight_results fonksiyonu "retry" / "fallback" / "proceed"
         döndürür; bu etiketler hangi node'a gidileceğini belirler.
         "retry" durumu search_flights'ı kendi kendine çağırır (döngü).

      6. compile() — Graph'ı çalıştırılabilir bir Runnable'a dönüştürür;
         bu aşamada LangSmith tracing de etkinleştirilir.

    Akış şeması:
      validate_input
          │
          ▼
      search_flights ◄──── (retry)
          │
          ├─(proceed)──► run_crew_agents
          │                    │
          └─(fallback)─► fallback_estimate
                               │
                               ▼
                          run_crew_agents
                               │
                               ▼
                          generate_pdf
                               │
                               ▼
                             END
    """
    wf = StateGraph(TravelPlanState)

    # ── Node kayıtları ────────────────────────────────────────────────────────
    wf.add_node("validate_input",   validate_input)    # Giriş doğrulama
    wf.add_node("search_flights",   search_flights)    # Uçuş arama (retry'lı)
    wf.add_node("run_crew_agents",  run_crew_agents)   # CrewAI plan üretimi
    wf.add_node("fallback_estimate", fallback_estimate) # Max retry sonrası yedek
    wf.add_node("generate_pdf",     generate_pdf)      # PDF adımı (trace span'i)

    # ── Başlangıç noktası ─────────────────────────────────────────────────────
    wf.set_entry_point("validate_input")

    # ── Koşulsuz kenarlar ─────────────────────────────────────────────────────
    wf.add_edge("validate_input", "search_flights")   # Doğrulama geçtiyse uçuş ara

    # ── Koşullu kenar: search_flights → ? ────────────────────────────────────
    # check_flight_results fonksiyonu state'e bakıp string etiket döndürür;
    # sözlük bu etiketi node adına eşler.
    wf.add_conditional_edges(
        "search_flights",          # Bu node'dan çıkıldığında karar verilir
        check_flight_results,      # Karar fonksiyonu
        {
            "retry":    "search_flights",    # Tekrar dene (döngü)
            "fallback": "fallback_estimate", # Yedek tahmine geç
            "proceed":  "run_crew_agents",   # Doğrudan planlama başlasın
        },
    )

    # ── Geri kalan koşulsuz kenarlar ─────────────────────────────────────────
    wf.add_edge("fallback_estimate", "run_crew_agents") # Yedek sonrası yine plan üret
    wf.add_edge("run_crew_agents",   "generate_pdf")    # Plan bitti → PDF adımı
    wf.add_edge("generate_pdf",      END)               # Graph sona erer

    # Graph'ı derle: invoke() / ainvoke() ile çalıştırılabilir hâle gelir
    return wf.compile()


# ---------------------------------------------------------------------------
# Singleton graph instance (vector store pattern'i gibi)
# ---------------------------------------------------------------------------

_graph = None   # Modül seviyesinde tek örnek tutar


def get_graph():
    """
    Derlenmiş graph'ın tek bir örneğini döndürür (Singleton pattern).

    Neden Singleton:
      build_graph() her çağrıda tüm node/edge'leri yeniden bağlar ve
      LangSmith ile yeniden handshake yapar — bu pahalıdır.
      İlk çağrıda oluşturulan instance modül ömrü boyunca yeniden kullanılır.
    """
    global _graph
    if _graph is None:
        # Henüz oluşturulmadıysa bir kez inşa et
        _graph = build_graph()
    return _graph


# ---------------------------------------------------------------------------
# Public API — main.py'den çağrılır
# ---------------------------------------------------------------------------

async def run_travel_graph(req) -> tuple[str, str]:
    """
    FastAPI'dan gelen TravelRequest'i LangGraph'a sokup sonuçları döndürür.

    Adımlar:
      1. req (Pydantic modeli) → TravelPlanState dict'ine dönüştürülür.
         Tüm alanlar başlangıç değerleriyle (retry_count=0, error="" vb.) doldurulur.

      2. asyncio.to_thread() ile graph.invoke() ayrı bir thread'de çalıştırılır.
         Neden: crew.kickoff() (CrewAI) blocking (senkron) bir fonksiyondur.
         Onu doğrudan async endpoint içinde çağırmak FastAPI'nin event loop'unu
         dondurur ve diğer isteklerin işlenmesini engeller.
         to_thread() bunu ThreadPoolExecutor'a devrederek sorunun önüne geçer.

      3. Graph tamamlandığında result dict'inden crew_output ve pdf_id alınır
         ve tuple olarak döndürülür; main.py bu değerleri HTTP yanıtına yazar.

    Dönüş: (plan_text: str, pdf_id: str)
    """
    # Başlangıç state'ini hazırla — tüm zorunlu anahtarlar mevcut olmalı
    initial_state: TravelPlanState = {
        "origin":         req.origin,
        "destination":    req.destination,
        "start_date":     req.start_date,
        "end_date":       req.end_date,
        "passengers":     req.passengers,
        "budget":         req.budget or "",   # None gelebilir, boş string'e normalize et
        "flight_results": [],    # Başlangıçta boş; search_flights dolduracak
        "retry_count":    0,     # Deneme sayacı sıfırdan başlar
        "used_fallback":  False, # Fallback henüz tetiklenmedi
        "crew_output":    "",    # run_crew_agents dolduracak
        "pdf_id":         "",    # run_crew_agents dolduracak
        "error":          "",    # validate_input hata yazarsa buraya
    }

    # Blocking graph.invoke() çağrısını thread pool'a gönder, event loop serbest kalır
    result = await asyncio.to_thread(get_graph().invoke, initial_state)

    # Son state'den yalnızca ihtiyaç duyulan iki alan döndürülür
    return result["crew_output"], result["pdf_id"]
