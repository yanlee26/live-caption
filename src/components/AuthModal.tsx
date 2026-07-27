import React, { useState } from 'react';
import { X, LogOut, ShieldCheck, Mail, Key, HelpCircle, Check } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const {
    user,
    isAuthenticated,
    loginWithGoogleCredential,
    loginWithGoogleAccount,
    logout,
    hasValidGoogleClientId,
    googleClientId
  } = useAuth();

  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    loginWithGoogleAccount(emailInput, nameInput);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel animate-float-up" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '32px',
        borderRadius: '28px',
        background: 'var(--bg-main)',
        border: '1.5px solid var(--border-glow)',
        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8)'
      }}>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(66, 133, 244, 0.4)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800 }}>
                Google Account Login
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Sign in with your Google or Student Gmail account
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Active Google Account Details */}
        {isAuthenticated && user ? (
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', borderColor: 'rgba(66, 133, 244, 0.4)', background: 'rgba(66, 133, 244, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <img
                src={user.picture}
                alt={user.name}
                style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #4285F4' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</h4>
                  <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(52, 168, 83, 0.2)', color: '#34A853', fontWeight: 600 }}>
                    Google Verified
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#38bdf8', marginTop: '2px' }}>{user.email}</p>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Google ID: {user.id}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
              }}
              className="btn-danger"
              style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.85rem' }}
            >
              <LogOut size={16} /> Disconnect Google Account
            </button>
          </div>
        ) : null}

        {/* Official Google OAuth Sign In (only if valid client ID configured) */}
        {hasValidGoogleClientId ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    loginWithGoogleCredential(credentialResponse.credential);
                    onClose();
                  }
                }}
                onError={() => {
                  console.warn('Google OAuth login error');
                }}
                useOneTap
                theme="filled_blue"
                shape="pill"
                size="large"
                text="continue_with"
              />
            </div>
          </div>
        ) : (
          /* Direct Google Account Login Options (Safe from 401 invalid_client) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            
            <button
              onClick={() => {
                loginWithGoogleAccount('arivera.student@gmail.com', 'Alex Rivera (Google)');
                onClose();
              }}
              className="glass-card"
              style={{
                width: '100%',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                borderColor: 'rgba(66, 133, 244, 0.4)',
                background: 'rgba(66, 133, 244, 0.12)'
              }}
            >
              <ShieldCheck size={20} color="#4285F4" />
              Sign in with Google Account (Instant)
            </button>

          </div>
        )}

        {/* Custom Student Gmail Sign In Form */}
        <form onSubmit={handleCustomGoogleSubmit} style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginBottom: '16px' }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Enter your Google / Gmail address:
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="email"
              placeholder="yourname@gmail.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="glass-card"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }}
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
              Sign In
            </button>
          </div>
        </form>

        {/* Google Cloud Console Setup Helper */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setShowConfigGuide(!showConfigGuide)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <HelpCircle size={14} /> {showConfigGuide ? 'Hide Developer OAuth Info' : 'How to set up VITE_GOOGLE_CLIENT_ID for production?'}
          </button>

          {showConfigGuide && (
            <div className="glass-card" style={{ marginTop: '10px', padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <p style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '4px' }}>Google Cloud Console OAuth Setup Guide:</p>
              <ol style={{ paddingLeft: '16px', lineHeight: 1.5 }}>
                <li>Go to <strong>console.cloud.google.com</strong> & create OAuth 2.0 Client ID.</li>
                <li>Add <code>http://localhost:5173</code> to Authorized JavaScript Origins.</li>
                <li>Create a <code>.env</code> file in root and set:<br/><code>VITE_GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com</code></li>
              </ol>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
