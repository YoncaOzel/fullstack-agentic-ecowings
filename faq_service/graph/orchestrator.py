import asyncio

# LangGraph'tan durum makinesi (StateGraph) ve bitiş sembolü (END) import edilir.
from langgraph.graph import StateGraph, END

# Graph boyunca taşınan paylaşımlı durum (state) tipi import edilir.
from graph.state import TravelPlanState

# Graph'ın her adımında çalışacak node fonksiyonları import edilir.
from graph.nodes import (
    validate_input,      # Kullanıcı girdisini doğrular (eksik alan, geçersiz tarih vb.)
    search_flights,      # Amadeus gibi bir API üzerinden uçuş arar
    check_flight_results,  # Arama sonucunu değerlendirir; retry / fallback / proceed döner
    run_crew_agents,     # CrewAI ajanlarını çalıştırır (otel, aktivite, eko-skor vb.)
    fallback_estimate,   # Uçuş bulunamazsa tahmini maliyet hesaplar
    generate_pdf,        # Seyahat planını PDF olarak üretir ve kayıt eder  
)


def build_graph():
    """
    LangGraph StateGraph kullanarak seyahat planlama iş akışını tanımlar ve derler.

    Akış şeması:
        validate_input
            → search_flights
                ├─ retry   → search_flights   (tekrar dene, retry_count artar)
                ├─ fallback → fallback_estimate → run_crew_agents
                └─ proceed  → run_crew_agents
                                → generate_pdf → END
    """
    # TravelPlanState ile tiplendirilmiş bir durum makinesi oluşturulur.
    wf = StateGraph(TravelPlanState)

    # --- Node Tanımlamaları ---
    # Her node, string ismiyle çağrılacak Python fonksiyonuna eşlenir.
    wf.add_node("validate_input", validate_input)
    wf.add_node("search_flights", search_flights)
    wf.add_node("run_crew_agents", run_crew_agents)
    wf.add_node("fallback_estimate", fallback_estimate)
    wf.add_node("generate_pdf", generate_pdf)

    # --- Başlangıç Noktası ---
    # Graph her çalıştığında ilk olarak giriş doğrulama adımı tetiklenir.
    wf.set_entry_point("validate_input")

    # --- Sabit Kenarlar (Unconditional Edges) ---
    # Giriş doğrulandıktan sonra her zaman uçuş arama adımına geçilir.
    wf.add_edge("validate_input", "search_flights")

    # --- Koşullu Kenarlar (Conditional Edges) ---
    # check_flight_results fonksiyonu uçuş arama sonucunu inceleyerek
    # "retry", "fallback" veya "proceed" string'lerinden birini döner;
    # graph bu değere göre sonraki node'u seçer.
    wf.add_conditional_edges(
        "search_flights",        # Kaynak node
        check_flight_results,    # Hangi yola gidileceğine karar veren fonksiyon
        {
            "retry": "search_flights",      # Uçuş bulunamadıysa yeniden dene
            "fallback": "fallback_estimate", # Deneme hakkı bittiyse tahmine geç
            "proceed": "run_crew_agents",   # Uçuş bulunduysa ajanlara ilerle
        },
    )

    # Yedek tahmin tamamlandıktan sonra ajan katmanına devam edilir.
    wf.add_edge("fallback_estimate", "run_crew_agents")

    # Ajanlar seyahat planını ürettikten sonra PDF oluşturma adımına geçilir.
    wf.add_edge("run_crew_agents", "generate_pdf")

    # PDF oluşturulunca akış sona erer.
    wf.add_edge("generate_pdf", END)

    # Graph tanımı derlenir ve çalıştırılabilir hale getirilir.
    return wf.compile()


# Modül düzeyinde tek bir graph örneği tutulur (singleton pattern).
_graph = None


def get_graph():
    """
    Derlenmiş graph örneğini döner.
    İlk çağrıda build_graph() çalıştırılır; sonraki çağrılarda mevcut örnek yeniden kullanılır.
    Bu sayede her istekte graph yeniden derlenmez, performans korunur.
    """
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph


async def run_travel_graph(req) -> tuple[str, str]:
    """
    Dışarıdan gelen bir isteği (req) alır, graph'i çalıştırır ve sonucu döner.

    Parametreler:
        req: origin, destination, start_date, end_date, passengers, budget alanlarını içeren istek nesnesi.

    Dönüş:
        (crew_output, pdf_id) — Ajan çıktısı metni ve üretilen PDF'in kimliği.
    """
    # İstek nesnesindeki alanlar, graph'ın anlayacağı başlangıç durumuna (state dict) dönüştürülür.
    initial_state: TravelPlanState = {
        "origin": req.origin,
        "destination": req.destination,
        "start_date": req.start_date,
        "end_date": req.end_date,
        "passengers": req.passengers,
        "budget": req.budget or "",   # Bütçe girilmemişse boş string kullanılır
        "flight_results": [],          # Uçuş araması henüz yapılmadı
        "retry_count": 0,              # Yeniden deneme sayacı sıfırdan başlar
        "used_fallback": False,        # Yedek tahmin henüz kullanılmadı
        "crew_output": "",             # Ajan çıktısı başlangıçta boş
        "pdf_id": "",                  # PDF kimliği başlangıçta boş
        "error": "",                   # Hata mesajı başlangıçta boş
    }

    # graph.invoke() senkron bir çağrıdır; asyncio.to_thread ile ayrı bir thread'de
    # çalıştırılarak FastAPI'nin async event loop'u bloklanmaz.
    result = await asyncio.to_thread(get_graph().invoke, initial_state)

    # Graph çalışması bitince son durumdan (result) ajan çıktısı ve PDF kimliği alınır.
    return result["crew_output"], result["pdf_id"]
