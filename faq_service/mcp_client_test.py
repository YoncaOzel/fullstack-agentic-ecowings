"""
EcoWings MCP Server Test Client

MCP server'ı stdio üzerinden başlatır ve 3 tool'u sırayla test eder.
Çalıştırmak için (venv aktifken):
    python mcp_client_test.py
"""
import asyncio
import os
import subprocess
import sys


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VENV_PYTHON = os.path.join(BASE_DIR, "venv", "Scripts", "python.exe")


def _restart_inside_venv() -> None:
    if not os.path.exists(VENV_PYTHON):
        return

    current = os.path.normcase(os.path.abspath(sys.executable))
    expected = os.path.normcase(os.path.abspath(VENV_PYTHON))
    if current == expected:
        return

    env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
    completed = subprocess.run([VENV_PYTHON, __file__, *sys.argv[1:]], env=env)
    sys.exit(completed.returncode)


_restart_inside_venv()

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def main():
    server_params = StdioServerParameters(
        command=sys.executable,
        args=["-m", "mcp_server.server"],
        cwd=BASE_DIR,
        env={**os.environ, "PYTHONIOENCODING": "utf-8"},
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            tools = await session.list_tools()
            print("=" * 60)
            print("EcoWings MCP Server — Available Tools:")
            print("=" * 60)
            for tool in tools.tools:
                print(f"  - {tool.name}: {tool.description.splitlines()[0]}")
            print()

            # Test 1: ask_faq
            print("-" * 60)
            print("TEST 1: ask_faq")
            print("-" * 60)
            result = await session.call_tool("ask_faq", {
                "question": "What is the baggage allowance?",
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
                "passengers": 2,
            })
            print(f"Result: {result.content[0].text}")
            print()

            # Test 3: create_travel_plan (~60s sürebilir)
            print("-" * 60)
            print("TEST 3: create_travel_plan  (1-2 dk sürebilir)")
            print("-" * 60)
            result = await session.call_tool("create_travel_plan", {
                "origin": "Istanbul",
                "destination": "Paris",
                "start_date": "2025-06-01",
                "end_date": "2025-06-08",
                "passengers": 2,
                "budget": "moderate",
            })
            print(f"Result (ilk 500 karakter):\n{result.content[0].text[:500]}...")
            print()

            print("=" * 60)
            print("ALL TESTS COMPLETED")
            print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
