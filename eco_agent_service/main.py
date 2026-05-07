import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from eco_crew import EcoAlternativeCrew

app = FastAPI(title="EcoWings AI Agent Service", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

class RouteRequest(BaseModel):
    origin: str
    destination: str

@app.post("/api/eco/alternative")
def get_alternative_emission(request: RouteRequest):
    try:
        # Ekibi sahaya sürüyoruz
        crew = EcoAlternativeCrew(origin=request.origin, destination=request.destination)
        result_text = crew.run()
        
        # Groq bazen hala ```json tagleri koyabiliyor, onları temizleyelim
        cleaned_text = result_text.replace("```json", "").replace("```", "").strip()
        
        result_json = json.loads(cleaned_text)
        return result_json
        
    except json.JSONDecodeError:
        print(f"JSON Parse Hatası. Dönen Metin: {result_text}")
        return {"mode": "None", "emissionKg": 0}
    except Exception as e:
        print(f"Sunucu Hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
