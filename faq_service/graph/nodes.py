import os
import re
import uuid

from graph.state import TravelPlanState


# ---------------------------------------------------------------------------
# Node 1 — validate_input
# ---------------------------------------------------------------------------

def validate_input(state: TravelPlanState) -> TravelPlanState:
    required = ["origin", "destination", "start_date", "end_date"]
    for field in required:
        if not state.get(field, "").strip():
            # state'i spread edip üstüne error anahtarını ekle (immutable pattern)
            return {**state, "error": f"Missing required field: {field}"}

    # YYYY-MM-DD 
    date_pattern = re.compile(r"^\d{4}-\d{2}-\d{2}$")
    for date_field in ("start_date", "end_date"):
        if not date_pattern.match(state[date_field]):
            return {
                **state,
                "error": f"Invalid date format for '{date_field}': expected YYYY-MM-DD",
            }

    # Doğrulama başarılı — state değişmeden bir sonraki node'a geçer
    return state


# ---------------------------------------------------------------------------
# Node 2 — search_flights
# ---------------------------------------------------------------------------

def search_flights(state: TravelPlanState) -> TravelPlanState:
    """
    EcoWings Flight Search API'sini çağırarak uygun uçuşları arar.
    """
    # Lazy import: her çağrıda yüklenmemesi için node içinde import edilir
    from tools.flight_search import FlightSearchTool

    tool = FlightSearchTool()

    # state'teki tüm seyahat parametrelerini araca ilet
    result_str = tool._run(
        origin=state["origin"],
        destination=state["destination"],
        departure_date=state["start_date"],
        return_date=state["end_date"],
        adults=state["passengers"],
    )

    # Başarılı yanıt: ham sonucu listeye koy, graph ilerler
    if result_str.startswith("EcoWings returned"):
        return {**state, "flight_results": [{"raw": result_str}]}

    # Başarısız yanıt: retry_count artır, flight_results boş kalır
    # check_flight_results bu boşluğu görüp karar verecek
    return {
        **state,
        "flight_results": [],
        "retry_count": state["retry_count"] + 1,
    }


# ---------------------------------------------------------------------------
# Edge Router — check_flight_results  (node değil, conditional edge fonksiyonu)
# ---------------------------------------------------------------------------

def check_flight_results(state: TravelPlanState) -> str:
    """
    search_flights çıktısına bakarak graph'ın hangi yola sapacağını belirler.
    """
    if state["flight_results"]:
        # Liste doluysa uçuş bulunmuş demektir
        return "proceed"
    if state["retry_count"] < 2:
        # Henüz 2 denemeden az yapıldı, bir daha dene
        return "retry"
    # 2 deneme de başarısız — fallback branch'e geç
    return "fallback"


# ---------------------------------------------------------------------------
# Node 3 — fallback_estimate
# ---------------------------------------------------------------------------

def fallback_estimate(state: TravelPlanState) -> TravelPlanState:
    """
    Uçuş araması defalarca başarısız olduğunda devreye giren güvenlik ağı.

    Ne yapar:
      2. flight_results'a sahte bir "tahmini uçuş" mesajı koyar.
         Bu sayede run_crew_agents node'u boş listeyle karşılaşmaz;
         AI agent'ları tahmini bir plan üretmeye devam edebilir.
    """
    return {
        **state,
        "used_fallback": True,   # Downstream node'lar fallback kullanıldığını anlasın
        "flight_results": [
            {"raw": "Fallback: estimated flights will be provided by AI agents"}
        ],
    }


# ---------------------------------------------------------------------------
# Node 4 — run_crew_agents
# ---------------------------------------------------------------------------

def run_crew_agents(state: TravelPlanState) -> TravelPlanState:
    """
    CrewAI agent ekibini (travel_crew) başlatarak tam seyahat planı üretir
    ve planı PDF dosyasına yazar.
    """
    from crew.travel_crew import run_travel_crew

    # Her istek için tekil bir ID üret (aynı anda birden fazla plan çakışmasın)
    plan_id = str(uuid.uuid4())

    # PDF dosya yolu: proje kökü / data / travel_plans / <uuid>.pdf
    pdf_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data",
        "travel_plans",
    )
    os.makedirs(pdf_dir, exist_ok=True)   # Klasör yoksa oluştur
    pdf_path = os.path.join(pdf_dir, f"{plan_id}.pdf")

    # CrewAI ekibini çalıştır; tüm seyahat parametrelerini ilet
    plan_text = run_travel_crew(
        origin=state["origin"],
        destination=state["destination"],
        start_date=state["start_date"],
        end_date=state["end_date"],
        passengers=state["passengers"],
        budget=state["budget"],
        pdf_output_path=pdf_path,   # PDF buraya yazılır
    )

    # Sonuçları state'e kaydet; generate_pdf node'u bunları kullanmaya devam edecek
    return {**state, "crew_output": plan_text, "pdf_id": plan_id}


# ---------------------------------------------------------------------------
# Node 5 — generate_pdf
# ---------------------------------------------------------------------------

def generate_pdf(state: TravelPlanState) -> TravelPlanState:
    """
    PDF üretim adımını temsil eden geçiş node'u.
    """
    # PDF zaten run_crew_agents'ta yazıldı; burada ek işlem yok
    return state
