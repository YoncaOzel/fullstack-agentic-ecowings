import os
import sys
import asyncio
import contextlib
import threading

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("EcoWings")
_STDOUT_LOCK = threading.RLock()


class _NullWriter:
    encoding = "utf-8"

    def write(self, text):
        return len(text)

    def flush(self):
        return None

    def isatty(self):
        return False


_STDOUT_SINK = _NullWriter()


@contextlib.contextmanager
def _suppress_stdout():
    """Keep MCP stdio stdout reserved for JSON-RPC messages."""
    with _STDOUT_LOCK:
        with contextlib.redirect_stdout(_STDOUT_SINK):
            yield


def _unwrap_crewai_streams():
    crewai_llm = sys.modules.get("crewai.llm")
    filtered_stream = getattr(crewai_llm, "FilteredStream", None)
    if filtered_stream is None:
        return

    for stream_name in ("stdout", "stderr"):
        stream = getattr(sys, stream_name)
        if isinstance(stream, filtered_stream):
            setattr(sys, stream_name, stream._original_stream)


@mcp.tool()
def search_flights(origin: str, destination: str, date: str, passengers: int) -> str:
    """Search for available flights on EcoWings airline system.

    Args:
        origin: Departure city or airport code (e.g. Istanbul, IST)
        destination: Arrival city or airport code (e.g. Paris, CDG)
        date: Flight date in YYYY-MM-DD format
        passengers: Number of passengers
    """
    from tools.flight_search import FlightSearchTool

    tool = FlightSearchTool()
    return tool._run(
        origin=origin,
        destination=destination,
        departure_date=date,
        adults=passengers,
    )


@mcp.tool()
def ask_faq(question: str) -> str:
    """Answer questions about EcoWings airline services using the FAQ knowledge base.
    Covers baggage allowance, check-in, refunds, loyalty program, flight changes, etc.

    Args:
        question: The question to ask about EcoWings services
    """
    from rag.retriever import retrieve_faq_context
    from openai import OpenAI

    with _suppress_stdout():
        context = retrieve_faq_context(question, top_k=3)
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are EcoWings' virtual assistant. "
                    "Answer based on the provided context only. "
                    "If the answer is not in the context, say you don't have that information. "
                    "Always reply in English."
                ),
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}",
            },
        ],
        temperature=0.3,
        max_tokens=500,
    )
    return resp.choices[0].message.content.strip()


@mcp.tool()
def create_travel_plan(
    origin: str,
    destination: str,
    start_date: str,
    end_date: str,
    passengers: int,
    budget: str = "moderate",
) -> str:
    """Create a complete travel plan using the EcoWings AI pipeline (LangGraph + CrewAI).
    Searches flights, recommends hotels, and generates a day-by-day itinerary.

    Args:
        origin: Departure city
        destination: Arrival city
        start_date: Trip start date in YYYY-MM-DD format
        end_date: Trip end date in YYYY-MM-DD format
        passengers: Number of travelers
        budget: Budget level — low, moderate, or high (default: moderate)
    """
    from graph.orchestrator import run_travel_graph
    from types import SimpleNamespace

    req = SimpleNamespace(
        origin=origin,
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        passengers=passengers,
        budget=budget,
    )

    # run_travel_graph is async; FastMCP already runs an event loop so
    # asyncio.run() would fail. Run it in a fresh thread instead.
    import concurrent.futures
    try:
        with _suppress_stdout():
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                future = pool.submit(lambda: asyncio.run(run_travel_graph(req)))
                plan_text, pdf_id = future.result(timeout=300)
    finally:
        _unwrap_crewai_streams()
    return f"PDF ID: {pdf_id}\n\n{plan_text}"


if __name__ == "__main__":
    # Pre-load vector store before MCP takes over stdout for protocol.
    # pdf_loader's print() calls must happen here, not inside a tool handler,
    # otherwise they corrupt the stdio JSON-RPC stream.
    try:
        from rag.pdf_loader import get_vector_store
        with _suppress_stdout():
            get_vector_store()
    except Exception as e:
        import sys
        print(f"[EcoWings MCP] Warning: vector store preload failed: {e}", file=sys.stderr)
    mcp.run()
