# PRD: EcoWings MCP Server (v2)

**Proje:** EcoWings `faq_service` (Python/FastAPI)  
**Feature:** MCP Server — EcoWings araçlarını MCP protokolüyle yayımla  
**Tarih:** Mayıs 2026  
**Teslim:** Yarın 16:30  
**Durum:** Implementation Ready

---

## 1. Amaç

EcoWings `faq_service`'ini bir **MCP (Model Context Protocol) server** olarak yayımlamak. Claude Desktop ve Python test client'ı bu server'a bağlanarak EcoWings'in araçlarını kullanabilecek.

**Mevcut hiçbir dosya değiştirilmez.** MCP server tamamen yeni dosyalar olarak eklenir.

---

## 2. MCP Nedir?

MCP (Model Context Protocol), Anthropic'in geliştirdiği açık standart. AI agent'larına harici araçları standart bir protokol üzerinden bağlar — "AI için USB-C".

```
[MCP Client]  ←── MCP Protokolü ──→  [MCP Server]
 Claude Desktop                        EcoWings
 Python script                         (3 tool expose eder)
```

---

## 3. Transport: Stdio

Claude Desktop stdio transport kullanır — MCP server'ı child process olarak başlatır, stdin/stdout üzerinden iletişim kurar. Bu en stabil ve en yaygın kullanılan yöntemdir.

---

## 4. Expose Edilecek MCP Tool'ları

### Tool 1: `search_flights`
```
Açıklama : EcoWings sisteminde uçuş arar
Input     : origin (str), destination (str), date (str), passengers (int)
Output    : Uçuş listesi veya "no flights found" mesajı (str)
```

### Tool 2: `ask_faq`
```
Açıklama : EcoWings SSS dokümanından soru cevaplar (RAG)
Input     : question (str)
Output    : Cevap metni (str)
```

### Tool 3: `create_travel_plan`
```
Açıklama : Tam seyahat planı oluşturur (LangGraph + CrewAI pipeline)
Input     : origin (str), destination (str), start_date (str),
            end_date (str), passengers (int), budget (str, optional)
Output    : Plan özeti + PDF ID (str)
```

---

## 5. Dosya Yapısı

```
faq_service/
├── mcp_server/                     # YENİ klasör
│   ├── __init__.py
│   └── server.py                   # MCP server tanımı + tool'lar + __main__ entry
├── mcp_client_test.py              # YENİ — Python test client
├── graph/                          # MEVCUT — DEĞİŞMEZ
├── crew/                           # MEVCUT — DEĞİŞMEZ
├── tools/                          # MEVCUT — DEĞİŞMEZ
├── rag/                            # MEVCUT — DEĞİŞMEZ
├── main.py                         # MEVCUT — DEĞİŞMEZ
└── requirements.txt                # mcp paketi eklenir
```

---

## 6. Yeni Bağımlılık

`requirements.txt`'e eklenecek:

```
mcp[cli]>=1.0.0
```

Kurulum:
```bash
pip install "mcp[cli]"
```

---

## 7. Implementation Detayı

### 7.1 `mcp_server/__init__.py`

Boş dosya.

### 7.2 `mcp_server/server.py`

**ÖNEMLİ:** Bu dosya `mcp.server.fastmcp` paketini kullanır (`from mcp.server.fastmcp import FastMCP`). `fastmcp` ayrı bir paket DEĞİL — `mcp[cli]` paketinin içinde geliyor.

