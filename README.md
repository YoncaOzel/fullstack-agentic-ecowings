# EcoWings Fullstack Project

EcoWings is a flight booking and travel-planning platform built with a .NET 8 Clean Architecture backend, a React + Vite frontend, and a FastAPI-based AI service.

## Contents

- Backend API: ASP.NET Core Web API (Clean Architecture)
- Frontend: React 19 + Vite + TailwindCSS
- AI Service: FastAPI + RAG (FAISS) + OpenAI + CrewAI
- Payments: Stripe Checkout integration

## Folder Structure

```text
backend/
  Backend/
    CleanArchitecture.sln
    CleanArchitecture/
      CleanArchitecture.Application/
      CleanArchitecture.Infrastructure/
      CleanArchitecture.WebApi/
    Tests/
faq_service/
  main.py
  crew/
  rag/
  tools/
frontend/
  ecowings/
    src/
```

## Tech Stack

### Backend

- .NET 8
- Entity Framework Core 8
- Npgsql (PostgreSQL)
- MediatR
- FluentValidation
- ASP.NET Identity + JWT
- Stripe.net
- Serilog

### Frontend

- React 19
- Vite
- React Router
- Axios
- TailwindCSS 4
- Stripe JS / React Stripe

### AI Service

- Python + FastAPI
- LangChain
- FAISS
- OpenAI API
- CrewAI
- ReportLab (PDF generation)

## Requirements

- Node.js 20+
- npm 10+
- .NET SDK 8+
- Python 3.10+
- PostgreSQL
- OpenAI API key
- Stripe test keys (for payment flow)

## Environment Setup

### 1) Backend

Copy `backend/Backend/CleanArchitecture/CleanArchitecture.WebApi/appsettings.Example.json` and save it as `appsettings.json`.

Main fields to configure:

- `ConnectionStrings:DefaultConnection`
- `AmadeusSettings`
- `StripeSettings`
- `MailSettings`
- `JWTSettings`

### 2) Frontend

Copy `frontend/ecowings/.env.example` to `frontend/ecowings/.env`.

Example:

```env
VITE_API_URL=https://your-backend.com
VITE_API_BASE_URL=http://localhost:5000
```

### 3) FAQ / AI Service

Copy `faq_service/.env.example` to `faq_service/.env`.

Example:

```env
OPENAI_API_KEY=sk-...
ECOWINGS_BACKEND_URL=http://localhost:5000
SERPER_API_KEY=
```

## Run Instructions

It is recommended to run the services in separate terminals and in this order.

### 1) Backend API (Port: 5000)

```bash
cd backend/Backend/CleanArchitecture/CleanArchitecture.WebApi
dotnet restore
dotnet run
```

Health check:

- `http://localhost:5000/health`

### 2) FAQ / AI Service (Port: 8000)

```bash
cd faq_service
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health check:

- `http://localhost:8000/health`

### 3) Frontend (Port: 3000)

```bash
cd frontend/ecowings
npm install
npm run dev
```

App URL:

- `http://localhost:3000`

## Frontend Pages (Summary)

- `/` Home
- `/about` About
- `/login`, `/signup` Authentication
- `/flights` Flight search
- `/flight-tracker` Flight tracker
- `/lucky-flight` Lucky flight
- `/campaigns` Campaigns
- `/comments` Reviews/comments
- `/faq` AI FAQ chatbot
- `/travel-planner` AI travel planner + PDF
- `/profile` (protected)
- `/checkout` (protected)
- `/gift-ticket` (protected)
- `/payment-success`, `/payment-fail`

## API Notes

Backend exposes controller-based endpoint groups:

- `/api/Account/*`
- `/api/Auth/*`
- `/api/Flights/*`
- `/api/Payment/*`
- `/api/Ticket/*`
- `/api/User/*`
- `/api/Coupon/*`
- `/api/Airline*`
- `/api/Airport*`

AI service endpoints:

- `POST /chat` -> FAQ response
- `POST /plan` -> Generates a travel plan
- `GET /pdf/{pdf_id}` -> Downloads generated PDF

## Tests

### .NET test projects

- `backend/Backend/Tests/CleanArchitecture.UnitTests`
- `backend/Backend/Tests/CleanArchitecture.Infrastructure.Tests`

Run tests:

```bash
cd backend/Backend
dotnet test
```

## Development Notes

- Frontend `apiClient` uses `http://localhost:5000` by default.
- FAQ and Travel Planner pages call the AI service directly via `http://localhost:8000`.
- In payment flow, Stripe success/cancel URLs redirect to frontend pages (`/payment-success`, `/payment-fail`).

## Common Issues

- CORS errors: verify Backend and AI service CORS settings.
- 401 errors: check `jwToken` / `refreshToken` in localStorage and backend JWT settings.
- Stripe webhook issues: check `StripeSettings:WebhookSecret` and webhook endpoint configuration.
- AI not responding: verify `OPENAI_API_KEY` and FAISS index generation under `faq_service/data/vector_store`.
