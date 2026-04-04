import os
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from crew.travel_crew import run_travel_crew

from rag.pdf_loader import get_vector_store
from rag.retriever import retrieve_faq_context

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---------------------------------------------------------------------------
# Startup: PDF'i indexle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("EcoWings FAQ Service starting...")
    get_vector_store()
    print("FAQ indexed, ready.")
    yield

app = FastAPI(
    title="EcoWings FAQ Service",
    description="RAG tabanlı SSS chatbot servisi",
    version="1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str
    found_in_docs: bool

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are a virtual assistant for EcoWings airline.
Your job is to answer customer questions based on the EcoWings FAQ and policy documents provided to you.

Rules:
- Use ONLY the information from the provided documents.
- If the answer is not in the documents, say: "I don't have information on this topic, please contact our support line."
- ALWAYS reply in the same language as the customer's question. If Turkish, reply in Turkish. If English, reply in English.
- Be concise, clear, and friendly.
- Never make up information.
"""

# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # 1. RAG: ilgili belge bölümlerini getir
    context = retrieve_faq_context(req.message, top_k=3)
    found = context != "İlgili bir bilgi bulunamadı."

    # 2. OpenAI'ya gönder
    user_prompt = f"""Customer question: {req.message}

Relevant EcoWings document sections:
{context}

Answer the customer's question based on the information above.
IMPORTANT: Detect the language of the customer's question and reply in THAT EXACT language. If the question is in English, reply in English. If Turkish, reply in Turkish. Do not translate."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=500,
    )

    answer = response.choices[0].message.content.strip()
    return ChatResponse(answer=answer, found_in_docs=found)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "EcoWings FAQ v1.0"}


# ---------------------------------------------------------------------------
# Travel Planner — Pydantic modelleri
# ---------------------------------------------------------------------------

class TravelRequest(BaseModel):
    origin: str
    destination: str
    start_date: str
    end_date: str
    passengers: int
    budget: str = ""

class TravelResponse(BaseModel):
    plan_text: str
    pdf_id: str

# ---------------------------------------------------------------------------
# Travel Planner — Endpoint'ler
# ---------------------------------------------------------------------------

@app.post("/plan", response_model=TravelResponse)
async def plan_travel(req: TravelRequest):
    plan_id = str(uuid.uuid4())
    pdf_dir = os.path.join(os.path.dirname(__file__), "data", "travel_plans")
    os.makedirs(pdf_dir, exist_ok=True)
    pdf_path = os.path.join(pdf_dir, f"{plan_id}.pdf")

    plan_text = run_travel_crew(
        origin=req.origin,
        destination=req.destination,
        start_date=req.start_date,
        end_date=req.end_date,
        passengers=req.passengers,
        budget=req.budget,
        pdf_output_path=pdf_path,
    )

    return TravelResponse(plan_text=plan_text, pdf_id=plan_id)

@app.get("/pdf/{pdf_id}")
async def download_pdf(pdf_id: str):
    try:
        uuid.UUID(pdf_id)
    except ValueError:
        return {"error": "Invalid ID"}

    pdf_path = os.path.join(os.path.dirname(__file__), "data", "travel_plans", f"{pdf_id}.pdf")

    if not os.path.exists(pdf_path):
        return {"error": "PDF not found"}

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename="EcoWings_Travel_Plan.pdf",
    )
