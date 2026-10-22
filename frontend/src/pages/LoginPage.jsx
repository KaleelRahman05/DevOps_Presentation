import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, KeyRound, Mail, AlertCircle, ArrowLeft, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('admin@cinescope.com');
  const [password, setPassword] = useState('Admin@12345');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '460px',
        margin: '60px auto',
        padding: '0 20px',
      }}
    >
      <Link
        to="/"
        className="btn-secondary"
        style={{
          display: 'inline-flex',
          marginBottom: '24px',
          padding: '8px 14px',
          fontSize: '0.85rem',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Discover</span>
      </Link>

      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 28px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(229, 9, 20, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-red)',
              marginBottom: '12px',
            }}
          >
            <Shield size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Sign in to manage CineScope catalog and moderate reviews
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div
          style={{
            background: 'rgba(245, 197, 24, 0.08)',
            border: '1px solid rgba(245, 197, 24, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            marginBottom: '20px',
            display: 'flex',
            gap: '8px',
          }}
        >
          <Info size={18} color="#f5c518" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--accent-gold)' }}>Academic Evaluation Credentials:</strong>
            <div>Email: <code style={{ color: '#fff' }}>admin@cinescope.com</code></div>
            <div>Password: <code style={{ color: '#fff' }}>Admin@12345</code></div>
          </div>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-email"
                type="email"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cinescope.com"
                required
              />
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type="password"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <KeyRound
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '12px' }}
          >
            <span>{submitting ? 'Verifying Credentials...' : 'Sign In as Administrator'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
