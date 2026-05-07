import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import LoginForm from '../../auth/components/LoginForm';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

export default function AdminLoginPage() {
  const { login, logout, adminSessionActive, activateAdminSession, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (adminSessionActive) return <Navigate to="/admin" replace />;

  const handleAdminLogin = async (credentials) => {
    setLoading(true);
    try {
      const result = await login(credentials);
      if (result.success) {
        const userRoles = result.roles || [];
        const hasAdminAccess = userRoles.some(r => r === 'Admin' || r === 'SuperAdmin');
        if (!hasAdminAccess) {
          logout();
          return { success: false, message: 'Access denied. Admin privileges required.' };
        }
        activateAdminSession();
        navigate('/admin');
        return { success: true };
      }
      return result;
    } catch {
      return { success: false, message: 'Something went wrong. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ecowings-auth-v2">
      {/* ── LEFT PANEL ── */}
      <aside className="auth-left">
        <div className="auth-grid-lines" />
        <div className="auth-cloud auth-cloud-1" />
        <div className="auth-cloud auth-cloud-2" />

        <Link to="/" className="auth-brand">
          <span className="auth-brand-mark">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5-3 8-7 8-13a8 8 0 1 0-16 0c0 6 3 10 8 13Z" />
              <path d="M12 22V8" />
            </svg>
          </span>
          EcoWings
        </Link>

        <div className="auth-left-body">
          <span className="auth-eyebrow"><span className="auth-eyebrow-dot" /> Admin Portal</span>
          <h1 className="auth-left-h1">Manage <em>with</em><br />care and clarity.</h1>
          <p className="auth-left-lede">
            Access the EcoWings admin portal to oversee flight orders, users,
            routes, and platform analytics — all in one place.
          </p>
          <div className="auth-testimonial">
            <p className="auth-testimonial-quote">
              "The admin dashboard gives us a real-time pulse on bookings and carbon savings.
              Clean data, zero noise."
            </p>
            <div className="auth-testimonial-who">
              <div className="auth-avatar">AY</div>
              <div>
                <div className="auth-who-name">Ayşe Yılmaz</div>
                <div className="auth-who-role">Operations Lead · EcoWings Team</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-left-foot">
          <div className="auth-left-foot-stats">
            <div><b>48<em>k</em></b><span>Active users</span></div>
            <div><b>12<em>k</em></b><span>Total orders</span></div>
            <div><b>4.6<em>M</em></b><span>kg CO₂ saved</span></div>
          </div>
          <div>© 2026 EcoWings</div>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <section className="auth-right">
        <div className="auth-right-top">
          <span>EcoWings Admin Portal</span>
        </div>

        <div className="auth-form-wrap">
          <LoginForm onSubmit={handleAdminLogin} loading={loading} showSignupLink={false} />
        </div>

        <div className="auth-right-foot">
          <div>
            <a href="#">Privacy</a>
            {' · '}
            <a href="#">Terms</a>
            {' · '}
            <a href="#">Help</a>
          </div>
          <div>© 2026 EcoWings</div>
        </div>
      </section>
    </div>
  );
}
