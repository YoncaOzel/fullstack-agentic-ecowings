import { useState } from "react";
import "./index.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SearchForm from "./components/SearchForm";
import ResultsSection from "./components/ResultsSection";
import Footer from "./components/Footer";
import { searchFlights, MOCK_FLIGHTS } from "./services/flightApi";

const USE_MOCK = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL === "https://your-backend.com";

const initialState = {
  tripType: "round-trip",
  flyingFrom: "",
  flyingTo: "",
  departureDate: null,
  returnDate: null,
  travelerCount: 1,
  cabinClass: "Economy",
  directOnly: false,
  isLoading: false,
  flights: [],
  error: null,
  sortBy: "recommended",
  formError: null,
};

export default function App() {
  const [state, setState] = useState(initialState);

  const update = (patch) => setState((prev) => ({ ...prev, ...patch }));

  function handleSwap() {
    update({ flyingFrom: state.flyingTo, flyingTo: state.flyingFrom });
  }

  function validate() {
    if (!state.flyingFrom.trim()) return "Please enter a departure city.";
    if (!state.flyingTo.trim()) return "Please enter a destination city.";
    if (!state.departureDate) return "Please select a departure date.";
    if (state.tripType === "round-trip" && !state.returnDate)
      return "Please select a return date for your round trip.";
    return null;
  }

  async function handleSearch() {
    const validationError = validate();
    if (validationError) {
      update({ formError: validationError });
      return;
    }

    update({ isLoading: true, error: null, formError: null, flights: [] });

    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 1200));
      let results = MOCK_FLIGHTS;
      if (state.directOnly) results = results.filter((f) => f.outbound.stops === 0);
      update({ flights: results, isLoading: false });
      return;
    }

    try {
      const payload = {
        from: state.flyingFrom,
        to: state.flyingTo,
        departure: state.departureDate
          ? state.departureDate.toISOString().split("T")[0]
          : null,
        return: state.returnDate
          ? state.returnDate.toISOString().split("T")[0]
          : null,
        tripType: state.tripType,
        travelerCount: state.travelerCount,
        cabinClass: state.cabinClass,
        directOnly: state.directOnly,
      };
      const data = await searchFlights(payload);
      let results = data.flights || [];
      if (state.directOnly) results = results.filter((f) => f.outbound.stops === 0);
      update({ flights: results, isLoading: false });
    } catch (err) {
      update({
        isLoading: false,
        error: "Could not connect to the server. Please try again.",
      });
    }
  }

  function handleRefresh() {
    update({ flights: [], error: null, sortBy: "recommended" });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Hero />
        <SearchForm
          state={state}
          onTripTypeChange={(v) => update({ tripType: v, returnDate: null })}
          onFromChange={(v) => update({ flyingFrom: v })}
          onToChange={(v) => update({ flyingTo: v })}
          onSwap={handleSwap}
          onDepartureChange={(d) => update({ departureDate: d })}
          onReturnChange={(d) => update({ returnDate: d })}
          onTravelerChange={(v) => update({ travelerCount: v })}
          onCabinChange={(v) => update({ cabinClass: v })}
          onDirectOnlyChange={(v) => update({ directOnly: v })}
          onSearch={handleSearch}
          error={state.formError}
        />
        <ResultsSection
          flights={state.flights}
          isLoading={state.isLoading}
          error={state.error}
          sortBy={state.sortBy}
          onSortChange={(v) => update({ sortBy: v })}
          onRefresh={handleRefresh}
          tripType={state.tripType}
        />
      </main>
      <Footer />
    </div>
  );
}
