import os
from crewai import Agent, Task, Crew, Process
from tools.flight_search import FlightSearchTool
from tools.pdf_generator import generate_pdf

try:
    from crewai_tools import SerperDevTool
    search_tool = SerperDevTool() if os.getenv("SERPER_API_KEY") else None
except ImportError:
    search_tool = None


def run_travel_crew(
    origin: str,
    destination: str,
    start_date: str,
    end_date: str,
    passengers: int,
    budget: str,
    pdf_output_path: str,
) -> str:
    budget_info = budget if budget else "No specific budget constraint"
    flight_search_tool = FlightSearchTool()

    # --- Agent 1: Flight Research Specialist ---
    flight_researcher = Agent(
        role="Flight Research Specialist",
        goal="Find the best flight options for the given trip, using the EcoWings Flight Search tool first.",
        backstory=(
            "You are an expert travel agent. You always start by calling the EcoWings Flight Search tool "
            "to find real available flights. If the tool returns results, you present those. "
            "If the tool is unavailable or returns no results, you provide realistic estimates "
            "based on your knowledge of typical routes and prices."
        ),
        tools=[flight_search_tool] + ([search_tool] if search_tool else []),
        llm="gpt-4o-mini",
        verbose=False,
    )

    flight_task = Task(
        description=f"""Search for flights for this trip.

Trip details:
- Origin: {origin}
- Destination: {destination}
- Departure date: {start_date}
- Return date: {end_date}
- Passengers: {passengers}
- Budget: {budget_info}

STEP 1 — Call the EcoWings Flight Search tool with:
- origin: IATA code for {origin} (e.g. Istanbul=IST, Paris=CDG, London=LHR, New York=JFK, Berlin=BER, Rome=FCO, Barcelona=BCN, Amsterdam=AMS, Dubai=DXB, Tokyo=NRT)
- destination: IATA code for {destination}
- departure_date: {start_date}
- return_date: {end_date}
- adults: {passengers}

STEP 2 — Present the results:
- If the tool returns real flights: present the top 2-3 options with carrier, flight number, departure time, arrival time, duration, and price.
- If the tool returns no results or is unavailable: provide 2-3 realistic estimated flight options based on typical routes between {origin} and {destination}, clearly noting these are estimates.""",
        expected_output=f"2-3 flight options with carrier, flight number, times, duration, and price. Either real data from EcoWings or clearly labeled estimates.",
        agent=flight_researcher,
    )

    # --- Agent 2: Hotel & Accommodation Specialist ---
    hotel_researcher = Agent(
        role="Hotel & Accommodation Specialist",
        goal="Find suitable hotels in the destination city",
        backstory=(
            "You are a hospitality expert who knows the best places to stay in any city. "
            "You consider location, price, and guest comfort to suggest the most suitable options."
        ),
        tools=[search_tool] if search_tool else [],
        llm="gpt-4o-mini",
        verbose=False,
    )

    hotel_task = Task(
        description=f"""Research accommodation options in {destination} for this trip.

Trip details:
- Destination: {destination}
- Check-in: {start_date}
- Check-out: {end_date}
- Guests: {passengers}
- Budget: {budget_info}

Provide 2-3 hotel recommendations. For each include:
hotel name, neighborhood/district, estimated price per night, key amenities, and why it suits this trip.

If you cannot access real-time data, provide realistic recommendations based on your knowledge of the destination.""",
        expected_output="2-3 hotel options with name, location, price per night, and amenities.",
        agent=hotel_researcher,
    )

    # --- Agent 3: Travel Itinerary Planner ---
    itinerary_planner = Agent(
        role="Travel Itinerary Planner",
        goal="Create a complete day-by-day travel plan combining flights, hotels, and activities",
        backstory=(
            "You are a creative travel planner who crafts unforgettable itineraries. "
            "You combine transportation, accommodation, and must-see attractions "
            "into a seamless, practical travel experience."
        ),
        tools=[],
        llm="gpt-4o-mini",
        verbose=False,
    )

    itinerary_task = Task(
        description=f"""Create a complete day-by-day travel plan using the flight and hotel research already provided.

Trip details:
- Route: {origin} -> {destination}
- Dates: {start_date} to {end_date}
- Passengers: {passengers}
- Budget: {budget_info}

Structure:
- Day 0 (travel day): departure city, flight details from the research, arrival info
- Day 1 to Day N: for each day provide Morning / Afternoon / Evening with specific activities
- Final day: return journey details

Also include:
- 3-5 must-see attractions with brief descriptions
- 3-5 local food and restaurant recommendations
- 3 practical travel tips
- Cost summary: estimated flights total + hotel total + daily expenses per person = grand total

Format clearly using day headers (## Day 1 - Title) and bullet points.""",
        expected_output="Complete day-by-day itinerary with activities, food, tips, and cost summary.",
        agent=itinerary_planner,
        context=[flight_task, hotel_task],
    )

    # --- Crew ---
    crew = Crew(
        agents=[flight_researcher, hotel_researcher, itinerary_planner],
        tasks=[flight_task, hotel_task, itinerary_task],
        process=Process.sequential,
        verbose=False,
    )

    result = crew.kickoff()
    plan_text = str(result)

    generate_pdf(
        plan_text=plan_text,
        origin=origin,
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        passengers=passengers,
        output_path=pdf_output_path,
    )

    return plan_text