```python
import os
import sys
import asyncio

# faq_service root'unu sys.path'e ekle — import'lar doğru çalışsın
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("EcoWings")


@mcp.tool()
def search_flights(origin: str, destination: str, date: str, passengers: int) -> str:
    """Search for available flights on EcoWings airline system.
    
    Args:
        origin: Departure city (e.g. Istanbul)
        destination: Arrival city (e.g. Paris)  
        date: Flight date in YYYY-MM-DD format
        passengers: Number of passengers
    """
    from tools.flight_search import FlightSearchTool
    tool = FlightSearchTool()
    # FlightSearchTool._run() parametrelerini mevcut dosyadan kontrol et
    # ve aynı şekilde çağır
    result = tool._run(
        origin=origin,
        destination=destination,
        date=date,
        passengers=passengers
    )
    return str(result)


@mcp.tool()
def ask_faq(question: str) -> str:
    """Ask a question about EcoWings airline services using the FAQ knowledge base.
    Answers questions about baggage, check-in, refunds, loyalty program etc.
    
    Args:
        question: The question to ask about EcoWings services
    """
    from rag.pdf_loader import get_vector_store
    from langchain_openai import ChatOpenAI
    
    vector_store = get_vector_store()
    docs = vector_store.similarity_search(question, k=3)
    context = "\n".join([doc.page_content for doc in docs])
    
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
    prompt = f"""Based on the following EcoWings FAQ context, answer the question.
If the answer is not in the context, say you don't have that information.

Context:
{context}

Question: {question}

Answer:"""
    response = llm.invoke(prompt)
    return response.content


@mcp.tool()
def create_travel_plan(
    origin: str,
    destination: str, 
    start_date: str,
    end_date: str,
    passengers: int,
    budget: str = "moderate"
) -> str:
    """Create a complete travel plan using EcoWings AI pipeline.
    Uses LangGraph orchestration with CrewAI agents to generate
    flight search, hotel recommendations, and day-by-day itinerary.
    
    Args:
        origin: Departure city
        destination: Arrival city
        start_date: Trip start date (YYYY-MM-DD)
        end_date: Trip end date (YYYY-MM-DD)
        passengers: Number of travelers
        budget: Budget level - low, moderate, or high
    """
    from graph.orchestrator import run_travel_graph
    from types import SimpleNamespace
    
    request = SimpleNamespace(
        origin=origin,
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        passengers=passengers,
        budget=budget
    )
    
    result = asyncio.run(run_travel_graph(request))
    return f"PDF ID: {result.get('pdf_id', 'N/A')}\n\n{result.get('crew_output', '')}"


if __name__ == "__main__":
    mcp.run()  # stdio transport — parametre verme!
```

**Ajana kritik notlar:**
- `mcp.run()` → PARAMETRE VERMEYİN. `host`, `port`, `transport` gibi argüman vermeyin. Varsayılan stdio ile çalışır.
- `FlightSearchTool._run()` → parametreleri mevcut `tools/flight_search.py` dosyasındaki `_run` metodunun imzasına göre ayarla. Yukarıdaki örnek tahmini — gerçek parametre isimlerini dosyadan oku.
- `ask_faq` tool'u: `rag/retriever.py`'deki mevcut `RAGRetriever` sınıfı varsa direkt onu kullan. Yoksa yukarıdaki pattern (vector_store + llm) `main.py`'deki mevcut `/chat` endpoint implementasyonundan kopyalanmalı.
- `create_travel_plan`: `run_travel_graph` async fonksiyon — `asyncio.run()` ile sarılmalı çünkü MCP tool sync olarak çağrılır.
- `sys.path.insert` satırı zorunlu — yoksa `from tools.flight_search import ...` çalışmaz.
- `load_dotenv()` zorunlu — `OPENAI_API_KEY` ve diğer env var'lar yüklensin.

---

## 8. Claude Desktop Config

Windows'ta `%APPDATA%\Claude\claude_desktop_config.json` dosyasına `mcpServers` bloğuna ekle:

```json
{
  "mcpServers": {
    "ecowings": {
      "command": "C:\\Users\\yonca\\Documents\\GitHub\\Eco-Wings\\faq_service\\venv\\Scripts\\python.exe",
      "args": ["-m", "mcp_server.server"],
      "cwd": "C:\\Users\\yonca\\Documents\\GitHub\\Eco-Wings\\faq_service"
    }
  }
}
```

**Not:**
- `command`: venv'deki python.exe'nin tam yolu
- `args`: modül olarak çalıştır
- `cwd`: faq_service klasörü — import'lar doğru çalışsın

Mevcut başka server'lar varsa (magic vb.) `mcpServers` objesine yanına ekle, silme.

---

## 9. Python Test Client

`faq_service/mcp_client_test.py`:

