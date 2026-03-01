import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://your-backend.com";

export async function searchFlights(payload) {
  const response = await axios.post(`${API_URL}/api/flights/search`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function bookFlight(flightId) {
  const response = await axios.post(
    `${API_URL}/api/flights/book`,
    { flightId },
    {
      headers: { "Content-Type": "application/json" },
    },
  );
  return response.data;
}

// Mock data — used when backend is not available
export const MOCK_FLIGHTS = [
  {
    id: "FL001",
    outbound: {
      departureTime: "09:15",
      departureDate: "Mar 10",
      departureCode: "IST",
      arrivalTime: "11:45",
      arrivalDate: "Mar 10",
      arrivalCode: "LHR",
      duration: "4h 30m",
      stops: 0,
      stopCodes: [],
    },
    inbound: {
      departureTime: "14:00",
      departureDate: "Mar 20",
      departureCode: "LHR",
      arrivalTime: "18:30",
      arrivalDate: "Mar 20",
      arrivalCode: "IST",
      duration: "4h 30m",
      stops: 0,
      stopCodes: [],
    },
    airline: {
      name: "Lufthansa",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lufthansa_Logo_2018.svg/120px-Lufthansa_Logo_2018.svg.png",
    },
    price: 4200,
    currency: "TL",
    seatsLeft: 5,
    isRecommended: true,
  },
  {
    id: "FL002",
    outbound: {
      departureTime: "13:30",
      departureDate: "Mar 10",
      departureCode: "IST",
      arrivalTime: "18:15",
      arrivalDate: "Mar 10",
      arrivalCode: "LHR",
      duration: "6h 45m",
      stops: 1,
      stopCodes: ["AMS"],
    },
    inbound: {
      departureTime: "08:00",
      departureDate: "Mar 20",
      departureCode: "LHR",
      arrivalTime: "15:00",
      arrivalDate: "Mar 20",
      arrivalCode: "IST",
      duration: "9h 00m",
      stops: 1,
      stopCodes: ["FRA"],
    },
    airline: {
      name: "KLM",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/KLM_logo.svg/120px-KLM_logo.svg.png",
    },
    price: 2950,
    currency: "TL",
    seatsLeft: 12,
    isRecommended: false,
  },
  {
    id: "FL003",
    outbound: {
      departureTime: "21:00",
      departureDate: "Mar 10",
      departureCode: "IST",
      arrivalTime: "23:30",
      arrivalDate: "Mar 10",
      arrivalCode: "LHR",
      duration: "3h 30m",
      stops: 0,
      stopCodes: [],
    },
    inbound: {
      departureTime: "22:00",
      departureDate: "Mar 20",
      departureCode: "LHR",
      arrivalTime: "02:30",
      arrivalDate: "Mar 21",
      arrivalCode: "IST",
      duration: "3h 30m",
      stops: 0,
      stopCodes: [],
    },
    airline: {
      name: "Turkish Airlines",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Turkish_Airlines_logosu_2019_compact.svg/120px-Turkish_Airlines_logosu_2019_compact.svg.png",
    },
    price: 3800,
    currency: "TL",
    seatsLeft: 2,
    isRecommended: false,
  },
];
