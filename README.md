# ✈️ EcoWings — Flight Booking Platform

EcoWings is a full-stack flight booking platform where users can search for flights, purchase tickets, manage their bookings, apply discount coupons, and review airlines. It is built with a .NET 8 Clean Architecture backend, a React + TypeScript frontend, and a PostgreSQL database hosted on Supabase.

An AI-powered assistant (Travel Planner Agent + FAQ RAG Assistant) is planned for integration in upcoming assignments.

## 🗂️ Project Structure

```
ecowings/
├── backend/                  # .NET 8 Clean Architecture API
├── frontend/                 # React + TypeScript (Vite)
├── ecowings-agent/           # FastAPI AI Agent (Python) — planned HW3+
│   ├── main.py
│   ├── agents/
│   │   ├── intent_classifier.py
│   │   ├── travel_planner.py   # Function Calling pipeline
│   │   └── faq_agent.py        # RAG pipeline
│   ├── tools/
│   │   ├── flight_tools.py
│   │   └── coupon_tools.py
│   └── rag/
│       ├── retriever.py
│       └── knowledge_base/ecowings_rules.txt
├── docs/
│   └── EcoWings_AI_Agent_Planning_Document.pdf
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- PostgreSQL connection string (Supabase recommended)

---

### 1. Backend (.NET 8)

```bash
cd backend/Backend
```

Create `appsettings.json` (or configure environment variables):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=...;Database=ecowings;Username=...;Password=..."
  },
  "JWTSettings": {
    "Key": "your-secret-key-min-32-chars",
    "Issuer": "EcoWings",
    "Audience": "EcoWingsClient",
    "DurationInMinutes": 60
  }
}
```

Run the API:

```bash
dotnet run --project CleanArchitecture/CleanArchitecture.WebApi
```

Swagger UI will be available at:
```
https://localhost:{port}/swagger
```

---

### 2. Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` by default.

Create a `.env` file if needed:

```env
VITE_API_BASE_URL=https://localhost:7000
```

---

### 3. AI Agent Service *(Planned — HW3+)*

```bash
cd ecowings-agent
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env`:

```env
OPENAI_API_KEY=sk-...
ECOWINGS_API_BASE=http://localhost:7000
```

Run:

```bash
python main.py
# Agent available at http://localhost:8000
```

---

## 🤖 AI Features (Planned)

### Feature 1 — Travel Planner Agent

A multi-step reasoning agent that turns a single natural-language request into a personalised flight plan.

**Example:**
> "Istanbul to Paris, 2 adults, early April, budget 600 EUR"

The agent:
1. Searches available flights via the EcoWings API
2. Ranks results by airline review score
3. Checks the user's available coupons
4. Filters options by budget
5. Returns 2–3 ranked plans with prices and a direct purchase link

**Technology:** OpenAI GPT-4o-mini + Function Calling

---

### Feature 2 — FAQ / Policy Assistant (RAG)

Answers questions about EcoWings policies instantly using Retrieval-Augmented Generation.

**Example questions:**
- "How many kg of baggage can I bring in Economy?"
- "Can I cancel my ticket after check-in closes?"
- "How do I apply a coupon code?"

**Technology:** ChromaDB vector store + OpenAI text-embedding-3-small + GPT-4o-mini

---

Both features are accessible through a single `/assistant` chat page in the frontend. An intent classifier automatically routes each message to the correct pipeline.

---

## 🛠️ Technologies Used

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend API | .NET 8 · ASP.NET Core · Clean Architecture |
| Database | PostgreSQL (Supabase) |
| Authentication | JWT Bearer Tokens |
| AI Agent | FastAPI · Python 3.11 |
| LLM | OpenAI GPT-4o-mini |
| Vector Store | ChromaDB |
| Embeddings | OpenAI text-embedding-3-small |
| Deployment | Vercel (frontend) · Render (agent) |

---

## 📡 Key API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/Account/authenticate` | Login | ❌ |
| POST | `/api/Account/register` | Register | ❌ |
| POST | `/api/Flights/search` | Search flights | ❌ |
| GET | `/api/Flights` | List all flights | ❌ |
| POST | `/api/Ticket` | Purchase ticket | ✅ |
| POST | `/api/Ticket/with-coupon` | Purchase with coupon | ✅ |
| GET | `/api/Ticket/my-flights` | My bookings | ✅ |
| GET | `/api/User/my-coupons` | My coupons | ✅ |
| POST | `/api/AirlineReview` | Leave a review | ✅ |

Full API documentation available via Swagger at `/swagger` when the backend is running.

