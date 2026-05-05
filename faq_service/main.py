import os
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from rag.pdf_loader import get_vector_store
from rag.retriever import retrieve_faq_context

# .env dosyasındaki ortam değişkenlerini (API key'leri vb.) yükle
load_dotenv()

# OpenAI istemcisini global olarak oluştur; tüm endpoint'ler bunu kullanır
_openai_key = os.getenv("OPENAI_API_KEY") or "placeholder"
client = OpenAI(api_key=_openai_key)


# ---------------------------------------------------------------------------
# Startup: PDF'i indexle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI'nin uygulama ömrü boyunca çalışan başlatma/kapatma yöneticisi.

    Ne yapar:
      - yield öncesi (startup): get_vector_store() çağrılır.
        Bu fonksiyon EcoWings FAQ PDF'ini okuyup FAISS vector store'a yükler.
        İlk istek geldiğinde değil, sunucu ayağa kalkarken yapılır;
        böylece ilk /chat isteği gecikmeden yanıt alır.
      - yield sonrası (shutdown): temizlik kodu yazılabilir (şu an boş).

    @asynccontextmanager: async with sözdizimini destekler, FastAPI bunu
    lifespan= parametresiyle alır ve uygulama döngüsüne bağlar.
    """
    print("EcoWings FAQ Service starting...")
    try:
        get_vector_store()
        print("FAQ indexed, ready.")
    except Exception as e:
        print(f"WARNING: Vector store could not be loaded: {e}")
        print("Service will run without RAG context.")
    yield


app = FastAPI(
    title="EcoWings FAQ Service",
    description="RAG tabanlı SSS chatbot servisi",
    version="1.0",
    lifespan=lifespan,   # Yukarıdaki startup/shutdown yöneticisini bağla
)

# CORS ayarları: frontend geliştirme portlarından gelen isteklere izin ver
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Create React App
        "http://localhost:3001",   # Alternatif React portu
        "http://localhost:5173",   # Vite / SvelteKit
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    """Kullanıcının chatbot'a gönderdiği mesajı taşır."""
    message: str

class ChatResponse(BaseModel):
    """Chatbot'un döndürdüğü yanıt ve RAG kaynağı bulunamadı mı bilgisini taşır."""
    answer: str
    found_in_docs: bool   # True: cevap FAQ belgelerinden, False: belgede bulunamadı


# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

# OpenAI'ya her sohbette gönderilen sabit rol ve kural tanımı
SYSTEM_PROMPT = """You are EcoWings' virtual assistant. You are here to help customers with questions about EcoWings airline services, policies, and flights.

Rules:
- ALWAYS reply in English, regardless of the language the customer uses.
- For questions about who you are or your identity, always introduce yourself as: "I am EcoWings' virtual assistant. I'm here to help you!"
- For other questions, use the information from the provided EcoWings documents.
- If the answer is not in the documents and the question is not about your identity, say: "I don't have information on this topic, please contact our support line."
- Be concise, clear, and friendly.
- Never make up information.
"""


# ---------------------------------------------------------------------------
# Endpoint: /chat
# ---------------------------------------------------------------------------

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    RAG tabanlı soru-cevap endpoint'i.

    Akış:
      1. retrieve_faq_context() ile kullanıcının sorusuna en yakın
         FAQ bölümleri FAISS vector store'dan çekilir (top_k=3 en yakın parça).
      2. Bulunan bağlam ve soru birleştirilerek OpenAI'ya gönderilir.
         SYSTEM_PROMPT modele rolünü ve kurallarını söyler;
         user_prompt ise soruyu + belge bağlamını içerir.
      3. gpt-4o-mini modeli düşük temperature (0.3) ile tutarlı yanıt üretir.
      4. found_in_docs: RAG bir şey bulduysa True, boş döndüyse False.
         Bu bilgi frontend'de "Kaynağa dayalı cevap" rozeti için kullanılabilir.
    """
    # 1. RAG: ilgili belge bölümlerini getir
    try:
        context = retrieve_faq_context(req.message, top_k=3)
        found = context != "İlgili bir bilgi bulunamadı."
    except Exception:
        context = "İlgili bir bilgi bulunamadı."
        found = False

    # 2. Model için kullanıcı promptunu hazırla
    user_prompt = f"""Customer question: {req.message}

Relevant EcoWings document sections:
{context}