```python
"""
EcoWings MCP Server Test Client
MCP server'ı stdio üzerinden başlatır ve 3 tool'u sırayla test eder.
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def main():
    # MCP server'ı child process olarak başlat
    server_params = StdioServerParameters(
        command=sys.executable,  # aynı venv'deki python
        args=["-m", "mcp_server.server"],
        cwd=os.path.dirname(os.path.abspath(__file__)),
        env={
            **os.environ,  # mevcut env var'ları aktar (OPENAI_API_KEY vs.)
        }
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # Tool listesini göster
            tools = await session.list_tools()
            print("=" * 60)
            print("EcoWings MCP Server - Available Tools:")
            print("=" * 60)
            for tool in tools.tools:
                print(f"  - {tool.name}: {tool.description[:80]}...")
            print()

            # Test 1: ask_faq
            print("-" * 60)
            print("TEST 1: ask_faq")
            print("-" * 60)
            result = await session.call_tool("ask_faq", {
                "question": "What is the baggage allowance?"
            })
            print(f"Answer: {result.content[0].text}")
            print()

            # Test 2: search_flights
            print("-" * 60)
            print("TEST 2: search_flights")
            print("-" * 60)
            result = await session.call_tool("search_flights", {
                "origin": "Istanbul",
                "destination": "Paris",
                "date": "2025-06-01",
                "passengers": 2
            })
            print(f"Result: {result.content[0].text}")
            print()

            # Test 3: create_travel_plan (uzun sürebilir ~60s)
            print("-" * 60)
            print("TEST 3: create_travel_plan (bu 1-2 dk sürebilir)")
            print("-" * 60)
            result = await session.call_tool("create_travel_plan", {
                "origin": "Istanbul",
                "destination": "Paris",
                "start_date": "2025-06-01",
                "end_date": "2025-06-08",
                "passengers": 2,
                "budget": "moderate"
            })
            print(f"Result: {result.content[0].text[:500]}...")
            print()

            print("=" * 60)
            print("ALL TESTS COMPLETED")
            print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
```

---

## 10. Implementation Adımları

| Adım | Dosya | Yapılacak İş |
|------|-------|-------------|
| 1 | `requirements.txt` | `mcp[cli]>=1.0.0` ekle |
| 2 | Terminal | `pip install "mcp[cli]"` çalıştır (venv aktifken) |
| 3 | `mcp_server/__init__.py` | Boş dosya oluştur |
| 4 | `mcp_server/server.py` | FastMCP ile 3 tool tanımla (Section 7.2) |
| 5 | `mcp_client_test.py` | Test client scripti oluştur (Section 9) |
| 6 | Test | `python mcp_client_test.py` çalıştır — 3 tool çıktısını gör |
| 7 | Claude Desktop | Config'e ecowings ekle (Section 8) → restart → test |
| 8 | Git | `git commit -m "feat: add MCP server for EcoWings tools"` → push |

---

## 11. Ajana Kritik Talimatlar

Bu talimatlar çok önemli — bunlara uyulmazsa çalışmaz:

1. **`mcp.run()` çağrısına HİÇ parametre verme.** `transport`, `host`, `port` argümanı geçme. Düz `mcp.run()` yaz. Stdio otomatik kullanılır.

2. **Import'ları dosyadan oku.** `server.py`'deki tool fonksiyonları mevcut projedeki sınıfları kullanacak. Her tool için ilgili dosyayı aç ve şunları kontrol et:
   - `tools/flight_search.py` → `FlightSearchTool` sınıfının `_run` metodunun parametre isimleri
   - `rag/retriever.py` ve `rag/pdf_loader.py` → RAG pipeline'ının nasıl çalıştığı
   - `graph/orchestrator.py` → `run_travel_graph()` fonksiyonunun imzası ve return tipi
   - `main.py` → `/chat` ve `/plan` endpoint'lerindeki mevcut kullanım

3. **`sys.path.insert` satırını koyma.** `server.py` dosyasının başına `sys.path.insert(0, ...)` koy — yoksa `from tools.flight_search import ...` çalışmaz.

4. **`load_dotenv()` çağır.** `server.py` başında `from dotenv import load_dotenv; load_dotenv()` olsun.

5. **Mevcut dosyaları DEĞİŞTİRME.** Sadece yeni dosyalar oluştur.

6. **`ask_faq` tool'u için mevcut `/chat` endpoint implementasyonunu kopyala.** `main.py`'deki `/chat` handler ne yapıyorsa aynısını yap — kendi RAG pipeline'ını icat etme.

---

## 12. Başarı Kriterleri

- [ ] `python mcp_client_test.py` hatasız çalışıyor, 3 tool'un çıktısı terminalde görünüyor
- [ ] Claude Desktop'ta ecowings server'ı yeşil nokta ile görünüyor
- [ ] Claude Desktop'tan "EcoWings'in bagaj politikası nedir?" sorusuna `ask_faq` tool'u çağrılıp cevap geliyor
- [ ] Mevcut `uvicorn main:app` hâlâ hatasız çalışıyor — hiçbir şey bozulmamış
- [ ] Kod Git'e push edilmiş

---

## 13. Test Komutları

```bash
# venv aktifken:

# Test 1: Python client ile
python mcp_client_test.py

# Test 2: Claude Desktop ile (config eklendikten sonra)
# Yeni chat → "EcoWings'in bagaj politikası nedir?"
# Claude sol altta 🔧 ile ask_faq çağırır
```
