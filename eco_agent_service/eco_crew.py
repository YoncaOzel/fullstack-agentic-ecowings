import os
import json
import requests
from textwrap import dedent
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
from crewai.tools import tool

load_dotenv()

llm_model = "groq/llama-3.3-70b-versatile"

@tool("Route and Distance Calculator")
def calculate_route(origin_city: str, destination_city: str) -> str:
    """Useful to find if a land/ferry route exists between two cities and get the distance in km."""
    try:
        headers = {"User-Agent": "EcoWings-AgentService/1.0"}
        res_orig = requests.get(f"https://nominatim.openstreetmap.org/search?q={origin_city}&format=json&limit=1", headers=headers).json()
        res_dest = requests.get(f"https://nominatim.openstreetmap.org/search?q={destination_city}&format=json&limit=1", headers=headers).json()
        
        if not res_orig or not res_dest:
            return "ERROR: Coordinates not found. INSTRUCTION: You MUST return Mode='There is no reasonable alternative way' and Emission=0."

        lon1, lat1 = res_orig[0]['lon'], res_orig[0]['lat']
        lon2, lat2 = res_dest[0]['lon'], res_dest[0]['lat']

        osrm_url = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false&steps=true"
        osrm_res = requests.get(osrm_url).json()

        if osrm_res.get('code') != 'Ok':
            return "ERROR: Ocean/Sea barrier with no land/ferry route. INSTRUCTION: You MUST return Mode='There is no reasonable alternative way' and Emission=0."

        route = osrm_res['routes'][0]
        distance_km = route['distance'] / 1000.0
        
        # 🚀 OPTİMİZASYON 1: Mesafe 2500km'den fazlaysa, bu mantıklı bir kara/deniz alternatifi DEĞİLDİR. (Örn: Türkiye - Amerika arası)
        if distance_km > 2500:
            return f"EXTREME DISTANCE ({distance_km:.2f} km). This is too far to be a reasonable land/sea alternative. STRICT INSTRUCTION: You MUST return Mode='There is no reasonable alternative way' and Emission=0."

        has_ferry = any(
            step.get('mode') == 'ferry' 
            for leg in route.get('legs', []) 
            for step in leg.get('steps', [])
        )

        if has_ferry:
            return f"FERRY DETECTED! Distance: {distance_km:.2f} km. STRICT INSTRUCTION: You MUST set mode to 'Ferry'. Calculate emission for a passenger ferry. Do NOT use Shared Car, Bus, or Train."

        return f"STANDARD ROUTE. Distance: {distance_km:.2f} km. INSTRUCTION: Evaluate transport infrastructure. If and ONLY IF an active passenger railway realistically connects '{origin_city}' and '{destination_city}', you may choose 'Train'. Otherwise, you MUST strictly default to 'Bus'."
    except Exception as e:
        return f"ERROR occurred: {str(e)}. INSTRUCTION: You MUST return Mode='There is no reasonable alternative way' and Emission=0."


class EcoAlternativeCrew:
    def __init__(self, origin: str, destination: str):
        self.origin = origin
        self.destination = destination

    def run(self):
        researcher = Agent(
            role='Route and Geography Specialist',
            goal=f'Analyze the physical land route from {self.origin} to {self.destination}.',
            backstory="You strictly execute the tools and pass the EXACT INSTRUCTIONS returned by the tool to the Evaluator.",
            verbose=True,
            allow_delegation=False,
            tools=[calculate_route],
            llm=llm_model
        )

        evaluator = Agent(
            role='Carbon Emission Analyst',
            goal='Calculate the carbon footprint based strictly on tool instructions.',
            backstory=dedent(f"""
                You are an obedient calculator.
                CRITICAL RULE: If the Researcher's instruction contains 'There is no reasonable alternative way', YOU MUST STOP ALL LOGIC. 
                Do not suggest Ferry, Car, Train, or Bus. You MUST exactly set mode to 'There is no reasonable alternative way' and emission to 0.
                
                Only if a standard route is found: When choosing between Train or Bus, remember that cities like Antalya DO NOT have train stations. Default to 'Bus' if unsure.
            """),
            verbose=True,
            allow_delegation=False,
            llm=llm_model
        )

        validator = Agent(
            role='JSON Output Formatter',
            goal='Ensure output is ONLY valid JSON and logically sound.',
            backstory=dedent(f"""
                You are a strict JSON bot and a final reality checker.
                1. If the Evaluator selected 'Train' for a city without railways (like Antalya), override to 'Bus' and recalculate.
                2. ABSOLUTE CRITICAL RULE: If the mode is 'Flight', 'Plane', 'Ferry and Car', 'Car and Ferry', or if the text mentions 'There is no reasonable alternative way', YOU MUST OVERRIDE EVERYTHING and output EXACTLY: {{"mode": "There is no reasonable alternative way", "emissionKg": 0}}
                3. Your FINAL output MUST be ONLY a raw JSON string. No markdown, no conversational text.
            """),
            verbose=True,
            allow_delegation=False,
            llm=llm_model
        )

        task1 = Task(
            description=f'Find route distance and instructions from {self.origin} to {self.destination} using the Route Calculator tool.',
            expected_output="The exact distance and the STRICT INSTRUCTION on which vehicle to use.",
            agent=researcher
        )

        task2 = Task(
            description=f'Read the instruction from Task 1. If it says no reasonable alternative, output exactly that. Otherwise, calculate emission for {self.origin} to {self.destination} based on the vehicle mode.',
            expected_output="Chosen transport mode and calculated total emission in Kg. Or 'There is no reasonable alternative way' with 0 Kg.",
            agent=evaluator
        )

        task3 = Task(
            description="Format the result from Task 2 into raw JSON. ENFORCE THE CRITICAL RULE to block flights or unreasonable combined routes.",
            expected_output='{"mode": "Bus", "emissionKg": 45.2} OR {"mode": "There is no reasonable alternative way", "emissionKg": 0}',
            agent=validator
        )

        crew = Crew(
            agents=[researcher, evaluator, validator],
            tasks=[task1, task2, task3],
            process=Process.sequential
        )

        result = crew.kickoff()
        return str(result)