Answer the customer's question based on the information above.
IMPORTANT: Always reply in English only, regardless of the language used in the question."""

    # 3. OpenAI API çağrısı
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=500,
    )

    # 4. Yanıtı çıkar ve döndür
    answer = response.choices[0].message.content.strip()
    return ChatResponse(answer=answer, found_in_docs=found)


# ---------------------------------------------------------------------------
# Endpoint: /health
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    """
    Servisin ayakta olup olmadığını kontrol eden sağlık endpoint'i.
    Docker health check veya load balancer probe'ları bu endpoint'i kullanır.
    Herhangi bir işlem yapmadan sabit JSON döndürür.
    """
    return {"status": "ok", "service": "EcoWings FAQ v1.0"}


# ---------------------------------------------------------------------------
# Travel Planner — Pydantic modelleri
# ---------------------------------------------------------------------------

class TravelRequest(BaseModel):
    """
    /plan endpoint'ine gelen HTTP isteğinin gövdesi.
    Pydantic otomatik tip doğrulaması yapar; eksik alan gelirse 422 döner.
    """
    origin: str
    destination: str
    start_date: str
    end_date: str
    passengers: int
    budget: str = ""    # Opsiyonel; verilmezse boş string varsayılan


class TravelResponse(BaseModel):
    """
    /plan endpoint'inin döndürdüğü yanıt.
    plan_text: CrewAI'nın ürettiği ham plan metni.
    pdf_id: İndirme linki için kullanılan UUID (/pdf/{pdf_id}).
    """
    plan_text: str
    pdf_id: str


# ---------------------------------------------------------------------------
# Endpoint: /plan
# ---------------------------------------------------------------------------

@app.post("/plan", response_model=TravelResponse)
async def plan_travel(req: TravelRequest):
    """
    Seyahat planı oluşturma endpoint'i.

    Akış:
      1. run_travel_graph(req) çağrılır; bu fonksiyon LangGraph'ı başlatır.
      2. LangGraph içinde:
           validate_input → search_flights → (retry/fallback/proceed)
           → run_crew_agents → generate_pdf → END
      3. Graph tamamlandığında (plan_text, pdf_id) tuple'ı döner.
      4. TravelResponse olarak JSON yanıt gönderilir.

    Lazy import (from graph.orchestrator import ...):
      orchestrator modülü LangSmith ve CrewAI'yı init eder; uygulama
      başlarken değil ilk /plan isteğinde yüklenmesi tercih edilir.
    """
    from graph.orchestrator import run_travel_graph

    # LangGraph iş akışını çalıştır, plan metnini ve PDF id'sini al
    plan_text, pdf_id = await run_travel_graph(req)
    return TravelResponse(plan_text=plan_text, pdf_id=pdf_id)


# ---------------------------------------------------------------------------
# Endpoint: /pdf/{pdf_id}
# ---------------------------------------------------------------------------

@app.get("/pdf/{pdf_id}")
async def download_pdf(pdf_id: str):
    """
    Önceden oluşturulan bir seyahat planı PDF'ini istemciye indirir.

    Güvenlik kontrolleri:
      1. uuid.UUID(pdf_id) ile parametre geçerli UUID formatında mı kontrol edilir.
         Geçersizse {"error": "Invalid ID"} döner.
         Bu kontrol path traversal saldırılarını önler (ör. "../../etc/passwd").
      2. os.path.exists() ile dosyanın gerçekten diskte var olduğu doğrulanır.

    Başarılı durumda:
      FileResponse ile dosya doğrudan akış olarak gönderilir.
      media_type="application/pdf" tarayıcıya içeriğin PDF olduğunu söyler.
      filename= indirildiğinde görünecek dosya adını belirler.
    """
    # 1. UUID formatını doğrula — ValueError fırlarsa geçersiz ID demektir
    try:
        uuid.UUID(pdf_id)
    except ValueError:
        return {"error": "Invalid ID"}

    # 2. Dosya yolunu güvenli şekilde oluştur
    pdf_path = os.path.join(
        os.path.dirname(__file__), "data", "travel_plans", f"{pdf_id}.pdf"
    )

    # 3. Dosya varlığını kontrol et
    if not os.path.exists(pdf_path):
        return {"error": "PDF not found"}

    # 4. PDF'i HTTP yanıtı olarak gönder
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename="EcoWings_Travel_Plan.pdf",   # İndirmede görünecek ad
    )
