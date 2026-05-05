import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import ResetPasswordForm from '../components/ResetPasswordForm';

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const view =
    location.pathname === '/login' ? 'login'
    : location.pathname === '/signup' ? 'signup'
    : location.pathname === '/forgot-password' ? 'forgot'
    : 'reset';

  const isLogin = view === 'login';

  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = async (credentials) => {
    setLoginLoading(true);
    try {
      const result = await login(credentials);
      if (result.success) {
        navigate('/');
        return { success: true };
      }
      return result;
    } catch {
      return { success: false, message: 'Something went wrong. Please try again.' };
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (formData) => {
    setSignupLoading(true);
    try {
      const result = await register(formData);
      if (result?.succeeded) {
        navigate('/login');
        return { succeeded: true };
      }
      return result;
    } catch (err) {
      return {
        succeeded: false,
        message: err.response?.data?.message || 'Something went wrong. Please try again.',
        errors: err.response?.data?.errors || [],
      };
    } finally {
      setSignupLoading(false);
    }
  };

  const leftContent = () => {
    if (view === 'forgot' || view === 'reset') {
      return (
        <>
          <span className="auth-eyebrow"><span className="auth-eyebrow-dot" /> Account Security</span>
          <h1 className="auth-left-h1">
            {view === 'forgot' ? <>Reset your <em>password.</em></> : <>Choose a new <em>password.</em></>}
          </h1>
          <p className="auth-left-lede">
            {view === 'forgot'
              ? "We'll send a secure link to your email address. Follow the instructions to reset your password and get back to your green journey."
              : "Create a strong, unique password to keep your EcoWings account safe. You'll be signed in automatically after resetting."}
          </p>
          <div className="auth-perks">
            <div className="auth-perk">
              <div className="auth-perk-ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <div className="auth-perk-title">Secure token</div>
                <div className="auth-perk-sub">Reset links expire in 60 minutes and can only be used once.</div>
              </div>
            </div>
            <div className="auth-perk">
              <div className="auth-perk-ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>
              <div>
                <div className="auth-perk-title">Email verification</div>
                <div className="auth-perk-sub">Only the registered email address receives the reset link.</div>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (isLogin) {
      return (
        <>
          <span className="auth-eyebrow"><span className="auth-eyebrow-dot" /> Sustainable Aviation</span>
          <h1 className="auth-left-h1">Welcome <em>back.</em><br />Your green journey continues.</h1>
          <p className="auth-left-lede">
            Sign in to pick up where you left off — saved searches, eco-routed itineraries,
            and your travel impact in one calm place.
          </p>
          <div className="auth-testimonial">
            <p className="auth-testimonial-quote">
              "Honest carbon math, no upsell labyrinth, and a booking flow that actually feels
              considered. EcoWings is how I fly now."
            </p>
            <div className="auth-testimonial-who">
              <div className="auth-avatar">EM</div>
              <div>
                <div className="auth-who-name">Elif Mertoğlu</div>
                <div className="auth-who-role">Frequent flyer · Member since 2024</div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <span className="auth-eyebrow"><span className="auth-eyebrow-dot" /> Join EcoWings</span>
        <h1 className="auth-left-h1">Start your <em>greener</em> way to fly.</h1>
        <p className="auth-left-lede">
          Create a free account and unlock smarter routing, an honest impact dashboard,
          and a calmer booking flow that respects your time — and the planet.
        </p>
        <div className="auth-perks">
          <div className="auth-perk">
            <div className="auth-perk-ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20C5 20 3 15 3 12c0-3 2-7 8-9 0 6 3 8 6 9-1 5-3 8-6 8Z" />
              </svg>
            </div>
            <div>
              <div className="auth-perk-title">Eco-routed by default</div>
              <div className="auth-perk-sub">Lower-impact flights surface first — no toggling required.</div>
            </div>
          </div>
          <div className="auth-perk">
            <div className="auth-perk-ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h6l3-7 3 14 3-7h3" />
              </svg>
            </div>
            <div>
              <div className="auth-perk-title">Personal impact dashboard</div>
              <div className="auth-perk-sub">Track CO₂, distance, and trips saved across every booking.</div>
            </div>
          </div>
          <div className="auth-perk">
            <div className="auth-perk-ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3 4 6v6c0 5 3 8 8 9 5-1 8-4 8-9V6l-8-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="auth-perk-title">No greenwashing, ever</div>
              <div className="auth-perk-sub">Sourced figures, dated estimates, audited methodology.</div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const rightTopContent = () => {
    if (view === 'forgot' || view === 'reset') {
      return (
        <>
          <span>Remember your password?</span>
          <Link to="/login" className="auth-pill-btn">Sign in</Link>
        </>
      );
    }
    return (
      <>
        <span>{isLogin ? 'New to EcoWings?' : 'Already have an account?'}</span>
        <Link to={isLogin ? '/signup' : '/login'} className="auth-pill-btn">
          {isLogin ? 'Create account' : 'Sign in'}
        </Link>
      </>
    );
  };

  const footContent = () => {
    if (view === 'forgot' || view === 'reset') return <div>© 2026 EcoWings</div>;
    if (isLogin) {
      return (
        <div className="auth-left-foot-stats">
          <div><b>120<em>+</em></b><span>Eco routes</span></div>
          <div><b>48<em>k</em></b><span>Travelers</span></div>
          <div><b>9</b><span>Partners</span></div>
        </div>
      );
    }
    return <div>Free forever · No card required</div>;
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
          {leftContent()}
        </div>

        <div className="auth-left-foot">
          {footContent()}
          <div>© 2026 EcoWings</div>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <section className="auth-right">
        <div className="auth-right-top">
          {rightTopContent()}
        </div>

        <div className="auth-form-wrap">
          {view === 'login' && <LoginForm onSubmit={handleLogin} loading={loginLoading} />}
          {view === 'signup' && <SignupForm onSubmit={handleSignup} loading={signupLoading} />}
          {view === 'forgot' && <ForgotPasswordForm />}
          {view === 'reset' && <ResetPasswordForm />}
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
