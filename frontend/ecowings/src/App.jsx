import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './shared/components/Navbar';
import Footer from './shared/components/Footer';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminProtectedRoute from './shared/components/AdminProtectedRoute';
import AdminDashboardPage from './domains/admin/pages/AdminDashboardPage';
import AdminLoginPage from './domains/admin/pages/AdminLoginPage';

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


function AppInner() {
  const location = useLocation();
  const isAuthRoute =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
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
          <Route path="/forgot-password" element={<AuthPage />} />
          <Route path="/reset-password" element={<AuthPage />} />

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
      {!isAuthRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin login — korumasız */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        {/* Admin dashboard — kendi layout'u var, Navbar/Footer yok */}
        <Route path="/admin" element={
          <AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>
        } />
        {/* Ana uygulama */}
        <Route path="/*" element={<AppInner />} />
      </Routes>
    </BrowserRouter>
  );
}
