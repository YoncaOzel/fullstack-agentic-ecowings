import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './shared/components/Navbar';
import Footer from './shared/components/Footer';
import ProtectedRoute from './shared/components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AuthPage from './domains/auth/pages/AuthPage';
import FlightsPage from './domains/flights/pages/FlightsPage';
import FlightTrackerPage from './domains/flights/pages/FlightTrackerPage';
import LuckyFlightPage from './domains/flights/pages/LuckyFlightPage';
import CampaignsPage from './domains/coupons/pages/CampaignsPage';
import CommentsPage from './domains/reviews/pages/CommentsPage';
import ProfileSettingsPage from './domains/user/pages/ProfileSettingsPage';
import GiftTicketPage from './domains/tickets/pages/GiftTicketPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/flights" element={<FlightsPage />} />
            <Route path="/flight-tracker" element={<FlightTrackerPage />} />
            <Route path="/lucky-flight" element={<LuckyFlightPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/comments" element={<CommentsPage />} />

            {/* Protected */}
            <Route path="/profile" element={
              <ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>
            } />
            <Route path="/gift-ticket" element={
              <ProtectedRoute><GiftTicketPage /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

