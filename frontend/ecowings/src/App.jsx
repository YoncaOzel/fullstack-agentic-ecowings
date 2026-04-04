import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
import FAQPage from './pages/FAQPage';
import TravelPlannerPage from './pages/TravelPlannerPage';
import CheckoutPage from './domains/flights/pages/CheckoutPage';
import PaymentSuccessPage from './domains/payments/pages/PaymentSuccessPage';
import PaymentFailPage from './domains/payments/pages/PaymentFailPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/travel-planner" element={<TravelPlannerPage />} />

            {/* Protected */}
            <Route path="/profile" element={
              <ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute><CheckoutPage /></ProtectedRoute>
            } />
            <Route path="/gift-ticket" element={
              <ProtectedRoute><GiftTicketPage /></ProtectedRoute>
            } />

            {/* Payment result pages — public so Stripe redirect always works */}
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-fail" element={<PaymentFailPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

