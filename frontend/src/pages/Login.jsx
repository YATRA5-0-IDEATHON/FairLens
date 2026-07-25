import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Shield, ArrowRight, UserCheck } from 'lucide-react';

export default function Login() {
  const [activeTab, setActiveTab] = useState('hr');
  const [email, setEmail] = useState('elena.rostova@acmecorp.com');
  const [password, setPassword] = useState('••••••••••••');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (activeTab === 'hr') {
      navigate('/dashboard');
    } else {
      navigate('/employee-portal');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--neutral-bg)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #3FA796, #E85D4E)', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#FFF', marginBottom: '0.75rem' }}>
            FL
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--primary-indigo)' }}>FairLens Access Portal</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>AI-Powered Gender Equality & Workplace Safety</p>
        </div>

        {/* Card */}
        <div className="card" style={{ boxShadow: 'var(--shadow-lg)' }}>
          {/* Tab Switcher */}
          <div className="tab-switcher" style={{ marginBottom: '1.5rem' }}>
            <button 
              className={`tab-btn ${activeTab === 'hr' ? 'active' : ''}`}
              onClick={() => setActiveTab('hr')}
            >
              HR & DEI Leadership
            </button>
            <button 
              className={`tab-btn ${activeTab === 'employee' ? 'active' : ''}`}
              onClick={() => setActiveTab('employee')}
            >
              Anonymous Portal
            </button>
          </div>

          <form onSubmit={handleLogin}>
            {activeTab === 'hr' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Workplace Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Password</label>
                    <a href="#forgot" style={{ fontSize: '0.75rem', color: 'var(--secondary-teal)', textDecoration: 'none' }}>Forgot password?</a>
                  </div>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
                  <span>Authenticate to HR Platform</span>
                  <ArrowRight size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                  <span>OR CONTINUE WITH SSO</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-outline btn-sm">Google Workspace</button>
                  <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-outline btn-sm">Microsoft Entra</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--secondary-teal-light)', color: 'var(--secondary-teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Lock size={28} />
                </div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>Zero-Knowledge Anonymous Access</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  No credentials or identity details required. You will be assigned a temporary cryptographic key.
                </p>
                <button type="submit" className="btn btn-coral" style={{ width: '100%', padding: '0.75rem' }}>
                  <span>Enter Anonymous Safety Portal</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Footer badges */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Shield size={12} /> SOC2 Type II</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><UserCheck size={12} /> GDPR Compliant</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Lock size={12} /> 256-Bit Encrypted</span>
        </div>
      </div>
    </div>
  );
}
